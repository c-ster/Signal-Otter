"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { LineChartSection } from "@/types/mini-app";

interface LineChartSectionProps {
  section: LineChartSection;
}

export function LineChartRenderer({ section }: LineChartSectionProps) {
  if (!section.data || section.data.length === 0) {
    return <p className="text-sm text-muted-foreground">No data available</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={section.data}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis
          dataKey="x"
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
        <Line
          type="monotone"
          dataKey="y"
          stroke="#3b82f6"
          strokeWidth={2}
          dot={{ r: 4 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
