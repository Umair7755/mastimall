"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/Button";

export default function Error({ error, reset }) {
  useEffect(() => {
    if (error) console.error("[masti-mall]", error);
  }, [error]);

  return (
    <div className="mx-auto max-w-lg px-4 py-20 text-center">
      <h1 className="font-display text-4xl">Something went wrong.</h1>
      <p className="mt-3 text-ink-muted">Please try that again.</p>
      {process.env.NODE_ENV === "development" && error?.message ? (
        <p className="mt-3 break-words rounded-xl bg-rose-50 px-3 py-2 text-left text-xs text-rose-700">
          {error.message}
        </p>
      ) : null}
      <Button className="mt-6" onClick={() => reset()}>
        Try again
      </Button>
    </div>
  );
}
