"use client";

import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";

type Props = {
  sessionId: string;
  content: string;
  useRag: boolean;
  thinkingMode: boolean;
  onDone: () => void;
};

export default function StreamingMessage({ sessionId, content, useRag, thinkingMode, onDone }: Props) {
  const [sources, setSources] = useState<{ filename: string; text: string }[]>([]);
  const [thinking, setThinking] = useState("");
  const [answer, setAnswer] = useState("");
  const controllerRef = useRef<AbortController | null>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    // EventSource only supports GET by default, so the spec's POST-based
    // streaming endpoint needs either: (a) a backend that accepts query params
    // on a GET variant, or (b) fetch() with manual stream reading (shown below
    // as the more common real-world pattern for POST+SSE).
    streamViaFetch();

    return () => {
      isMountedRef.current = false;
      controllerRef.current?.abort();
    };
  }, [sessionId, content, useRag, thinkingMode, onDone]);

  async function streamViaFetch() {
    const token = localStorage.getItem("access_token");
    controllerRef.current = new AbortController();

    const remoteUrl = `${process.env.NEXT_PUBLIC_API_URL}/chat/sessions/${sessionId}/messages`;
    const localUrl = "/api/chat";
    const body = JSON.stringify({ content, use_rag: useRag, thinking_mode: thinkingMode });

    async function doFetch(url: string) {
      const signal = controllerRef.current?.signal;
      return fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(url !== localUrl && token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body,
        signal,
      });
    }

    let res: Response | null = null;

    try {
      res = await doFetch(remoteUrl);
      if (!res.ok) {
        throw new Error("Remote chat endpoint unavailable");
      }
    } catch (error) {
      try {
        res = await doFetch(localUrl);
        if (!res.ok) {
          console.error("Local chat fallback failed", res.statusText);
          return;
        }
      } catch (fallbackError) {
        console.error("Chat streaming failed", fallbackError);
        return;
      }
    }

    if (!res.body) return;

    try {
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        if (!isMountedRef.current) break;

        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n"); // SSE events are separated by blank lines
        buffer = lines.pop() ?? ""; // keep any incomplete trailing chunk for next read

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const raw = line.slice(6).trim();

          if (raw === "[DONE]") {
            if (isMountedRef.current) onDone();
            return;
          }

          // The spec sends 3 different shapes — check which key is present
          const parsed = JSON.parse(raw);
          if (isMountedRef.current) {
            if ("sources" in parsed) {
              setSources(parsed.sources);
            } else if ("thinking" in parsed) {
              setThinking((prev) => prev + parsed.thinking);
            } else if ("delta" in parsed) {
              setAnswer((prev) => prev + parsed.delta);
            }
          }
        }
      }
    } catch (error) {
      if (error instanceof Error && error.name !== "AbortError") {
        console.error("Stream error:", error);
      }
    } finally {
      if (isMountedRef.current) onDone();
    }
  }

  return (
    <div className="max-w-[80%]">
      {/* Sources box — only rendered if RAG returned anything */}
      {sources.length > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-2 mb-2 text-xs">
          <p className="font-semibold text-blue-700 dark:text-blue-300 mb-1">📎 Sources</p>
          <div className="flex flex-wrap gap-1">
            {sources.map((s, i) => (
              <span key={i} className="bg-white dark:bg-gray-800 border border-blue-200 dark:border-blue-700 rounded px-2 py-0.5 text-blue-700 dark:text-blue-300">
                {s.filename}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Reasoning box — only rendered if thinking_mode was on */}
      {thinking && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-2 mb-2 text-xs italic text-amber-800 dark:text-amber-300">
          <p className="font-semibold not-italic mb-1">💡 Reasoning</p>
          {thinking}
        </div>
      )}

      {/* The actual answer, rendered as markdown */}
      <div className="bg-gray-100 dark:bg-gray-800 rounded-xl rounded-bl-sm px-3 py-2 text-sm prose prose-sm dark:prose-invert max-w-none">
        <ReactMarkdown
          components={{
            code({ className, children, ...props }) {
              const isBlock = /language-(\w+)/.test(className || "");
              return isBlock ? (
                <pre>
                  {children}
                </pre>
              ) : (
                <code>{children}</code>
              );
            },
          }}
        >
          {answer}
        </ReactMarkdown>
      </div>
    </div>
  );
}