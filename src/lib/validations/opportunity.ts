import { z } from "zod";

export const opportunitySchema = z.object({
  company_name: z.string().min(1, "Company name is required").max(200),
  role_title: z.string().min(1, "Role title is required").max(200),
  job_description: z.string().max(10000).optional().or(z.literal("")),
  company_url: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  target_industry: z.string().max(200).optional().or(z.literal("")),
  why_this_company_md: z.string().max(5000).optional().or(z.literal("")),
  relevant_experience_ref: z.string().max(5000).optional().or(z.literal("")),
});

export type OpportunityFormValues = z.infer<typeof opportunitySchema>;
