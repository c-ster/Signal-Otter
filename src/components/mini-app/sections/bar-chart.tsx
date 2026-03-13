"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import type { BarChartSection } from "@/types/mini-app";

const BAR_COLORS = [
  "#3b82f6",
  "#22c55e",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#06b6d4",
];

interface BarChartSectionProps {
  section: BarChartSection;
}

export function BarChartRenderer({ section }: BarChartSectionProps) {
  if (!section.data || section.data.length === 0) {
    return <p className="text-sm text-muted-foreground">No data available</p>;
  }

  // Auto-detect keys: first string key is the category, rest are numeric values
  const sampleRow = section.data[0];
  const allKeys = Object.keys(sampleRow);
  const categoryKey =
    allKeys.find((k) => typeof sampleRow[k] === "string") ?? allKeys[0];
  const valueKeys = allKeys.filter(
    (k) => k !== categoryKey && typeof sampleRow[k] === "number"
  );

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={section.data}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis
          dataKey={categoryKey}
          tick={{ fontSize: 12 }}
          label={
            section.xAxis
              ? { value: section.xAxis, position: "insideBottom", offset: -5 }
              : undefined
          }
        />
        <YAxis
          tick={{ fontSize: 12 }}
          label={
            section.yAxis
              ? {
                  value: section.yAxis,
                  angle: -90,
                  position: "insideLeft",
                }
              : undefined
          }
        />
        <Tooltip />
        {valueKeys.length > 1 && <Legend />}
        {valueKeys.map((key, i) => (
          <Bar
            key={key}
            dataKey={key}
            fill={BAR_COLORS[i % BAR_COLORS.length]}
            radius={[4, 4, 0, 0]}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}
