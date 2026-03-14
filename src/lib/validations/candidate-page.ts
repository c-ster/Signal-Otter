import { z } from "zod";

export const candidatePageEditorSchema = z.object({
  headline: z.string().max(200, "Headline must be under 200 characters").optional().or(z.literal("")),
  recruiter_summary_md: z.string().max(10000, "Summary must be under 10,000 characters").optional().or(z.literal("")),
  why_this_company_md: z.string().max(10000, "Must be under 10,000 characters").optional().or(z.literal("")),
  evidence_summary_md: z.string().max(10000, "Must be under 10,000 characters").optional().or(z.literal("")),
});

export type CandidatePageEditorValues = z.infer<typeof candidatePageEditorSchema>;
