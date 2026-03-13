import { z } from "zod";

export const studentProfileSchema = z.object({
  full_name: z.string().min(1, "Name is required").max(200),
  school: z.string().max(200).optional().or(z.literal("")),
  graduation_date: z.string().optional().or(z.literal("")),
  major: z.string().max(200).optional().or(z.literal("")),
  bio: z.string().max(2000).optional().or(z.literal("")),
  linkedin_url: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  github_url: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  portfolio_url: z.string().url("Must be a valid URL").optional().or(z.literal("")),
});

export type StudentProfileFormValues = z.infer<typeof studentProfileSchema>;
