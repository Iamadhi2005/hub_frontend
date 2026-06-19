import DocumentBrowser from "@/components/documents/DocumentBrowser";
import { DocumentFile } from "@/types/document";

async function getDocuments(): Promise<{ documents: DocumentFile[]; error: string | null }> {
  try {
    const res = await fetch("http://localhost:8000/api/v1/documents", {
      // headers: { Authorization: `Bearer ${token}` }, // add once auth is wired
      cache: "no-store", // always get fresh data, never stale
    });

    if (!res.ok) {
      return { documents: [], error: `Server responded with ${res.status}` };
    }

    const documents: DocumentFile[] = await res.json();
    return { documents, error: null };
  } catch (err) {
    // This is what fires when the backend isn't running at all
    // (ERR_CONNECTION_REFUSED becomes a thrown error in fetch)
    return { documents: [], error: "Could not connect to the backend" };
  }
}

export default async function DocumentsPage() {
  const { documents, error } = await getDocuments();

  return (
    <DocumentBrowser initialDocuments={documents as any} initialError={error} />
  );
}
