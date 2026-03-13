export type CandidatePageStatus =
  | "draft"
  | "intake_complete"
  | "problem_selected"
  | "narrative_generated"
  | "prd_generated"
  | "todo_generated"
  | "mini_app_generated"
  | "two_week_plan_generated"
  | "published";

export type EvidenceType =
  | "project"
  | "internship"
  | "research"
  | "leadership"
  | "certification"
  | "publication"
  | "hackathon"
  | "award"
  | "other";

export type TemplateType =
  | "analytics_dashboard"
  | "operations_monitor"
  | "ai_insight_tool"
  | "optimization_simulator"
  | "ab_test_dashboard"
  | "social_media_dashboard";

export type GenerationType =
  | "problem_template"
  | "recruiter_summary"
  | "why_this_company"
  | "evidence_summary"
  | "mini_prd"
  | "mini_todo"
  | "two_week_plan"
  | "mini_app_config";

export type GenerationStatus = "pending" | "running" | "completed" | "failed";

export interface StudentProfile {
  id: string;
  user_id: string;
  full_name: string | null;
  school: string | null;
  graduation_date: string | null;
  major: string | null;
  bio: string | null;
  linkedin_url: string | null;
  github_url: string | null;
  portfolio_url: string | null;
  resume_file_path: string | null;
  created_at: string;
  updated_at: string;
}

export interface Opportunity {
  id: string;
  user_id: string;
  company_name: string;
  role_title: string;
  job_description: string | null;
  company_url: string | null;
  target_industry: string | null;
  why_this_company_md: string | null;
  relevant_experience_ref: string | null;
  created_at: string;
  updated_at: string;
}

export interface CandidatePage {
  id: string;
  user_id: string;
  opportunity_id: string;
  slug: string | null;
  headline: string | null;
  recruiter_summary_md: string | null;
  why_this_company_md: string | null;
  evidence_summary_md: string | null;
  thinking_md: string | null;
  status: CandidatePageStatus;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface EvidenceItem {
  id: string;
  user_id: string;
  candidate_page_id: string | null;
  title: string;
  type: EvidenceType;
  description: string | null;
  url: string | null;
  impact_text: string | null;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface MiniProject {
  id: string;
  candidate_page_id: string;
  template_type: TemplateType;
  problem_statement: string | null;
  solution_summary: string | null;
  assumptions_md: string | null;
  app_config_json: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface MiniPrd {
  id: string;
  mini_project_id: string;
  prd_md: string | null;
  created_at: string;
  updated_at: string;
}

export interface MiniTodo {
  id: string;
  mini_project_id: string;
  todo_json: Record<string, unknown> | null;
  todo_md: string | null;
  created_at: string;
  updated_at: string;
}

export interface TwoWeekPlan {
  id: string;
  mini_project_id: string;
  plan_md: string | null;
  created_at: string;
  updated_at: string;
}

export interface GenerationRun {
  id: string;
  user_id: string;
  candidate_page_id: string;
  generation_type: GenerationType;
  prompt_version: string | null;
  input_json: Record<string, unknown> | null;
  output_json: Record<string, unknown> | null;
  status: GenerationStatus;
  created_at: string;
  updated_at: string;
}

export interface PublishedPage {
  id: string;
  candidate_page_id: string;
  public_slug: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}
