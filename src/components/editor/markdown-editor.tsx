"use client";

import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { MarkdownRenderer } from "@/components/shared/markdown-renderer";

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
}

export function MarkdownEditor({
  value,
  onChange,
  placeholder,
  label,
}: MarkdownEditorProps) {
  // Default to "edit" on mobile, "split" on desktop
  const [mode, setMode] = useState<"edit" | "preview" | "split">(() => {
    if (typeof window !== "undefined" && window.innerWidth < 768) return "edit";
    return "split";
  });

  return (
    <div className="space-y-2">
      {label && (
        <Label className="text-sm font-medium">{label}</Label>
      )}

      <div className="flex gap-1">
        <Button
          type="button"
          size="sm"
          variant={mode === "edit" ? "default" : "outline"}
          onClick={() => setMode("edit")}
          className="text-xs"
        >
          Edit
        </Button>
        <Button
          type="button"
          size="sm"
          variant={mode === "split" ? "default" : "outline"}
          onClick={() => setMode("split")}
          className="text-xs"
        >
          Split
        </Button>
        <Button
          type="button"
          size="sm"
          variant={mode === "preview" ? "default" : "outline"}
          onClick={() => setMode("preview")}
          className="text-xs"
        >
          Preview
        </Button>
      </div>

      <div
        className={`gap-4 ${
          mode === "split" ? "grid grid-cols-1 md:grid-cols-2" : ""
        }`}
      >
        {(mode === "edit" || mode === "split") && (
          <Textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="min-h-[300px] font-mono text-sm"
            rows={15}
          />
        )}

        {(mode === "preview" || mode === "split") && (
          <div className="min-h-[300px] rounded-lg border p-4 bg-muted/30">
            {value ? (
              <MarkdownRenderer content={value} />
            ) : (
              <p className="text-sm text-muted-foreground italic">
                Nothing to preview yet...
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
