import { redirect } from "next/navigation";

type SearchParams = Record<string, string | string[] | undefined>;

function buildQuery(params: SearchParams) {
  const paramsArr = Object.entries(params).flatMap(([key, value]) => {
    if (value === undefined) return [];
    if (Array.isArray(value)) return value.map((item) => `${encodeURIComponent(key)}=${encodeURIComponent(item)}`);
    return [`${encodeURIComponent(key)}=${encodeURIComponent(value)}`];
  });
  return paramsArr.length ? `?${paramsArr.join("&")}` : "";
}

export default function ChatPage({ searchParams }: { searchParams: SearchParams }) {
  redirect(`/chat/default${buildQuery(searchParams)}`);
}
