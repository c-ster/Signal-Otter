import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { OpportunityForm } from "@/components/forms/opportunity-form";
import { Badge } from "@/components/ui/badge";
import { PipelineCard } from "@/components/generation/pipeline-card";
import { isAIConfigured } from "@/lib/ai/client";
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

  // Fetch generation-related data if candidate page exists
  let miniProject = null;
  let miniPrd = null;
  let miniTodo = null;
  let twoWeekPlan = null;

  if (candidatePage) {
    const { data: mp } = await supabase
      .from("mini_projects")
      .select("*")
      .eq("candidate_page_id", candidatePage.id)
      .maybeSingle();

    miniProject = mp;

    if (miniProject) {
      const [prdRes, todoRes, planRes] = await Promise.all([
        supabase
          .from("mini_prds")
          .select("*")
          .eq("mini_project_id", miniProject.id)
          .maybeSingle(),
        supabase
          .from("mini_todos")
          .select("*")
          .eq("mini_project_id", miniProject.id)
          .maybeSingle(),
        supabase
          .from("two_week_plans")
          .select("*")
          .eq("mini_project_id", miniProject.id)
          .maybeSingle(),
      ]);

      miniPrd = prdRes.data;
      miniTodo = todoRes.data;
      twoWeekPlan = planRes.data;
    }
  }

  const aiConfigured = isAIConfigured();
  const hasRequiredFields = !!(
    opportunity.company_name &&
    opportunity.role_title &&
    opportunity.job_description
  );

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
        <PipelineCard
          candidatePage={candidatePage}
          miniProject={miniProject}
          miniPrd={miniPrd}
          miniTodo={miniTodo}
          twoWeekPlan={twoWeekPlan}
          aiConfigured={aiConfigured}
          hasRequiredFields={hasRequiredFields}
        />
      )}
    </div>
  );
}
