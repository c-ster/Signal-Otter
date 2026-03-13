import type { GenerationContext } from "./context";
import { TEMPLATE_DESCRIPTIONS } from "./template-schemas";

export interface PromptPair {
  system: string;
  user: string;
  promptVersion: string;
}

function formatProfile(ctx: GenerationContext): string {
  const p = ctx.profile;
  return [
    `Name: ${p.full_name ?? "Not provided"}`,
    `School: ${p.school ?? "Not provided"}`,
    `Major: ${p.major ?? "Not provided"}`,
    `Graduation: ${p.graduation_date ?? "Not provided"}`,
    p.bio ? `Bio: ${p.bio}` : null,
    p.linkedin_url ? `LinkedIn: ${p.linkedin_url}` : null,
    p.github_url ? `GitHub: ${p.github_url}` : null,
    p.portfolio_url ? `Portfolio: ${p.portfolio_url}` : null,
  ]
    .filter(Boolean)
    .join("\n");
}

function formatOpportunity(ctx: GenerationContext): string {
  const o = ctx.opportunity;
  return [
    `Company: ${o.company_name}`,
    `Role: ${o.role_title}`,
    o.target_industry ? `Industry: ${o.target_industry}` : null,
    o.company_url ? `Company URL: ${o.company_url}` : null,
    o.job_description
      ? `\nJob Description:\n${o.job_description}`
      : "Job Description: Not provided",
    o.why_this_company_md
      ? `\nStudent's notes on why this company:\n${o.why_this_company_md}`
      : null,
    o.relevant_experience_ref
      ? `\nStudent's relevant experience notes:\n${o.relevant_experience_ref}`
      : null,
  ]
    .filter(Boolean)
    .join("\n");
}

function formatEvidence(ctx: GenerationContext): string {
  if (ctx.evidence.length === 0) return "No evidence items provided.";
  return ctx.evidence
    .map(
      (e, i) =>
        `${i + 1}. **${e.title}** (${e.type})${e.description ? `\n   ${e.description}` : ""}${e.impact_text ? `\n   Impact: ${e.impact_text}` : ""}${e.url ? `\n   URL: ${e.url}` : ""}`
    )
    .join("\n\n");
}

function formatMiniProject(ctx: GenerationContext): string {
  if (!ctx.miniProject) return "No mini-project selected yet.";
  const mp = ctx.miniProject;
  return [
    `Template: ${mp.template_type}`,
    `Problem Statement: ${mp.problem_statement ?? "Not generated"}`,
    `Solution Summary: ${mp.solution_summary ?? "Not generated"}`,
    mp.assumptions_md ? `\nAssumptions:\n${mp.assumptions_md}` : null,
  ]
    .filter(Boolean)
    .join("\n");
}

// ── Problem Template Selection ──────────────────────────────────────

export function buildProblemTemplatePrompt(
  ctx: GenerationContext,
  preferredTemplate?: string
): PromptPair {
  const templateList = Object.entries(TEMPLATE_DESCRIPTIONS)
    .map(([key, desc]) => `- **${key}**: ${desc}`)
    .join("\n");

  return {
    system: `You are an expert career advisor and product manager. Given a student's profile and a target job opportunity, recommend the most impactful mini-project template and craft a compelling problem statement that demonstrates skills relevant to the role.

You must respond with ONLY a JSON object (no markdown fences, no explanation) in this exact format:
{
  "template_type": "<one of: analytics_dashboard, operations_monitor, ai_insight_tool, optimization_simulator, ab_test_dashboard, social_media_dashboard>",
  "problem_statement": "<2-3 sentence problem statement>",
  "solution_summary": "<2-3 sentence solution description>",
  "assumptions_md": "<markdown bullet list of 3-5 key assumptions>",
  "reasoning": "<1-2 sentences explaining why this template was chosen>"
}`,
    user: `## Student Profile
${formatProfile(ctx)}

## Target Opportunity
${formatOpportunity(ctx)}

## Evidence Portfolio
${formatEvidence(ctx)}

## Available Templates
${templateList}

${preferredTemplate ? `The student has expressed a preference for the "${preferredTemplate}" template. Use this template unless it is clearly inappropriate for the role.` : "Choose the template that best demonstrates skills relevant to this specific role."}

Generate the problem statement and template selection now.`,
    promptVersion: "v1.0",
  };
}

