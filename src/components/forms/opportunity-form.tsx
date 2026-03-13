"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  opportunitySchema,
  type OpportunityFormValues,
} from "@/lib/validations/opportunity";
import { createOpportunity, updateOpportunity } from "@/lib/actions/opportunity";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import type { Opportunity } from "@/types/database";

interface OpportunityFormProps {
  opportunity?: Opportunity;
}

export function OpportunityForm({ opportunity }: OpportunityFormProps) {
  const isEditing = !!opportunity;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<OpportunityFormValues>({
    resolver: zodResolver(opportunitySchema),
    defaultValues: opportunity
      ? {
          company_name: opportunity.company_name,
          role_title: opportunity.role_title,
          job_description: opportunity.job_description ?? "",
          company_url: opportunity.company_url ?? "",
          target_industry: opportunity.target_industry ?? "",
          why_this_company_md: opportunity.why_this_company_md ?? "",
          relevant_experience_ref: opportunity.relevant_experience_ref ?? "",
        }
      : {
          company_name: "",
          role_title: "",
          job_description: "",
          company_url: "",
          target_industry: "",
          why_this_company_md: "",
          relevant_experience_ref: "",
        },
  });

  async function onSubmit(data: OpportunityFormValues) {
    if (isEditing) {
      const result = await updateOpportunity(opportunity.id, data);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Opportunity updated");
      }
    } else {
      // createOpportunity redirects on success via server action
      const result = await createOpportunity(data);
      if (result?.error) {
        toast.error(result.error);
      }
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {isEditing ? "Edit Opportunity" : "New Opportunity"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="company_name">Company Name *</Label>
              <Input
                id="company_name"
                placeholder="e.g. Stripe"
                {...register("company_name")}
              />
              {errors.company_name && (
                <p className="text-sm text-destructive">
                  {errors.company_name.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="role_title">Role Title *</Label>
              <Input
                id="role_title"
                placeholder="e.g. Data Engineer"
                {...register("role_title")}
              />
              {errors.role_title && (
                <p className="text-sm text-destructive">
                  {errors.role_title.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="company_url">Company Website</Label>
              <Input
                id="company_url"
                placeholder="https://..."
                {...register("company_url")}
              />
              {errors.company_url && (
                <p className="text-sm text-destructive">
                  {errors.company_url.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="target_industry">Industry</Label>
              <Input
                id="target_industry"
                placeholder="e.g. Fintech"
                {...register("target_industry")}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="job_description">Job Description</Label>
            <Textarea
              id="job_description"
              rows={8}
              placeholder="Paste the full job description here..."
              {...register("job_description")}
            />
            <p className="text-xs text-muted-foreground">
              Paste the full job description to help AI generate better content.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="why_this_company_md">
              Why does this company interest you?
            </Label>
            <Textarea
              id="why_this_company_md"
              rows={4}
              placeholder="What excites you about this company and role?"
              {...register("why_this_company_md")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="relevant_experience_ref">
              What relevant experience do you have?
            </Label>
            <Textarea
              id="relevant_experience_ref"
              rows={4}
              placeholder="Which projects, skills, or experiences are most relevant to this role?"
              {...register("relevant_experience_ref")}
            />
          </div>

          <div className="flex items-center gap-4">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? "Saving..."
                : isEditing
                  ? "Update Opportunity"
                  : "Create Opportunity"}
            </Button>
            {isEditing && isDirty && (
              <span className="text-sm text-muted-foreground">
                Unsaved changes
              </span>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
