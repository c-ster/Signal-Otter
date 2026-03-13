"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { MarkdownRenderer } from "@/components/shared/markdown-renderer";

export type StepStatus = "locked" | "ready" | "running" | "completed";

interface GenerationStepProps {
  stepNumber: number;
  title: string;
  description: string;
  status: StepStatus;
  isGenerating: boolean;
  onGenerate: () => void;
  content?: string | null;
  jsonContent?: Record<string, unknown> | null;
  extraControls?: (() => React.JSX.Element) | null;
}

const statusConfig: Record<
  StepStatus,
  { label: string; variant: "default" | "secondary" | "outline" | "destructive" }
> = {
  locked: { label: "Locked", variant: "outline" },
  ready: { label: "Ready", variant: "secondary" },
  running: { label: "Generating...", variant: "default" },
  completed: { label: "Done", variant: "default" },
};

export function GenerationStep({
  stepNumber,
  title,
  description,
  status,
  isGenerating,
  onGenerate,
  content,
  jsonContent,
  extraControls,
}: GenerationStepProps) {
  const [expanded, setExpanded] = useState(status === "completed");
  const config = statusConfig[status];
  const jsonString = jsonContent ? JSON.stringify(jsonContent, null, 2) : null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
              status === "completed"
                ? "bg-primary text-primary-foreground"
                : status === "locked"
                  ? "bg-muted text-muted-foreground"
                  : "bg-secondary text-secondary-foreground"
            }`}
          >
            {status === "completed" ? "✓" : stepNumber}
          </div>
          <div>
            <h4 className="text-sm font-medium">{title}</h4>
            <p className="text-xs text-muted-foreground">{description}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={config.variant}>{config.label}</Badge>
          {(status === "ready" || status === "completed") && (
            <Button
              size="sm"
              variant={status === "completed" ? "outline" : "default"}
              onClick={onGenerate}
              disabled={isGenerating}
            >
              {isGenerating
                ? "Generating..."
                : status === "completed"
                  ? "Regenerate"
                  : "Generate"}
            </Button>
          )}
        </div>
      </div>

      {extraControls && extraControls()}

      {status === "completed" && (content || jsonString) && (
        <div>
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-xs text-muted-foreground hover:text-foreground underline"
          >
            {expanded ? "Hide output" : "Show output"}
          </button>
          {expanded && (
            <div className="mt-2 rounded-md border p-4 bg-muted/30">
              {content && <MarkdownRenderer content={content} />}
              {jsonString && !content && (
                <pre className="text-xs overflow-auto max-h-60">
                  {jsonString}
                </pre>
              )}
            </div>
          )}
        </div>
      )}

      <Separator />
    </div>
  );
}