// ── Recruiter Summary ───────────────────────────────────────────────

export function buildRecruiterSummaryPrompt(
  ctx: GenerationContext
): PromptPair {
  return {
    system: `You are an expert resume writer and career strategist. Write a concise, compelling recruiter summary for a student's capability page. The summary should highlight the candidate's fit for the specific role and company.

Write in third person. Use markdown formatting with headers and bullet points. Keep it to 150-250 words. Focus on:
1. A strong opening statement positioning the candidate
2. Key strengths relevant to the role (3-4 bullets)
3. What makes this candidate stand out

Return ONLY the markdown content, no code fences.`,
    user: `## Student Profile
${formatProfile(ctx)}

## Target Opportunity
${formatOpportunity(ctx)}

## Evidence Portfolio
${formatEvidence(ctx)}

## Mini-Project Selected
${formatMiniProject(ctx)}

Write the recruiter summary now.`,
    promptVersion: "v1.0",
  };
}

// ── Why This Company ────────────────────────────────────────────────

export function buildWhyThisCompanyPrompt(ctx: GenerationContext): PromptPair {
  return {
    system: `You are a career coach helping a student articulate why they are genuinely excited about a specific company and role. Write a compelling "Why This Company" narrative that feels authentic and specific — not generic.

Write in first person from the student's perspective. Use markdown formatting. Keep it to 150-250 words. Focus on:
1. Specific aspects of the company that resonate with the student's goals
2. How the student's background connects to the company's mission
3. What they hope to learn and contribute

Use the student's own notes as a starting point if provided, expanding and polishing them into a cohesive narrative. Return ONLY the markdown content, no code fences.`,
    user: `## Student Profile
${formatProfile(ctx)}

## Target Opportunity
${formatOpportunity(ctx)}

## Evidence Portfolio
${formatEvidence(ctx)}

Write the "Why This Company" narrative now.`,
    promptVersion: "v1.0",
  };
}

// ── Evidence Summary ────────────────────────────────────────────────

export function buildEvidenceSummaryPrompt(ctx: GenerationContext): PromptPair {
  return {
    system: `You are a career strategist summarizing a student's experience portfolio. Select and highlight the evidence items most relevant to the target role and company, weaving them into a cohesive narrative.

Use markdown formatting with headers for categories and bullet points for items. Keep it to 200-300 words. Focus on:
1. Grouping evidence by relevance to the role
2. Highlighting quantifiable impacts
3. Drawing connections between the student's experience and the role requirements

Return ONLY the markdown content, no code fences.`,
    user: `## Student Profile
${formatProfile(ctx)}

## Target Opportunity
${formatOpportunity(ctx)}

## Full Evidence Portfolio
${formatEvidence(ctx)}

Summarize the most relevant evidence for this opportunity now.`,
    promptVersion: "v1.0",
  };
}

// ── Mini PRD ────────────────────────────────────────────────────────

export function buildMiniPrdPrompt(ctx: GenerationContext): PromptPair {
  return {
    system: `You are a senior product manager writing a concise PRD (Product Requirements Document) for a mini-project demonstration. This PRD is for a capability page that shows recruiters what the candidate can build.

Write in professional product manager style. Use markdown formatting with clear sections. Include:
1. Problem statement (from the selected mini-project)
2. Proposed solution
3. User stories (3-5)
4. Key features (4-6, with brief descriptions)
5. Technical approach (high-level)
6. Success metrics (2-3)

Keep the total to 400-600 words. Return ONLY the markdown content, no code fences.`,
    user: `## Student Profile
${formatProfile(ctx)}

## Target Opportunity
${formatOpportunity(ctx)}

## Mini-Project Details
${formatMiniProject(ctx)}

## Narrative Context
${ctx.candidatePage.recruiter_summary_md ? `Recruiter Summary:\n${ctx.candidatePage.recruiter_summary_md}` : ""}

Write the mini-PRD now.`,
    promptVersion: "v1.0",
  };
}

