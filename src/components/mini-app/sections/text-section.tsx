"use client";

import { MarkdownRenderer } from "@/components/shared/markdown-renderer";
import type { TextSection } from "@/types/mini-app";

interface TextSectionProps {
  section: TextSection;
}

export function TextRenderer({ section }: TextSectionProps) {
  if (!section.content) {
    return <p className="text-sm text-muted-foreground">No content</p>;
  }

  return <MarkdownRenderer content={section.content} />;
}
