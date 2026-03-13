import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <span className="font-semibold text-lg">Signal Otter</span>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" render={<Link href="/login" />}>
              Sign In
            </Button>
            <Button size="sm" render={<Link href="/signup" />}>
              Get Started
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4">
        <div className="max-w-2xl text-center space-y-8">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Show recruiters what you can build
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Signal Otter helps students and early-career candidates create
            company-specific capability pages with interactive prototypes.
            Instead of a resume, give recruiters a demonstration of your
            thinking and initiative.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Button size="lg" render={<Link href="/signup" />}>
              Create Your First Page
            </Button>
            <Button size="lg" variant="outline" render={<Link href="/login" />}>
              Sign In
            </Button>
          </div>

          <div className="grid gap-6 sm:grid-cols-3 text-left pt-8">
            <div className="space-y-2">
              <h3 className="font-semibold">Target a company</h3>
              <p className="text-sm text-muted-foreground">
                Pick a company and role. AI suggests relevant problems and
                generates a mini-PRD.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold">Build a prototype</h3>
              <p className="text-sm text-muted-foreground">
                Get a working interactive demo from 6 templates, customized
                to the company.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold">Share your page</h3>
              <p className="text-sm text-muted-foreground">
                Publish a shareable URL that recruiters can review in 2-4
                minutes without signing up.
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t py-6 text-center text-sm text-muted-foreground">
        Signal Otter — Capability pages for early-career candidates
      </footer>
    </div>
  );
}
