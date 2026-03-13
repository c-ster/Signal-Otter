"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import {
  callClaude,
  extractJSON,
  isAIConfigured,
  shouldUseMock,
  LONG_MAX_TOKENS,
} from "@/lib/ai/client";
import { gatherGenerationContext } from "@/lib/ai/context";
import {
  createRun,
  markRunning,
  markCompleted,
  markFailed,
} from "@/lib/ai/generation-run";
import { getMockResponse } from "@/lib/ai/mock";
import {
  buildProblemTemplatePrompt,
  buildRecruiterSummaryPrompt,
  buildWhyThisCompanyPrompt,
  buildEvidenceSummaryPrompt,
  buildMiniPrdPrompt,
  buildMiniTodoPrompt,
  buildTwoWeekPlanPrompt,
  buildMiniAppConfigPrompt,
} from "@/lib/ai/prompts";
import {
  problemTemplateOutputSchema,
  todoOutputSchema,
  appConfigOutputSchema,
} from "@/lib/validations/generation";
import type { TemplateType, CandidatePageStatus } from "@/types/database";

// ── Helpers ─────────────────────────────────────────────────────────

async function authenticateAndValidate(candidatePageId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" as const };
  if (!isAIConfigured())
    return {
      error:
        "AI is not configured. Add ANTHROPIC_API_KEY to .env.local or set AI_MOCK_MODE=true." as const,
    };

  const { data: page } = await supabase
    .from("candidate_pages")
    .select("*")
    .eq("id", candidatePageId)
    .eq("user_id", user.id)
    .single();

  if (!page) return { error: "Candidate page not found" as const };

  return { supabase, user, page };
}

function revalidateOpportunityPage(opportunityId: string) {
  revalidatePath(`/opportunities/${opportunityId}`);
  revalidatePath("/opportunities");
  revalidatePath("/dashboard");
}

const STATUS_ORDER: CandidatePageStatus[] = [
  "draft",
  "intake_complete",
  "problem_selected",
  "narrative_generated",
  "prd_generated",
  "todo_generated",
  "mini_app_generated",
  "two_week_plan_generated",
  "published",
];

function statusAtLeast(
  current: CandidatePageStatus,
  required: CandidatePageStatus
): boolean {
  return STATUS_ORDER.indexOf(current) >= STATUS_ORDER.indexOf(required);
}

// ── Mark Intake Complete ────────────────────────────────────────────

export async function markIntakeComplete(candidatePageId: string) {
  const result = await authenticateAndValidate(candidatePageId);
  if ("error" in result) return { error: result.error };
  const { supabase, page } = result;

  // Only advance from draft
  if (page.status !== "draft") return { success: true };

  const { error } = await supabase
    .from("candidate_pages")
    .update({ status: "intake_complete" })
    .eq("id", candidatePageId);

  if (error) return { error: error.message };

  revalidateOpportunityPage(page.opportunity_id);
  return { success: true };
}

// ── Step 1: Generate Problem & Template ─────────────────────────────

