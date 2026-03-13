import { z } from "zod";

export const evidenceItemSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  type: z.enum([
    "project",
    "internship",
    "research",
    "leadership",
    "certification",
    "publication",
    "hackathon",
    "award",
    "other",
  ]),
  description: z.string().max(2000).optional().or(z.literal("")),
  url: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  impact_text: z.string().max(1000).optional().or(z.literal("")),
});

export type EvidenceItemFormValues = z.infer<typeof evidenceItemSchema>;
