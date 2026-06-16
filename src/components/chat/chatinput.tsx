"use client";

import { useState, useRef } from "react";

type Props = {
  onSend: (text: string, files: File[]) => void;
  disabled: boolean;
};

export default function ChatInput({ onSend, disabled }: Props) {
  const [text, setText] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  function handleSend() {
    if (!text.trim() || disabled) return;
    onSend(text, files);   // pass message + attached files up to the page
    setText("");
    setFiles([]);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    // Enter sends, Shift+Enter adds a new line
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = Array.from(e.target.files ?? []);
    setFiles((prev) => [...prev, ...picked]);
  }

  return (
    <div className="p-4 border-t border-gray-200">
      {/* Show chips for attached files */}
      {files.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {files.map((f, i) => (
            <span key={i} className="text-xs bg-gray-100 px-2 py-1 rounded-md flex items-center gap-1">
              {f.name}
              <button onClick={() => setFiles(files.filter((_, j) => j !== i))}>×</button>
            </span>
          ))}
        </div>
      )}

      <div className="flex gap-2 items-end">
        {/* Hidden file input — triggered by the clip button */}
        <input ref={fileRef} type="file" multiple className="hidden" onChange={handleFileChange} />
        <button onClick={() => fileRef.current?.click()} className="p-2 border rounded-lg text-gray-500 hover:bg-gray-50">
          📎
        </button>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask anything…"
          rows={1}
          className="flex-1 border rounded-xl px-3 py-2 text-sm resize-none focus:outline-none"
        />

        <button
          onClick={handleSend}
          disabled={disabled || !text.trim()}
          className="p-2 bg-cixio-blue text-white rounded-lg disabled:opacity-40 hover:bg-cixio-hover transition-colors"
        >
          ➤
        </button>
      </div>
    </div>
  );
}