export async function generateProblemTemplate(
  candidatePageId: string,
  preferredTemplate?: TemplateType
) {
  const result = await authenticateAndValidate(candidatePageId);
  if ("error" in result) return { error: result.error };
  const { supabase, user, page } = result;

  // Allow from draft, intake_complete, or re-generation from any later status
  const ctx = await gatherGenerationContext(
    supabase,
    user.id,
    candidatePageId
  );
  const prompt = buildProblemTemplatePrompt(ctx, preferredTemplate);

  const runId = await createRun(
    supabase,
    user.id,
    candidatePageId,
    "problem_template",
    { preferredTemplate: preferredTemplate ?? "auto" },
    prompt.promptVersion
  );

  try {
    await markRunning(supabase, runId);

    let output;
    if (shouldUseMock()) {
      output = await getMockResponse("problem_template");
    } else {
      const raw = await callClaude(prompt.system, prompt.user);
      output = extractJSON(raw);
    }

    const parsed = problemTemplateOutputSchema.safeParse(output);
    if (!parsed.success) {
      await markFailed(supabase, runId, "Invalid AI output format");
      return { error: "AI returned unexpected format. Please try regenerating." };
    }

    // Upsert mini_project (delete existing if re-generating)
    if (ctx.miniProject) {
      await supabase
        .from("mini_projects")
        .delete()
        .eq("id", ctx.miniProject.id);
    }

    const { error: insertError } = await supabase
      .from("mini_projects")
      .insert({
        candidate_page_id: candidatePageId,
        template_type: parsed.data.template_type,
        problem_statement: parsed.data.problem_statement,
        solution_summary: parsed.data.solution_summary,
        assumptions_md: parsed.data.assumptions_md,
      });

    if (insertError) {
      await markFailed(supabase, runId, insertError.message);
      return { error: insertError.message };
    }

    // Update candidate page status
    await supabase
      .from("candidate_pages")
      .update({ status: "problem_selected", thinking_md: parsed.data.reasoning })
      .eq("id", candidatePageId);

    await markCompleted(supabase, runId, parsed.data as unknown as Record<string, unknown>);
    revalidateOpportunityPage(page.opportunity_id);
    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    await markFailed(supabase, runId, message);
    return { error: `Generation failed: ${message}` };
  }
}

// ── Step 2: Generate Narrative (3 sections) ─────────────────────────

export async function generateNarrative(candidatePageId: string) {
  const result = await authenticateAndValidate(candidatePageId);
  if ("error" in result) return { error: result.error };
  const { supabase, user, page } = result;

  if (!statusAtLeast(page.status as CandidatePageStatus, "problem_selected")) {
    return { error: "Please generate the problem & template first." };
  }

  const ctx = await gatherGenerationContext(
    supabase,
    user.id,
    candidatePageId
  );

  // Generate 3 narrative sections sequentially
  const sections = [
    {
      type: "recruiter_summary" as const,
      prompt: buildRecruiterSummaryPrompt(ctx),
      field: "recruiter_summary_md",
    },
    {
      type: "why_this_company" as const,
      prompt: buildWhyThisCompanyPrompt(ctx),
      field: "why_this_company_md",
    },
    {
      type: "evidence_summary" as const,
      prompt: buildEvidenceSummaryPrompt(ctx),
      field: "evidence_summary_md",
    },
  ];

  const updates: Record<string, string> = {};

  for (const section of sections) {
    const runId = await createRun(
      supabase,
      user.id,
      candidatePageId,
      section.type,
      {},
      section.prompt.promptVersion
    );

    try {
      await markRunning(supabase, runId);

      let content: string;
      if (shouldUseMock()) {
        const mock = (await getMockResponse(section.type)) as {
          content: string;
        };
        content = mock.content;
      } else {
        content = await callClaude(
          section.prompt.system,
          section.prompt.user
        );
      }

      updates[section.field] = content;
      await markCompleted(supabase, runId, { content });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      await markFailed(supabase, runId, message);
      return {
        error: `Failed to generate ${section.type.replace(/_/g, " ")}: ${message}`,
      };
    }
  }

  // Update candidate page with all 3 sections + advance status
  const { error: updateError } = await supabase
    .from("candidate_pages")
    .update({ ...updates, status: "narrative_generated" })
    .eq("id", candidatePageId);

  if (updateError) return { error: updateError.message };

  revalidateOpportunityPage(page.opportunity_id);
  return { success: true };
}

// ── Step 3: Generate PRD ────────────────────────────────────────────

