"use client";

import type { KpiCardsSection } from "@/types/mini-app";

interface KpiCardsProps {
  section: KpiCardsSection;
}

export function KpiCards({ section }: KpiCardsProps) {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {section.metrics.map((metric) => (
        <div
          key={metric.label}
          className="rounded-lg border bg-card p-4 shadow-sm"
        >
          <p className="text-xs font-medium text-muted-foreground">
            {metric.label}
          </p>
          <p className="mt-1 text-2xl font-bold tracking-tight">
            {metric.value}
          </p>
          {metric.trend && (
            <p
              className={`mt-1 text-xs font-medium ${
                metric.trendDirection === "up"
                  ? "text-emerald-600 dark:text-emerald-400"
                  : metric.trendDirection === "down"
                    ? "text-red-600 dark:text-red-400"
                    : "text-muted-foreground"
              }`}
            >
              {metric.trendDirection === "up" && "\u2191 "}
              {metric.trendDirection === "down" && "\u2193 "}
              {metric.trend}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
