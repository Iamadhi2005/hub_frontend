"use client";

import { useState, useEffect } from "react";
import { DocumentFile } from "@/types/document";
import DocumentGrid from "./DocumentGrid";
import DocumentList from "./DocumentList";

type Props = {
  initialDocuments: DocumentFile[];
  fetchError: string | null;
};

export default function DocumentBrowser({ initialDocuments, fetchError }: Props) {
  const [view, setView] = useState<"grid" | "list">("grid");
  const [documents, setDocuments] = useState(initialDocuments);

  // Only poll if there's something pending — and only if we successfully
  // loaded data in the first place (no point polling if backend is down)
  useEffect(() => {
    if (fetchError) return;
    const hasPending = documents.some((d) => d.ragStatus === "processing" || d.ragStatus === "queued");
    if (!hasPending) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch("/api/documents/status");
        if (!res.ok) return;
        const updated: DocumentFile[] = await res.json();
        setDocuments(updated);
      } catch {
        // backend still not reachable — just skip this tick, don't crash
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [documents, fetchError]);

  function formatSize(bytes: number) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-lg font-medium">Documents</h1>
          <p className="text-sm text-gray-500">
            {fetchError
              ? "Unable to load documents"
              : `${documents.length} file${documents.length === 1 ? "" : "s"}${
                  documents.filter((d) => d.ragStatus === "processing").length
                    ? ` · ${documents.filter((d) => d.ragStatus === "processing").length} processing`
                    : ""
                }`}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex border rounded-md overflow-hidden dark:border-gray-700">
            <button onClick={() => setView("grid")} className={`px-3 py-1.5 ${view === "grid" ? "bg-purple-600 text-white" : "bg-white dark:bg-gray-900"}`}>⊞</button>
            <button onClick={() => setView("list")} className={`px-3 py-1.5 ${view === "list" ? "bg-purple-600 text-white" : "bg-white dark:bg-gray-900"}`}>☰</button>
          </div>
          <button className="px-3 py-1.5 bg-purple-600 text-white rounded-md text-sm">Upload</button>
        </div>
      </div>

      {/* STATE 1: backend unreachable */}
      {fetchError && (
        <div className="border border-dashed rounded-xl p-10 text-center dark:border-gray-700">
          <p className="text-sm text-gray-500 mb-1">Couldn't reach the document service</p>
          <p className="text-xs text-gray-400">{fetchError} — check that your FastAPI backend is running on port 8000</p>
        </div>
      )}

      {/* STATE 2: no files uploaded yet */}
      {!fetchError && documents.length === 0 && (
        <div className="border border-dashed rounded-xl p-10 text-center dark:border-gray-700">
          <p className="text-sm text-gray-500 mb-1">No documents yet</p>
          <p className="text-xs text-gray-400">Upload a file to get started — it'll be chunked and embedded for AI chat automatically</p>
        </div>
      )}

      {/* STATE 3: actual files */}
      {!fetchError && documents.length > 0 && (
        view === "grid" ? (
          <DocumentGrid documents={documents} formatSize={formatSize} />
        ) : (
          <DocumentList documents={documents} formatSize={formatSize} />
        )
      )}
    </div>
  );
}