export async function generatePrd(candidatePageId: string) {
  const result = await authenticateAndValidate(candidatePageId);
  if ("error" in result) return { error: result.error };
  const { supabase, user, page } = result;

  if (
    !statusAtLeast(page.status as CandidatePageStatus, "narrative_generated")
  ) {
    return { error: "Please generate the narrative sections first." };
  }

  const ctx = await gatherGenerationContext(
    supabase,
    user.id,
    candidatePageId
  );
  if (!ctx.miniProject) return { error: "No mini-project found." };

  const prompt = buildMiniPrdPrompt(ctx);
  const runId = await createRun(
    supabase,
    user.id,
    candidatePageId,
    "mini_prd",
    {},
    prompt.promptVersion
  );

  try {
    await markRunning(supabase, runId);

    let content: string;
    if (shouldUseMock()) {
      const mock = (await getMockResponse("mini_prd")) as { content: string };
      content = mock.content;
    } else {
      content = await callClaude(
        prompt.system,
        prompt.user,
        LONG_MAX_TOKENS
      );
    }

    // Upsert mini_prd
    const { data: existing } = await supabase
      .from("mini_prds")
      .select("id")
      .eq("mini_project_id", ctx.miniProject.id)
      .maybeSingle();

    if (existing) {
      await supabase
        .from("mini_prds")
        .update({ prd_md: content })
        .eq("id", existing.id);
    } else {
      await supabase.from("mini_prds").insert({
        mini_project_id: ctx.miniProject.id,
        prd_md: content,
      });
    }

    await supabase
      .from("candidate_pages")
      .update({ status: "prd_generated" })
      .eq("id", candidatePageId);

    await markCompleted(supabase, runId, { content });
    revalidateOpportunityPage(page.opportunity_id);
    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    await markFailed(supabase, runId, message);
    return { error: `PRD generation failed: ${message}` };
  }
}

// ── Step 4: Generate Todo ───────────────────────────────────────────

export async function generateTodo(candidatePageId: string) {
  const result = await authenticateAndValidate(candidatePageId);
  if ("error" in result) return { error: result.error };
  const { supabase, user, page } = result;

  if (!statusAtLeast(page.status as CandidatePageStatus, "prd_generated")) {
    return { error: "Please generate the PRD first." };
  }

  const ctx = await gatherGenerationContext(
    supabase,
    user.id,
    candidatePageId
  );
  if (!ctx.miniProject) return { error: "No mini-project found." };

  const prompt = buildMiniTodoPrompt(ctx);
  const runId = await createRun(
    supabase,
    user.id,
    candidatePageId,
    "mini_todo",
    {},
    prompt.promptVersion
  );

  try {
    await markRunning(supabase, runId);

    let todoData;
    if (shouldUseMock()) {
      todoData = await getMockResponse("mini_todo");
    } else {
      const raw = await callClaude(prompt.system, prompt.user);
      todoData = extractJSON(raw);
    }

    const parsed = todoOutputSchema.safeParse(todoData);
    if (!parsed.success) {
      await markFailed(supabase, runId, "Invalid AI output format");
      return { error: "AI returned unexpected format. Please try regenerating." };
    }

    // Upsert mini_todo
    const { data: existing } = await supabase
      .from("mini_todos")
      .select("id")
      .eq("mini_project_id", ctx.miniProject.id)
      .maybeSingle();

    if (existing) {
      await supabase
        .from("mini_todos")
        .update({
          todo_json: parsed.data.json as unknown as Record<string, unknown>,
          todo_md: parsed.data.markdown,
        })
        .eq("id", existing.id);
    } else {
      await supabase.from("mini_todos").insert({
        mini_project_id: ctx.miniProject.id,
        todo_json: parsed.data.json as unknown as Record<string, unknown>,
        todo_md: parsed.data.markdown,
      });
    }

    await supabase
      .from("candidate_pages")
      .update({ status: "todo_generated" })
      .eq("id", candidatePageId);

    await markCompleted(supabase, runId, parsed.data as unknown as Record<string, unknown>);
    revalidateOpportunityPage(page.opportunity_id);
    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    await markFailed(supabase, runId, message);
    return { error: `Todo generation failed: ${message}` };
  }
}

// ── Step 5: Generate Mini App Config ────────────────────────────────

