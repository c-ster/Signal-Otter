"use client";

import { useState } from "react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import type { AppFilter } from "@/types/mini-app";

interface FilterBarProps {
  filters: AppFilter[];
}

export function FilterBar({ filters }: FilterBarProps) {
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>(
    () => {
      const initial: Record<string, string> = {};
      for (const filter of filters) {
        initial[filter.id] = filter.options[0] ?? "All";
      }
      return initial;
    }
  );

  return (
    <div className="flex flex-wrap gap-3">
      {filters.map((filter) => (
        <div key={filter.id} className="flex items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground">
            {filter.label}
          </span>
          <Select
            value={activeFilters[filter.id]}
            onValueChange={(value) => {
              if (value != null) {
                setActiveFilters((prev) => ({ ...prev, [filter.id]: value }));
              }
            }}
          >
            <SelectTrigger className="h-8 w-32 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {filter.options.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ))}
    </div>
  );
}
