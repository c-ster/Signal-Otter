"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  studentProfileSchema,
  type StudentProfileFormValues,
} from "@/lib/validations/profile";
import { updateProfile } from "@/lib/actions/profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import type { StudentProfile } from "@/types/database";

export function ProfileForm({ profile }: { profile: StudentProfile }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<StudentProfileFormValues>({
    resolver: zodResolver(studentProfileSchema),
    defaultValues: {
      full_name: profile.full_name ?? "",
      school: profile.school ?? "",
      graduation_date: profile.graduation_date ?? "",
      major: profile.major ?? "",
      bio: profile.bio ?? "",
      linkedin_url: profile.linkedin_url ?? "",
      github_url: profile.github_url ?? "",
      portfolio_url: profile.portfolio_url ?? "",
    },
  });

  async function onSubmit(data: StudentProfileFormValues) {
    const result = await updateProfile(data);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Profile saved");
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Profile</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name *</Label>
              <Input id="full_name" {...register("full_name")} />
              {errors.full_name && (
                <p className="text-sm text-destructive">
                  {errors.full_name.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="major">Major / Field</Label>
              <Input id="major" {...register("major")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="school">School / Organization</Label>
              <Input id="school" {...register("school")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="graduation_date">Graduation Date</Label>
              <Input
                id="graduation_date"
                type="date"
                {...register("graduation_date")}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              rows={4}
              placeholder="Tell us about yourself, what makes you unique, your proudest accomplishment..."
              {...register("bio")}
            />
            {errors.bio && (
              <p className="text-sm text-destructive">{errors.bio.message}</p>
            )}
          </div>

          <div className="grid gap-6 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="linkedin_url">LinkedIn URL</Label>
              <Input
                id="linkedin_url"
                placeholder="https://linkedin.com/in/..."
                {...register("linkedin_url")}
              />
              {errors.linkedin_url && (
                <p className="text-sm text-destructive">
                  {errors.linkedin_url.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="github_url">GitHub URL</Label>
              <Input
                id="github_url"
                placeholder="https://github.com/..."
                {...register("github_url")}
              />
              {errors.github_url && (
                <p className="text-sm text-destructive">
                  {errors.github_url.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="portfolio_url">Portfolio URL</Label>
              <Input
                id="portfolio_url"
                placeholder="https://..."
                {...register("portfolio_url")}
              />
              {errors.portfolio_url && (
                <p className="text-sm text-destructive">
                  {errors.portfolio_url.message}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Profile"}
            </Button>
            {isDirty && (
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
