"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { parseAppConfig } from "@/types/mini-app";
import { SectionRenderer } from "./section-renderer";
import { FilterBar } from "./filter-bar";

interface MiniAppRendererProps {
  appConfig: Record<string, unknown>;
}

export function MiniAppRenderer({ appConfig }: MiniAppRendererProps) {
  const config = parseAppConfig(appConfig);

  if (!config) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-sm text-muted-foreground">
          Unable to render mini-app: invalid configuration.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{config.title}</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              {config.description}
            </p>
          </div>
          <Badge variant="secondary">{config.template}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {config.filters && config.filters.length > 0 && (
          <FilterBar filters={config.filters} />
        )}

        {config.sections.map((section) => (
          <SectionRenderer key={section.id} section={section} />
        ))}
      </CardContent>
    </Card>
  );
}
