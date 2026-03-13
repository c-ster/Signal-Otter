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

export default async function OpportunitiesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: opportunities } = await supabase
    .from("opportunities")
    .select("*, candidate_pages(id, status, slug)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Opportunities</h1>
          <p className="text-muted-foreground">
            Target companies and roles you want to apply to.
          </p>
        </div>
        <Button render={<Link href="/opportunities/new" />}>
          New Opportunity
        </Button>
      </div>

      {!opportunities || opportunities.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">
              No opportunities yet. Create your first one to get started.
            </p>
            <Button render={<Link href="/opportunities/new" />}>
              Create Opportunity
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {opportunities.map((opp) => {
            const page = Array.isArray(opp.candidate_pages)
              ? opp.candidate_pages[0]
              : opp.candidate_pages;
            return (
              <Link key={opp.id} href={`/opportunities/${opp.id}`}>
                <Card className="hover:border-foreground/20 transition-colors cursor-pointer h-full">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-lg">
                        {opp.company_name}
                      </CardTitle>
                      {page && (
                        <Badge
                          variant={
                            page.status === "published"
                              ? "default"
                              : "secondary"
                          }
                          className="shrink-0"
                        >
                          {statusLabels[page.status as CandidatePageStatus]}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {opp.role_title}
                    </p>
                  </CardHeader>
                  <CardContent>
                    {opp.target_industry && (
                      <p className="text-sm text-muted-foreground">
                        {opp.target_industry}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-2">
                      Created{" "}
                      {new Date(opp.created_at).toLocaleDateString()}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
