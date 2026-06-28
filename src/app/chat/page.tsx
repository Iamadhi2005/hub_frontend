"use client";

import { useEffect, Suspense, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSessions, useCreateSession } from "@/hooks/useChat";

function ChatPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: sessions, isLoading } = useSessions();
  const { mutate: createSession, isPending } = useCreateSession();
  const creationAttempted = useRef(false);

  useEffect(() => {
    if (!isLoading && !isPending && !creationAttempted.current) {
      const queryString = searchParams.toString();
      const target = queryString ? `/chat/default?${queryString}` : "/chat/default";

      // If there are existing sessions, redirect to the first one
      if (sessions && sessions.length > 0) {
        creationAttempted.current = true;
        router.push(target);
      } else {
        // Otherwise create a new session
        creationAttempted.current = true;
        createSession(undefined, {
          onSuccess: () => {
            router.push(target);
          },
          onError: () => {
            creationAttempted.current = false;
          }
        });
      }
    }
  }, [sessions, isLoading, isPending, createSession, router, searchParams]);

  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-cixio-blue mb-4"></div>
        <p className="text-gray-500 dark:text-gray-400">Loading chat...</p>
      </div>
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-cixio-blue mb-4"></div>
          <p className="text-gray-500 dark:text-gray-400">Loading chat...</p>
        </div>
      </div>
    }>
      <ChatPageContent />
    </Suspense>
  );
}
