"use client";

import ReactMarkdown from "react-markdown";

type Props = {
  content: string;
};

export default function AIMessage({ content }: Props) {
  return (
    <div className="bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-xl px-4 py-3 text-sm max-w-[80%] break-words prose prose-sm dark:prose-invert">
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  );
}
