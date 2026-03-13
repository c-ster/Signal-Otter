import type { SupabaseClient } from "@supabase/supabase-js";

export interface GenerationContext {
  profile: {
    full_name: string | null;
    school: string | null;
    major: string | null;
    bio: string | null;
    graduation_date: string | null;
    linkedin_url: string | null;
    github_url: string | null;
    portfolio_url: string | null;
  };
  opportunity: {
    company_name: string;
    role_title: string;
    job_description: string | null;
    company_url: string | null;
    target_industry: string | null;
    why_this_company_md: string | null;
    relevant_experience_ref: string | null;
  };
  evidence: Array<{
    title: string;
    type: string;
    description: string | null;
    url: string | null;
    impact_text: string | null;
  }>;
  candidatePage: {
    id: string;
    status: string;
    headline: string | null;
    recruiter_summary_md: string | null;
    why_this_company_md: string | null;
    evidence_summary_md: string | null;
    thinking_md: string | null;
  };
  miniProject?: {
    id: string;
    template_type: string;
    problem_statement: string | null;
    solution_summary: string | null;
    assumptions_md: string | null;
    app_config_json: Record<string, unknown> | null;
  } | null;
  miniPrd?: { prd_md: string | null } | null;
  miniTodo?: {
    todo_json: Record<string, unknown> | null;
    todo_md: string | null;
  } | null;
}

export async function gatherGenerationContext(
  supabase: SupabaseClient,
  userId: string,
  candidatePageId: string
): Promise<GenerationContext> {
  // Fetch candidate page with its opportunity
  const { data: page, error: pageError } = await supabase
    .from("candidate_pages")
    .select("*")
    .eq("id", candidatePageId)
    .eq("user_id", userId)
    .single();

  if (pageError || !page) {
    throw new Error("Candidate page not found");
  }

  // Parallel fetch: profile, opportunity, evidence, mini_project
  const [profileRes, opportunityRes, evidenceRes, miniProjectRes] =
    await Promise.all([
      supabase
        .from("student_profiles")
        .select("*")
        .eq("user_id", userId)
        .single(),
      supabase
        .from("opportunities")
        .select("*")
        .eq("id", page.opportunity_id)
        .eq("user_id", userId)
        .single(),
      supabase
        .from("evidence_items")
        .select("*")
        .eq("user_id", userId)
        .order("display_order"),
      supabase
        .from("mini_projects")
        .select("*")
        .eq("candidate_page_id", candidatePageId)
        .maybeSingle(),
    ]);

  if (!opportunityRes.data) {
    throw new Error("Opportunity not found");
  }

  const profile = profileRes.data;
  const opportunity = opportunityRes.data;
  const evidence = evidenceRes.data ?? [];
  const miniProject = miniProjectRes.data;

  // Conditionally fetch mini_prd and mini_todo if mini_project exists
  let miniPrd = null;
  let miniTodo = null;

  if (miniProject) {
    const [prdRes, todoRes] = await Promise.all([
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
    ]);
    miniPrd = prdRes.data;
    miniTodo = todoRes.data;
  }

  return {
    profile: {
      full_name: profile?.full_name ?? null,
      school: profile?.school ?? null,
      major: profile?.major ?? null,
      bio: profile?.bio ?? null,
      graduation_date: profile?.graduation_date ?? null,
      linkedin_url: profile?.linkedin_url ?? null,
      github_url: profile?.github_url ?? null,
      portfolio_url: profile?.portfolio_url ?? null,
    },
    opportunity: {
      company_name: opportunity.company_name,
      role_title: opportunity.role_title,
      job_description: opportunity.job_description,
      company_url: opportunity.company_url,
      target_industry: opportunity.target_industry,
      why_this_company_md: opportunity.why_this_company_md,
      relevant_experience_ref: opportunity.relevant_experience_ref,
    },
    evidence: evidence.map(
      (e: {
        title: string;
        type: string;
        description: string | null;
        url: string | null;
        impact_text: string | null;
      }) => ({
        title: e.title,
        type: e.type,
        description: e.description,
        url: e.url,
        impact_text: e.impact_text,
      })
    ),
    candidatePage: {
      id: page.id,
      status: page.status,
      headline: page.headline,
      recruiter_summary_md: page.recruiter_summary_md,
      why_this_company_md: page.why_this_company_md,
      evidence_summary_md: page.evidence_summary_md,
      thinking_md: page.thinking_md,
    },
    miniProject: miniProject
      ? {
          id: miniProject.id,
          template_type: miniProject.template_type,
          problem_statement: miniProject.problem_statement,
          solution_summary: miniProject.solution_summary,
          assumptions_md: miniProject.assumptions_md,
          app_config_json: miniProject.app_config_json,
        }
      : null,
    miniPrd: miniPrd ? { prd_md: miniPrd.prd_md } : null,
    miniTodo: miniTodo
      ? { todo_json: miniTodo.todo_json, todo_md: miniTodo.todo_md }
      : null,
  };
}
