import { z } from "zod";

export const problemTemplateOutputSchema = z.object({
  template_type: z.enum([
    "analytics_dashboard",
    "operations_monitor",
    "ai_insight_tool",
    "optimization_simulator",
    "ab_test_dashboard",
    "social_media_dashboard",
  ]),
  problem_statement: z.string().min(1),
  solution_summary: z.string().min(1),
  assumptions_md: z.string(),
  reasoning: z.string(),
});

export type ProblemTemplateOutput = z.infer<typeof problemTemplateOutputSchema>;

export const todoOutputSchema = z.object({
  json: z.array(
    z.object({
      id: z.number(),
      task: z.string(),
      status: z.string(),
      priority: z.enum(["high", "medium", "low"]),
      estimatedHours: z.number(),
    })
  ),
  markdown: z.string().min(1),
});

export type TodoOutput = z.infer<typeof todoOutputSchema>;

export const appConfigOutputSchema = z.object({
  config: z.object({
    template: z.string(),
    title: z.string(),
    description: z.string(),
    sections: z.array(
      z.object({
        id: z.string(),
        type: z.string(),
        title: z.string(),
        data: z.unknown().optional(),
        metrics: z.unknown().optional(),
      }).passthrough()
    ),
    filters: z
      .array(
        z.object({
          id: z.string(),
          label: z.string(),
          options: z.array(z.string()),
        })
      )
      .optional(),
  }),
});

export type AppConfigOutput = z.infer<typeof appConfigOutputSchema>;
