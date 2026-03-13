import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { MarkdownRenderer } from "@/components/shared/markdown-renderer";
import { MiniAppRenderer } from "@/components/mini-app/mini-app-renderer";

export default async function PublicCandidatePage({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug: segments } = await params;
  const slug = segments.join("/");

  const supabase = await createClient();

  // Find the published page by slug
  const { data: publishedPage } = await supabase
    .from("published_pages")
    .select("*")
    .eq("public_slug", slug)
    .eq("is_public", true)
    .single();

  if (!publishedPage) notFound();

  // Fetch the candidate page
  const { data: candidatePage } = await supabase
    .from("candidate_pages")
    .select("*")
    .eq("id", publishedPage.candidate_page_id)
    .single();

  if (!candidatePage) notFound();

  // Fetch related data in parallel
  const [opportunityRes, profileRes, miniProjectRes] = await Promise.all([
    supabase
      .from("opportunities")
      .select("*")
      .eq("id", candidatePage.opportunity_id)
      .single(),
    supabase
      .from("student_profiles")
      .select("*")
      .eq("user_id", candidatePage.user_id)
      .single(),
    supabase
      .from("mini_projects")
      .select("*")
      .eq("candidate_page_id", candidatePage.id)
      .maybeSingle(),
  ]);

  const opportunity = opportunityRes.data;
  const profile = profileRes.data;
  const miniProject = miniProjectRes.data;

  // Fetch two-week plan if mini project exists
  let twoWeekPlan = null;
  if (miniProject) {
    const { data } = await supabase
      .from("two_week_plans")
      .select("*")
      .eq("mini_project_id", miniProject.id)
      .maybeSingle();
    twoWeekPlan = data;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {profile?.full_name ?? "Candidate"}
        </h1>
        {candidatePage.headline && (
          <p className="mt-1 text-lg text-muted-foreground">
            {candidatePage.headline}
          </p>
        )}
        {opportunity && (
          <div className="mt-2 flex items-center gap-2">
            <Badge variant="secondary">{opportunity.company_name}</Badge>
            <Badge variant="outline">{opportunity.role_title}</Badge>
          </div>
        )}
      </div>

      <Separator />

      {/* Recruiter Summary */}
      {candidatePage.recruiter_summary_md && (
        <section>
          <h2 className="mb-3 text-xl font-semibold">Summary</h2>
          <Card>
            <CardContent className="pt-6">
              <MarkdownRenderer content={candidatePage.recruiter_summary_md} />
            </CardContent>
          </Card>
        </section>
      )}

      {/* Why This Company */}
      {candidatePage.why_this_company_md && (
        <section>
          <h2 className="mb-3 text-xl font-semibold">
            Why {opportunity?.company_name ?? "This Company"}
          </h2>
          <Card>
            <CardContent className="pt-6">
              <MarkdownRenderer content={candidatePage.why_this_company_md} />
            </CardContent>
          </Card>
        </section>
      )}

      {/* Evidence Summary */}
      {candidatePage.evidence_summary_md && (
        <section>
          <h2 className="mb-3 text-xl font-semibold">Evidence of Impact</h2>
          <Card>
            <CardContent className="pt-6">
              <MarkdownRenderer content={candidatePage.evidence_summary_md} />
            </CardContent>
          </Card>
        </section>
      )}

      {/* Mini App Demo */}
      {miniProject?.app_config_json && (
        <section>
          <h2 className="mb-3 text-xl font-semibold">Interactive Demo</h2>
          <MiniAppRenderer
            appConfig={miniProject.app_config_json as Record<string, unknown>}
          />
        </section>
      )}

      {/* Two-Week Plan */}
      {twoWeekPlan?.plan_md && (
        <section>
          <h2 className="mb-3 text-xl font-semibold">
            Two-Week Implementation Plan
          </h2>
          <Card>
            <CardContent className="pt-6">
              <MarkdownRenderer content={twoWeekPlan.plan_md} />
            </CardContent>
          </Card>
        </section>
      )}

      {/* Footer */}
      <Separator />
      <p className="text-center text-xs text-muted-foreground">
        Built with Signal Otter
      </p>
    </div>
  );
}
