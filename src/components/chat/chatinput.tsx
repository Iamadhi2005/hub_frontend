"use client";

import { useState } from "react";

type Props = {
  onSend: (text: string, useRag: boolean, thinkingMode: boolean) => void;
  disabled: boolean;
};

export default function ChatInput({ onSend, disabled }: Props) {
  const [text, setText] = useState("");
  const [useRag, setUseRag] = useState(false);
  const [thinkingMode, setThinkingMode] = useState(false);

  function handleSend() {
    if (!text.trim() || disabled) return;
    onSend(text, useRag, thinkingMode);
    setText("");
  }

  return (
    <div className="p-3 border-t border-cixio-light dark:border-slate-800 bg-white dark:bg-slate-900">
      <div className="flex gap-2 mb-2">
        {/* RAG Context Attachment Button */}
        <button
          type="button"
          onClick={() => setUseRag((v) => !v)}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs border transition-all ${
            useRag
              ? "bg-cixio-light border-cixio-blue text-cixio-blue font-medium"
              : "border-slate-300 text-slate-500 dark:border-slate-600 dark:text-slate-400"
          }`}
        >
          📎 Local Knowledge (RAG)
        </button>

        {/* Deep Reasoner Execution Button */}
        <button
          type="button"
          onClick={() => setThinkingMode((v) => !v)}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs border transition-all ${
            thinkingMode
              ? "bg-cixio-light border-cixio-blue text-cixio-blue font-medium"
              : "border-slate-300 text-slate-500 dark:border-slate-600 dark:text-slate-400"
          }`}
        >
          💡 Deep Reasoning (Thinking)
        </button>
      </div>

      <div className="flex gap-2 items-end">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          disabled={disabled}
          placeholder="Ask your smart hub anything..."
          rows={1}
          className="flex-1 border border-cixio-light dark:border-slate-700 rounded-xl px-3 py-2 text-sm resize-none bg-cixio-bg/20 dark:bg-slate-950 focus:border-cixio-blue focus:ring-1 focus:ring-cixio-blue text-cixio-dark dark:text-slate-100 outline-none transition-all"
        />
        <button
          type="button"
          onClick={handleSend}
          disabled={disabled || !text.trim()}
          className="px-4 py-2 bg-cixio-blue hover:bg-cixio-hover disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-400 text-white font-medium rounded-xl transition-colors"
        >
          ➤
        </button>
      </div>
    </div>
  );
}