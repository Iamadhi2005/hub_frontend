"use client";

import { useEffect, useRef, useState } from "react";
import { useSessions, useMessages } from "@/hooks/useChat";
import NewChatButton from "@/components/chat/newchatbutton";
import ChatInput from "@/components/chat/ChatInput";
import StreamingMessage from "@/components/chat/StreamingMessage";
import AIMessage from "@/components/chat/AIMessage";

export default function ChatSessionPage() {
  const { data: sessions, isLoading: sessionsLoading } = useSessions();
  const sessionId = sessions?.[0]?.id ?? "";
  const { data: messages, isLoading: messagesLoading } = useMessages(sessionId || null);
  const isLoading = sessionsLoading || messagesLoading;
  const [streaming, setStreaming] = useState<{ content: string; useRag: boolean; thinkingMode: boolean } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when new messages arrive or streaming updates
  useEffect(() => {
    const scrollToBottom = () => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    // Use setTimeout to ensure DOM updates are complete
    const timer = setTimeout(scrollToBottom, 100);
    return () => clearTimeout(timer);
  }, [messages, streaming]);

  function handleSend(text: string, useRag: boolean, thinkingMode: boolean) {
    setStreaming({ content: text, useRag, thinkingMode });
  }

  const currentSession = sessions?.find((s) => s.id === sessionId);

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-950">
      {/* Demo Banner */}
      <div className="px-4 py-2 bg-amber-50 dark:bg-amber-900/20 border-b border-amber-200 dark:border-amber-800 text-xs text-amber-700 dark:text-amber-300">
        ⚠️ Demo Mode: Using mock data. Connect your backend to use real chat API.
      </div>

      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-900">
        <h1 className="text-sm font-semibold text-gray-900 dark:text-white">
          {currentSession?.title ?? "Conversation"}
        </h1>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
          {currentSession?.created_at && new Date(currentSession.created_at).toLocaleDateString()}
        </p>
      </div>

      {/* Messages Container */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth"
      >
        {isLoading && (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-gray-400">Loading messages…</p>
          </div>
        )}

        {!isLoading && messages && messages.length === 0 && !streaming && (
          <div className="flex flex-col items-center justify-center h-full text-center text-gray-400">
            <p className="text-base mb-2">✨ Start a new conversation</p>
            <p className="text-sm text-gray-500">Type a message below to begin</p>
          </div>
        )}

        {/* Historical Messages */}
        {messages?.map((m) => (
          <div
            key={m.id}
            className={`flex gap-3 ${m.role === "user" ? "justify-end" : "justify-start"}`}
          >
            {m.role === "assistant" && (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                <span className="text-xs text-white font-bold">AI</span>
              </div>
            )}

            <div className="flex flex-col gap-1">
              {m.role === "assistant" ? (
                <AIMessage content={m.content} />
              ) : (
                <div className="bg-purple-600 text-white rounded-xl rounded-tr-sm px-4 py-3 text-sm max-w-[80%] break-words">
                  {m.content}
                </div>
              )}
            </div>

            {m.role === "user" && (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
                <span className="text-xs text-white font-bold">U</span>
              </div>
            )}
          </div>
        ))}

        {/* Streaming Message */}
        {streaming && sessionId && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0 animate-pulse">
              <span className="text-xs text-white font-bold">AI</span>
            </div>
            <StreamingMessage
              sessionId={sessionId}
              content={streaming.content}
              useRag={streaming.useRag}
              thinkingMode={streaming.thinkingMode}
              onDone={() => setStreaming(null)}
            />
          </div>
        )}

        {/* Scroll anchor */}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <ChatInput onSend={handleSend} disabled={!!streaming} />
    </div>
  );
}