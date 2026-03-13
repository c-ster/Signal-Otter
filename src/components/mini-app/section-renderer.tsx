"use client";

import type { AppSection } from "@/types/mini-app";
import { KpiCards } from "./sections/kpi-cards";
import { DonutChart } from "./sections/donut-chart";
import { BarChartRenderer } from "./sections/bar-chart";
import { LineChartRenderer } from "./sections/line-chart";
import { TableRenderer } from "./sections/table-section";
import { TextRenderer } from "./sections/text-section";

interface SectionRendererProps {
  section: AppSection;
}

export function SectionRenderer({ section }: SectionRendererProps) {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold">{section.title}</h3>
      <SectionContent section={section} />
    </div>
  );
}

function SectionContent({ section }: { section: AppSection }) {
  switch (section.type) {
    case "kpi_cards":
      return <KpiCards section={section} />;
    case "donut_chart":
      return <DonutChart section={section} />;
    case "bar_chart":
      return <BarChartRenderer section={section} />;
    case "line_chart":
      return <LineChartRenderer section={section} />;
    case "table":
      return <TableRenderer section={section} />;
    case "text":
      return <TextRenderer section={section} />;
    default:
      return (
        <pre className="max-h-40 overflow-auto rounded-md bg-muted p-3 text-xs">
          {JSON.stringify(section, null, 2)}
        </pre>
      );
  }
}