// ── Mini Todo ───────────────────────────────────────────────────────

export function buildMiniTodoPrompt(ctx: GenerationContext): PromptPair {
  return {
    system: `You are a technical lead breaking down a PRD into actionable engineering tasks. Create a structured todo list for implementing the mini-project.

You must respond with ONLY a JSON object (no markdown fences, no explanation) in this exact format:
{
  "json": [
    { "id": 1, "task": "Task description", "status": "todo", "priority": "high|medium|low", "estimatedHours": 2 }
  ],
  "markdown": "## Implementation Todo List\\n\\n### High Priority\\n- [ ] Task (Xh)\\n..."
}

Create 6-10 tasks covering project setup, core features, and polish. Include realistic hour estimates totaling 15-25 hours.`,
    user: `## Mini-Project Details
${formatMiniProject(ctx)}

## PRD
${ctx.miniPrd?.prd_md ?? "No PRD available"}

Generate the todo list now.`,
    promptVersion: "v1.0",
  };
}

// ── Two-Week Plan ───────────────────────────────────────────────────

export function buildTwoWeekPlanPrompt(ctx: GenerationContext): PromptPair {
  return {
    system: `You are a project manager creating a realistic two-week implementation plan for a mini-project. Assume the student can dedicate 2-3 hours per day.

Write in markdown format with clear day-by-day breakdown organized by week. Include:
1. Week 1: Foundation & Core Components (Days 1-5)
2. Week 2: Advanced Features & Polish (Days 6-10)
3. Key milestones at the end of each section

Keep the plan practical and achievable. Return ONLY the markdown content, no code fences.`,
    user: `## Mini-Project Details
${formatMiniProject(ctx)}

## Todo List
${ctx.miniTodo?.todo_md ?? "No todo list available"}

Generate the two-week plan now.`,
    promptVersion: "v1.0",
  };
}

// ── Mini App Config ─────────────────────────────────────────────────

export function buildMiniAppConfigPrompt(ctx: GenerationContext): PromptPair {
  const templateType = ctx.miniProject?.template_type ?? "analytics_dashboard";
  const templateDesc =
    TEMPLATE_DESCRIPTIONS[templateType] ?? "A data visualization dashboard";

  return {
    system: `You are a frontend engineer designing the JSON configuration for a "${templateType}" mini-app. This configuration will drive a template-based interactive demo.

Template description: ${templateDesc}

You must respond with ONLY a JSON object (no markdown fences, no explanation) in this format:
{
  "config": {
    "template": "${templateType}",
    "title": "Dashboard title",
    "description": "Brief description",
    "sections": [
      {
        "id": "unique_id",
        "type": "kpi_cards|donut_chart|bar_chart|line_chart|table|text",
        "title": "Section title",
        "data": { ... }
      }
    ],
    "filters": [
      { "id": "filter_id", "label": "Label", "options": ["All", ...] }
    ]
  }
}

Create 3-5 sections with realistic mock data relevant to the problem statement. Include 2-3 filters.`,
    user: `## Mini-Project Details
${formatMiniProject(ctx)}

## PRD
${ctx.miniPrd?.prd_md ?? "No PRD available"}

## Target Opportunity
Company: ${ctx.opportunity.company_name}
Role: ${ctx.opportunity.role_title}
Industry: ${ctx.opportunity.target_industry ?? "Not specified"}

Generate the app configuration JSON now.`,
    promptVersion: "v1.0",
  };
}
