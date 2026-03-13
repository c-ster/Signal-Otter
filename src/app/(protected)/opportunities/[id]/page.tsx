import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { OpportunityForm } from "@/components/forms/opportunity-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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

export default async function OpportunityDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: opportunity } = await supabase
    .from("opportunities")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!opportunity) notFound();

  const { data: candidatePage } = await supabase
    .from("candidate_pages")
    .select("*")
    .eq("opportunity_id", id)
    .single();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            {opportunity.company_name} — {opportunity.role_title}
          </h1>
          {candidatePage && (
            <Badge
              variant={
                candidatePage.status === "published" ? "default" : "secondary"
              }
              className="mt-1"
            >
              {statusLabels[candidatePage.status as CandidatePageStatus]}
            </Badge>
          )}
        </div>
      </div>

      <OpportunityForm opportunity={opportunity} />

      {candidatePage && (
        <Card>
          <CardHeader>
            <CardTitle>Candidate Page Pipeline</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Your candidate page is in{" "}
              <strong>
                {statusLabels[candidatePage.status as CandidatePageStatus]}
              </strong>{" "}
              status. Use the AI generation tools to build your page step by
              step.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button disabled>
                Generate Problem & Template (Phase B)
              </Button>
              <Button disabled variant="outline">
                Generate Summary (Phase B)
              </Button>
              <Button disabled variant="outline">
                Generate PRD (Phase B)
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              AI generation features coming in Phase B.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
