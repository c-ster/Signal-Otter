"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  candidatePageEditorSchema,
  type CandidatePageEditorValues,
} from "@/lib/validations/candidate-page";
import { updateCandidatePageContent } from "@/lib/actions/candidate-page";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import { toast } from "sonner";
import { MarkdownEditor } from "./markdown-editor";
import type { CandidatePage } from "@/types/database";

interface PageEditorProps {
  candidatePage: CandidatePage;
}

export function PageEditor({ candidatePage }: PageEditorProps) {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<CandidatePageEditorValues>({
    resolver: zodResolver(candidatePageEditorSchema),
    defaultValues: {
      headline: candidatePage.headline ?? "",
      recruiter_summary_md: candidatePage.recruiter_summary_md ?? "",
      why_this_company_md: candidatePage.why_this_company_md ?? "",
      evidence_summary_md: candidatePage.evidence_summary_md ?? "",
    },
  });

  async function onSubmit(data: CandidatePageEditorValues) {
    const result = await updateCandidatePageContent(candidatePage.id, data);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Content saved!");
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Edit Page Content</CardTitle>
          {isDirty && (
            <span className="text-xs text-amber-600 dark:text-amber-400">
              Unsaved changes
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Tabs defaultValue={0}>
            <TabsList>
              <TabsTrigger value={0}>Headline</TabsTrigger>
              <TabsTrigger value={1}>Recruiter Summary</TabsTrigger>
              <TabsTrigger value={2}>Why This Company</TabsTrigger>
              <TabsTrigger value={3}>Evidence Summary</TabsTrigger>
            </TabsList>

            <TabsContent value={0} className="pt-4">
              <div className="space-y-2">
                <Label htmlFor="headline">Page Headline</Label>
                <Input
                  id="headline"
                  placeholder="e.g., Product-minded engineer with 3 years of SaaS experience"
                  {...register("headline")}
                />
                {errors.headline && (
                  <p className="text-xs text-destructive">
                    {errors.headline.message}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  A short tagline shown below your name on the public page.
                </p>
              </div>
            </TabsContent>

            <TabsContent value={1} className="pt-4">
              <Controller
                name="recruiter_summary_md"
                control={control}
                render={({ field }) => (
                  <MarkdownEditor
                    label="Recruiter Summary"
                    value={field.value ?? ""}
                    onChange={field.onChange}
                    placeholder="Write a summary of your qualifications..."
                  />
                )}
              />
              {errors.recruiter_summary_md && (
                <p className="text-xs text-destructive">
                  {errors.recruiter_summary_md.message}
                </p>
              )}
            </TabsContent>

            <TabsContent value={2} className="pt-4">
              <Controller
                name="why_this_company_md"
                control={control}
                render={({ field }) => (
                  <MarkdownEditor
                    label="Why This Company"
                    value={field.value ?? ""}
                    onChange={field.onChange}
                    placeholder="Explain why you're excited about this company..."
                  />
                )}
              />
              {errors.why_this_company_md && (
                <p className="text-xs text-destructive">
                  {errors.why_this_company_md.message}
                </p>
              )}
            </TabsContent>

            <TabsContent value={3} className="pt-4">
              <Controller
                name="evidence_summary_md"
                control={control}
                render={({ field }) => (
                  <MarkdownEditor
                    label="Evidence Summary"
                    value={field.value ?? ""}
                    onChange={field.onChange}
                    placeholder="Summarize your key evidence and achievements..."
                  />
                )}
              />
              {errors.evidence_summary_md && (
                <p className="text-xs text-destructive">
                  {errors.evidence_summary_md.message}
                </p>
              )}
            </TabsContent>
          </Tabs>

          <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting || !isDirty}>
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
