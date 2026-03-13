"use client";

import type { TableSection } from "@/types/mini-app";

interface TableSectionProps {
  section: TableSection;
}

export function TableRenderer({ section }: TableSectionProps) {
  if (!section.data || section.data.length === 0) {
    return <p className="text-sm text-muted-foreground">No data available</p>;
  }

  // Use explicit columns if provided, otherwise auto-detect from first row
  const columns =
    section.columns ??
    Object.keys(section.data[0]).map((key) => ({
      key,
      label: key
        .replace(/_/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase()),
    }));

  return (
    <div className="overflow-auto rounded-md border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/50">
            {columns.map((col) => (
              <th
                key={col.key}
                className="px-4 py-2 text-left font-medium text-muted-foreground"
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {section.data.map((row, rowIdx) => (
            <tr
              key={rowIdx}
              className="border-b last:border-0 hover:bg-muted/30"
            >
              {columns.map((col) => (
                <td key={col.key} className="px-4 py-2">
                  {String(row[col.key] ?? "")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
