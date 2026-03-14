import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { CandidatePageStatus } from "@/types/database";

const statusLabels: Record<CandidatePageStatus, string> = {
  draft: "Draft",
  intake_complete: "Intake Complete",
  problem_selected: "Problem Selected",
  narrative_generated: "Narrative Ready",
  prd_generated: "PRD Ready",
  todo_generated: "To-Do Ready",
  mini_app_generated: "App Ready",
  two_week_plan_generated: "Plan Ready",
  published: "Published",
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const [{ data: profile }, { data: opportunities }, { data: evidenceCount }] =
    await Promise.all([
      supabase
        .from("student_profiles")
        .select("*")
        .eq("user_id", user.id)
        .single(),
      supabase
        .from("opportunities")
        .select("*, candidate_pages(id, status)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5),
      supabase
        .from("evidence_items")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id),
    ]);

  // Calculate profile completion
  const profileFields = [
    profile?.full_name,
    profile?.school,
    profile?.major,
    profile?.bio,
    profile?.linkedin_url,
  ];
  const filledFields = profileFields.filter(Boolean).length;
  const profileComplete = filledFields === profileFields.length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">
          {profile?.full_name
            ? `Welcome back, ${profile.full_name}`
            : "Welcome to Signal Otter"}
        </h1>
        <p className="text-muted-foreground">
          Build company-specific capability pages that demonstrate your skills.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Profile
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {filledFields}/{profileFields.length}
            </p>
            <p className="text-xs text-muted-foreground">fields completed</p>
            {!profileComplete && (
              <Button size="sm" variant="outline" className="mt-3" render={<Link href="/profile" />}>
                Complete Profile
              </Button>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Opportunities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {opportunities?.length ?? 0}
            </p>
            <p className="text-xs text-muted-foreground">target companies</p>
            <Button size="sm" variant="outline" className="mt-3" render={<Link href="/opportunities/new" />}>
              Add Opportunity
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Evidence Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{evidenceCount?.length ?? 0}</p>
            <p className="text-xs text-muted-foreground">portfolio items</p>
            <Button size="sm" variant="outline" className="mt-3" render={<Link href="/profile" />}>
              Manage Evidence
            </Button>
          </CardContent>
        </Card>
      </div>

      {(!opportunities || opportunities.length === 0) && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <h3 className="text-lg font-semibold">
              Create your first opportunity
            </h3>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              Target a specific company and role to generate your first
              AI-powered capability page.
            </p>
            <Button className="mt-4" render={<Link href="/opportunities/new" />}>
              Add Opportunity
            </Button>
          </CardContent>
        </Card>
      )}

      {opportunities && opportunities.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Recent Opportunities</h2>
            <Button variant="ghost" size="sm" render={<Link href="/opportunities" />}>
              View All
            </Button>
          </div>
          <div className="space-y-2">
            {opportunities.map((opp) => {
              const page = Array.isArray(opp.candidate_pages)
                ? opp.candidate_pages[0]
                : opp.candidate_pages;
              return (
                <Link
                  key={opp.id}
                  href={`/opportunities/${opp.id}`}
                  className="flex items-center justify-between rounded-lg border p-4 hover:bg-muted/50 transition-colors"
                >
                  <div>
                    <p className="font-medium">{opp.company_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {opp.role_title}
                    </p>
                  </div>
                  {page && (
                    <Badge
                      variant={
                        page.status === "published" ? "default" : "secondary"
                      }
                    >
                      {statusLabels[page.status as CandidatePageStatus]}
                    </Badge>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
