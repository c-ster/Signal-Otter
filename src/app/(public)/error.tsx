"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function PublicError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center text-center">
      <h2 className="text-2xl font-bold">This page couldn&apos;t be loaded</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Something went wrong while loading this page.
      </p>
      <div className="mt-6 flex gap-3">
        <Button onClick={reset} variant="outline">
          Try again
        </Button>
        <Button render={<Link href="/" />}>Go Home</Button>
      </div>
    </div>
  );
}
