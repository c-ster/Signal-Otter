"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import type { DonutChartSection } from "@/types/mini-app";

const DEFAULT_COLORS = [
  "#3b82f6",
  "#22c55e",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#06b6d4",
  "#ec4899",
  "#f97316",
];

interface DonutChartProps {
  section: DonutChartSection;
}

export function DonutChart({ section }: DonutChartProps) {
  const data = section.data.map((d) => ({
    name: d.label,
    value: d.value,
    color: d.color,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={2}
          dataKey="value"
          nameKey="name"
        >
          {data.map((entry, index) => (
            <Cell
              key={entry.name}
              fill={entry.color ?? DEFAULT_COLORS[index % DEFAULT_COLORS.length]}
            />
          ))}
        </Pie>
        <Tooltip
          formatter={(value) => {
            if (typeof value === "number") return value.toLocaleString();
            return String(value ?? "");
          }}
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}
