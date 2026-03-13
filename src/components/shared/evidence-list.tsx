"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EvidenceItemForm } from "@/components/forms/evidence-item-form";
import { deleteEvidenceItem } from "@/lib/actions/evidence";
import { toast } from "sonner";
import type { EvidenceItem } from "@/types/database";

export function EvidenceList({ items }: { items: EvidenceItem[] }) {
  const [formOpen, setFormOpen] = useState(false);
  const [editItem, setEditItem] = useState<EvidenceItem | null>(null);

  function handleEdit(item: EvidenceItem) {
    setEditItem(item);
    setFormOpen(true);
  }

  function handleAdd() {
    setEditItem(null);
    setFormOpen(true);
  }

  async function handleDelete(id: string) {
    const result = await deleteEvidenceItem(id);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Evidence deleted");
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Evidence & Portfolio</CardTitle>
        <Button size="sm" onClick={handleAdd}>
          Add Evidence
        </Button>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No evidence items yet. Add projects, internships, and other
            accomplishments to showcase your skills.
          </p>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex items-start justify-between rounded-lg border p-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{item.title}</span>
                    <Badge variant="secondary" className="text-xs">
                      {item.type}
                    </Badge>
                  </div>
                  {item.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {item.description}
                    </p>
                  )}
                  {item.impact_text && (
                    <p className="text-sm text-muted-foreground italic">
                      {item.impact_text}
                    </p>
                  )}
                </div>
                <div className="flex gap-1 shrink-0 ml-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(item)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive"
                    onClick={() => handleDelete(item.id)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        <EvidenceItemForm
          open={formOpen}
          onOpenChange={setFormOpen}
          editItem={editItem}
        />
      </CardContent>
    </Card>
  );
}
