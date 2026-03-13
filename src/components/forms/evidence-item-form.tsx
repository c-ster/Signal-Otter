"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  evidenceItemSchema,
  type EvidenceItemFormValues,
} from "@/lib/validations/evidence";
import { createEvidenceItem, updateEvidenceItem } from "@/lib/actions/evidence";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import type { EvidenceItem } from "@/types/database";

const evidenceTypes = [
  { value: "project", label: "Project" },
  { value: "internship", label: "Internship" },
  { value: "research", label: "Research" },
  { value: "leadership", label: "Leadership" },
  { value: "certification", label: "Certification" },
  { value: "publication", label: "Publication" },
  { value: "hackathon", label: "Hackathon" },
  { value: "award", label: "Award" },
  { value: "other", label: "Other" },
] as const;

interface EvidenceItemFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editItem?: EvidenceItem | null;
}

export function EvidenceItemForm({
  open,
  onOpenChange,
  editItem,
}: EvidenceItemFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<EvidenceItemFormValues>({
    resolver: zodResolver(evidenceItemSchema),
    defaultValues: editItem
      ? {
          title: editItem.title,
          type: editItem.type,
          description: editItem.description ?? "",
          url: editItem.url ?? "",
          impact_text: editItem.impact_text ?? "",
        }
      : {
          title: "",
          type: "project",
          description: "",
          url: "",
          impact_text: "",
        },
  });

  const typeValue = watch("type");

  async function onSubmit(data: EvidenceItemFormValues) {
    const result = editItem
      ? await updateEvidenceItem(editItem.id, data)
      : await createEvidenceItem(data);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(editItem ? "Evidence updated" : "Evidence added");
      reset();
      onOpenChange(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {editItem ? "Edit Evidence" : "Add Evidence"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input id="title" {...register("title")} />
            {errors.title && (
              <p className="text-sm text-destructive">
                {errors.title.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Type</Label>
            <Select
              value={typeValue}
              onValueChange={(val) =>
                setValue("type", val as EvidenceItemFormValues["type"])
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {evidenceTypes.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" rows={3} {...register("description")} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="url">URL</Label>
            <Input id="url" placeholder="https://..." {...register("url")} />
            {errors.url && (
              <p className="text-sm text-destructive">{errors.url.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="impact_text">Impact</Label>
            <Textarea
              id="impact_text"
              rows={2}
              placeholder="What was the outcome or impact?"
              {...register("impact_text")}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? "Saving..."
                : editItem
                  ? "Update"
                  : "Add Evidence"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
