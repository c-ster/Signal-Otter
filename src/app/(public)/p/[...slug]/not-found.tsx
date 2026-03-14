import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function PublicPageNotFound() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center text-center">
      <h2 className="text-2xl font-bold">Candidate page not found</h2>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        This candidate page doesn&apos;t exist or has been unpublished by the
        author.
      </p>
      <Button className="mt-6" render={<Link href="/" />}>
        Go to Signal Otter
      </Button>
    </div>
  );
}
