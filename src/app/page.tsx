import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <span className="font-bold text-lg tracking-tight">
            Signal Otter
          </span>
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

      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="max-w-2xl text-center space-y-8">
          <div className="space-y-4">
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              For students &amp; early-career candidates
            </p>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Show recruiters what you can{" "}
              <span className="text-primary">build</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              Create company-specific capability pages with AI-generated
              narratives and interactive prototypes. Replace your resume with a
              demonstration of your thinking.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button size="lg" render={<Link href="/signup" />}>
              Create Your First Page
            </Button>
            <Button
              size="lg"
              variant="outline"
              render={<Link href="/login" />}
            >
              Sign In
            </Button>
          </div>

          <div className="grid gap-8 sm:grid-cols-3 text-left pt-12 border-t">
            <div className="space-y-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-lg">
                1
              </div>
              <h3 className="font-semibold">Target a company</h3>
              <p className="text-sm text-muted-foreground">
                Pick a company and role. AI identifies relevant problems and
                generates a mini-PRD tailored to the opportunity.
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-lg">
                2
              </div>
              <h3 className="font-semibold">Build a prototype</h3>
              <p className="text-sm text-muted-foreground">
                Get an interactive demo from 6 templates — dashboards,
                simulators, and AI tools — customized to the company.
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-lg">
                3
              </div>
              <h3 className="font-semibold">Share your page</h3>
              <p className="text-sm text-muted-foreground">
                Publish a shareable URL that recruiters can review in minutes —
                no signup required.
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t py-6 text-center text-xs text-muted-foreground">
        Signal Otter — Capability pages for early-career candidates
      </footer>
    </div>
  );
}
