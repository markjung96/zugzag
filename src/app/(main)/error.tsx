"use client";

import { Button } from "@/components/ui/button";

export default function MainError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="flex min-h-[calc(100vh-5rem)] flex-col bg-background">
      <div className="flex flex-1 flex-col items-center justify-center gap-6 px-4">
        <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-destructive/10">
          <svg className="h-12 w-12 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <div className="text-center">
          <h3 className="mb-2 text-lg font-bold text-destructive">문제가 발생했습니다</h3>
          <p className="text-sm text-muted-foreground">
            일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.
          </p>
        </div>
        <Button onClick={reset} className="rounded-xl px-5">
          다시 시도
        </Button>
      </div>
    </div>
  );
}