export async function generateMiniAppConfig(candidatePageId: string) {
  const result = await authenticateAndValidate(candidatePageId);
  if ("error" in result) return { error: result.error };
  const { supabase, user, page } = result;

  if (!statusAtLeast(page.status as CandidatePageStatus, "todo_generated")) {
    return { error: "Please generate the todo list first." };
  }

  const ctx = await gatherGenerationContext(
    supabase,
    user.id,
    candidatePageId
  );
  if (!ctx.miniProject) return { error: "No mini-project found." };

  const prompt = buildMiniAppConfigPrompt(ctx);
  const runId = await createRun(
    supabase,
    user.id,
    candidatePageId,
    "mini_app_config",
    {},
    prompt.promptVersion
  );

  try {
    await markRunning(supabase, runId);

    let configData;
    if (shouldUseMock()) {
      configData = await getMockResponse("mini_app_config");
    } else {
      const raw = await callClaude(
        prompt.system,
        prompt.user,
        LONG_MAX_TOKENS
      );
      configData = extractJSON(raw);
    }

    const parsed = appConfigOutputSchema.safeParse(configData);
    if (!parsed.success) {
      await markFailed(supabase, runId, "Invalid AI output format");
      return { error: "AI returned unexpected format. Please try regenerating." };
    }

    // Update mini_project with app_config_json
    await supabase
      .from("mini_projects")
      .update({ app_config_json: parsed.data.config as unknown as Record<string, unknown> })
      .eq("id", ctx.miniProject.id);

    await supabase
      .from("candidate_pages")
      .update({ status: "mini_app_generated" })
      .eq("id", candidatePageId);

    await markCompleted(supabase, runId, parsed.data as unknown as Record<string, unknown>);
    revalidateOpportunityPage(page.opportunity_id);
    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    await markFailed(supabase, runId, message);
    return { error: `App config generation failed: ${message}` };
  }
}

// ── Step 6: Generate Two-Week Plan ──────────────────────────────────

export async function generateTwoWeekPlan(candidatePageId: string) {
  const result = await authenticateAndValidate(candidatePageId);
  if ("error" in result) return { error: result.error };
  const { supabase, user, page } = result;

  if (
    !statusAtLeast(page.status as CandidatePageStatus, "mini_app_generated")
  ) {
    return { error: "Please generate the app config first." };
  }

  const ctx = await gatherGenerationContext(
    supabase,
    user.id,
    candidatePageId
  );
  if (!ctx.miniProject) return { error: "No mini-project found." };

  const prompt = buildTwoWeekPlanPrompt(ctx);
  const runId = await createRun(
    supabase,
    user.id,
    candidatePageId,
    "two_week_plan",
    {},
    prompt.promptVersion
  );

  try {
    await markRunning(supabase, runId);

    let content: string;
    if (shouldUseMock()) {
      const mock = (await getMockResponse("two_week_plan")) as {
        content: string;
      };
      content = mock.content;
    } else {
      content = await callClaude(
        prompt.system,
        prompt.user,
        LONG_MAX_TOKENS
      );
    }

    // Upsert two_week_plan
    const { data: existing } = await supabase
      .from("two_week_plans")
      .select("id")
      .eq("mini_project_id", ctx.miniProject.id)
      .maybeSingle();

    if (existing) {
      await supabase
        .from("two_week_plans")
        .update({ plan_md: content })
        .eq("id", existing.id);
    } else {
      await supabase.from("two_week_plans").insert({
        mini_project_id: ctx.miniProject.id,
        plan_md: content,
      });
    }

    await supabase
      .from("candidate_pages")
      .update({ status: "two_week_plan_generated" })
      .eq("id", candidatePageId);

    await markCompleted(supabase, runId, { content });
    revalidateOpportunityPage(page.opportunity_id);
    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    await markFailed(supabase, runId, message);
    return { error: `Two-week plan generation failed: ${message}` };
  }
}
