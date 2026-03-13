"use client";

import { useState, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { toast } from "sonner";
import { GenerationStep, type StepStatus } from "./generation-step";
import type {
  CandidatePage,
  CandidatePageStatus,
  MiniProject,
  MiniPrd,
  MiniTodo,
  TwoWeekPlan,
  TemplateType,
} from "@/types/database";
import {
  markIntakeComplete,
  generateProblemTemplate,
  generateNarrative,
  generatePrd,
  generateTodo,
  generateMiniAppConfig,
  generateTwoWeekPlan,
} from "@/lib/actions/generate";
import { TEMPLATE_LABELS } from "@/lib/ai/template-schemas";

interface PipelineCardProps {
  candidatePage: CandidatePage;
  miniProject: MiniProject | null;
  miniPrd: MiniPrd | null;
  miniTodo: MiniTodo | null;
  twoWeekPlan: TwoWeekPlan | null;
  aiConfigured: boolean;
  hasRequiredFields: boolean;
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

function getStepStatus(
  pageStatus: CandidatePageStatus,
  completedAt: CandidatePageStatus,
  readyAt: CandidatePageStatus
): StepStatus {
  if (statusAtLeast(pageStatus, completedAt)) return "completed";
  if (statusAtLeast(pageStatus, readyAt)) return "ready";
  return "locked";
}

export function PipelineCard({
  candidatePage,
  miniProject,
  miniPrd,
  miniTodo,
  twoWeekPlan,
  aiConfigured,
  hasRequiredFields,
}: PipelineCardProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<
    TemplateType | "auto"
  >("auto");
  const [generatingStep, setGeneratingStep] = useState<number | null>(null);
  const [isPending, startTransition] = useTransition();

  const status = candidatePage.status as CandidatePageStatus;

  async function handleGenerate(step: number, action: () => Promise<{ error?: string; success?: boolean }>) {
    setGeneratingStep(step);
    startTransition(async () => {
      try {
        const result = await action();
        if (result.error) {
          toast.error(result.error);
        } else {
          toast.success("Generation complete!");
        }
      } catch {
        toast.error("An unexpected error occurred.");
      } finally {
        setGeneratingStep(null);
      }
    });
  }

  // Auto-advance from draft to intake_complete if required fields present
  if (status === "draft" && hasRequiredFields && aiConfigured) {
    startTransition(async () => {
      await markIntakeComplete(candidatePage.id);
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Generation Pipeline</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!aiConfigured && (
          <Alert>
            AI generation requires an API key. Add{" "}
            <code className="text-xs">ANTHROPIC_API_KEY</code> to your{" "}
            <code className="text-xs">.env.local</code> file, or set{" "}
            <code className="text-xs">AI_MOCK_MODE=true</code> for testing.
          </Alert>
        )}

        {!hasRequiredFields && (
          <Alert>
            Fill in the <strong>company name</strong>,{" "}
            <strong>role title</strong>, and <strong>job description</strong>{" "}
            above to enable the generation pipeline.
          </Alert>
        )}

        {/* Step 1: Problem & Template */}
        <GenerationStep
          stepNumber={1}
          title="Problem & Template"
          description="AI selects the best mini-app template and crafts a problem statement"
          status={
            generatingStep === 1
              ? "running"
              : getStepStatus(status, "problem_selected", "draft")
          }
          isGenerating={generatingStep === 1 || (isPending && generatingStep === 1)}
          onGenerate={() =>
            handleGenerate(1, () =>
              generateProblemTemplate(
                candidatePage.id,
                selectedTemplate === "auto" ? undefined : selectedTemplate
              )
            )
          }
          content={
            miniProject
              ? `**Template:** ${TEMPLATE_LABELS[miniProject.template_type] ?? miniProject.template_type}\n\n**Problem:** ${miniProject.problem_statement ?? ""}\n\n**Solution:** ${miniProject.solution_summary ?? ""}\n\n**Assumptions:**\n${miniProject.assumptions_md ?? ""}`
              : null
          }
          extraControls={
            getStepStatus(status, "problem_selected", "draft") !== "locked"
              ? () => (
                  <div className="ml-11">
                    <Select
                      value={selectedTemplate}
                      onValueChange={(v) =>
                        setSelectedTemplate(v as TemplateType | "auto")
                      }
                    >
                      <SelectTrigger className="w-64">
                        <SelectValue placeholder="Let AI choose..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="auto">Let AI recommend</SelectItem>
                        {Object.entries(TEMPLATE_LABELS).map(([key, label]) => (
                          <SelectItem key={key} value={key}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )
              : null
          }
        />

        {/* Step 2: Narrative */}
        <GenerationStep
          stepNumber={2}
          title="Narrative Content"
          description="Generates recruiter summary, why this company, and evidence summary"
          status={
            generatingStep === 2
              ? "running"
              : getStepStatus(status, "narrative_generated", "problem_selected")
          }
          isGenerating={generatingStep === 2 || (isPending && generatingStep === 2)}
          onGenerate={() =>
            handleGenerate(2, () => generateNarrative(candidatePage.id))
          }
          content={
            candidatePage.recruiter_summary_md
              ? `## Recruiter Summary\n${candidatePage.recruiter_summary_md}\n\n---\n\n## Why This Company\n${candidatePage.why_this_company_md ?? ""}\n\n---\n\n## Evidence Summary\n${candidatePage.evidence_summary_md ?? ""}`
              : null
          }
        />

        {/* Step 3: Mini PRD */}
        <GenerationStep
          stepNumber={3}
          title="Mini PRD"
          description="Creates a product requirements document for the mini-project"
          status={
            generatingStep === 3
              ? "running"
              : getStepStatus(status, "prd_generated", "narrative_generated")
          }
          isGenerating={generatingStep === 3 || (isPending && generatingStep === 3)}
          onGenerate={() =>
            handleGenerate(3, () => generatePrd(candidatePage.id))
          }
          content={miniPrd?.prd_md ?? null}
        />

        {/* Step 4: Todo List */}
        <GenerationStep
          stepNumber={4}
          title="Implementation Todo"
          description="Breaks the PRD into actionable engineering tasks"
          status={
            generatingStep === 4
              ? "running"
              : getStepStatus(status, "todo_generated", "prd_generated")
          }
          isGenerating={generatingStep === 4 || (isPending && generatingStep === 4)}
          onGenerate={() =>
            handleGenerate(4, () => generateTodo(candidatePage.id))
          }
          content={miniTodo?.todo_md ?? null}
        />

        {/* Step 5: App Config */}
        <GenerationStep
          stepNumber={5}
          title="Mini App Config"
          description="Generates the interactive demo configuration"
          status={
            generatingStep === 5
              ? "running"
              : getStepStatus(status, "mini_app_generated", "todo_generated")
          }
          isGenerating={generatingStep === 5 || (isPending && generatingStep === 5)}
          onGenerate={() =>
            handleGenerate(5, () => generateMiniAppConfig(candidatePage.id))
          }
          jsonContent={miniProject?.app_config_json}
        />

        {/* Step 6: Two-Week Plan */}
        <GenerationStep
          stepNumber={6}
          title="Two-Week Plan"
          description="Creates a day-by-day implementation plan"
          status={
            generatingStep === 6
              ? "running"
              : getStepStatus(
                  status,
                  "two_week_plan_generated",
                  "mini_app_generated"
                )
          }
          isGenerating={generatingStep === 6 || (isPending && generatingStep === 6)}
          onGenerate={() =>
            handleGenerate(6, () => generateTwoWeekPlan(candidatePage.id))
          }
          content={twoWeekPlan?.plan_md ?? null}
        />
      </CardContent>
    </Card>
  );
}
