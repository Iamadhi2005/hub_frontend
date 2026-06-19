"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Paperclip, FileText, X } from "lucide-react";

// Define the shape of our message objects
export type Message = {
  id: string;
  role: "user" | "ai";
  text: string;
  files?: string[];
  timestamp: Date;
};

export default function AIChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to the bottom when new tokens arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle file picker selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachedFiles((prev) => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  // Remove file chip before sending
  const removeFile = (index: number) => {
    setAttachedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // The Core Streaming Function (Fixed Syntax)
  async function streamReply(prompt: string, aiMsgId: string) {
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      if (!res.body) return;

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";

      // Asynchronous stream loop
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const token = line.slice(6).trim(); 
            if (token === "[DONE]") break;

            // Add spaces back gracefully between streaming tokens
            accumulated += (accumulated ? " " : "") + token;

            // Target the specific placeholder message and update its text live
            setMessages((prev) =>
              prev.map((m) =>
                m.id === aiMsgId ? { ...m, text: accumulated } : m
              )
            );
          }
        }
      }
    } catch (err) {
      console.error("Streaming encountered an issue:", err);
    }
  }

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isStreaming || (!input.trim() && attachedFiles.length === 0)) return;

    const currentInput = input;
    const currentFiles = [...attachedFiles];

    // 1. Post user's prompt to message thread instantly
    const userMsgId = crypto.randomUUID();
    setMessages((prev) => [
      ...prev,
      {
        id: userMsgId,
        role: "user",
        text: currentInput,
        files: currentFiles.map((f) => f.name),
        timestamp: new Date(),
      },
    ]);

    setInput("");
    setAttachedFiles([]);
    setIsStreaming(true);

    // 2. Insert empty placeholder message for the AI response bubble
    const aiMsgId = crypto.randomUUID();
    setMessages((prev) => [
      ...prev,
      { id: aiMsgId, role: "ai", text: "Thinking...", timestamp: new Date() },
    ]);

    // 3. Trigger stream reader chunk accumulator
    await streamReply(currentInput, aiMsgId);
    setIsStreaming(false);
  };

  return (
    <div className="flex h-screen bg-cixio-bg dark:bg-gray-950 text-cixio-dark dark:text-gray-100">
      <div className="flex flex-col flex-1 h-full max-w-4xl mx-auto p-4 justify-between">
        {/* Messages Header */}
        <div className="py-2 border-b border-cixio-light dark:border-gray-700 mb-4">
          <h1 className="text-xl font-semibold text-cixio-dark dark:text-gray-100">Cixio Engine Chat</h1>
          <p className="text-xs text-cixio-muted dark:text-gray-400">Local execution context layer</p>
        </div>

        {/* Message View Area */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-xl px-4 py-3 rounded-2xl text-sm shadow-sm ${
                  msg.role === "user"
                    ? "bg-cixio-blue text-white rounded-br-none"
                    : "bg-cixio-light border border-cixio-light text-cixio-dark rounded-bl-none"
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.text}</p>
                {msg.files && msg.files.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-black/10 dark:border-white/10 space-y-1">
                    {msg.files.map((name, index) => (
                      <div key={index} className="flex items-center gap-1 text-xs opacity-80 font-mono">
                        <FileText size={12} />
                        <span className="truncate max-w-[180px]">{name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Action Panel / Input Box Form */}
        <form onSubmit={handleSend} className="mt-4 p-3 bg-white dark:bg-gray-900 rounded-xl border border-cixio-light dark:border-gray-700 shadow-sm space-y-2">
          {/* File Attachment Chips Queue */}
          {attachedFiles.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {attachedFiles.map((file, idx) => (
                <div key={idx} className="flex items-center gap-1.5 bg-cixio-light/50 px-2.5 py-1 rounded-lg text-xs font-medium text-cixio-navy border border-cixio-light">
                  <FileText size={12} className="text-cixio-blue" />
                  <span className="max-w-[150px] truncate">{file.name}</span>
                  <button type="button" onClick={() => removeFile(idx)} className="text-cixio-muted hover:text-red-500 ml-0.5">
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center gap-2">
            <input
              type="file"
              multiple
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              type="button"
              disabled={isStreaming}
              onClick={() => fileInputRef.current?.click()}
              className="p-2 text-cixio-muted hover:text-cixio-blue hover:bg-cixio-light rounded-lg transition-colors"
            >
              <Paperclip size={20} />
            </button>

            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={isStreaming ? "Awaiting stream block closure..." : "Ask anything..."}
              disabled={isStreaming}
              className="flex-1 bg-transparent px-2 py-1 text-sm outline-none placeholder:text-cixio-muted dark:placeholder:text-gray-400"
            />

            <button
              type="submit"
              disabled={isStreaming || (!input.trim() && attachedFiles.length === 0)}
              className="p-2 bg-cixio-blue hover:bg-cixio-hover text-white rounded-lg disabled:opacity-30 transition-all flex items-center justify-center"
            >
              <Send size={16} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}