"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { CandidatePageStatus } from "@/types/database";

// ── Helpers ─────────────────────────────────────────────────────────

async function authenticateAndGetPage(candidatePageId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" as const };

  const { data: page } = await supabase
    .from("candidate_pages")
    .select("*")
    .eq("id", candidatePageId)
    .eq("user_id", user.id)
    .single();

  if (!page) return { error: "Candidate page not found" as const };

  return { supabase, user, page };
}

function revalidatePages(opportunityId: string) {
  revalidatePath(`/opportunities/${opportunityId}`);
  revalidatePath("/opportunities");
  revalidatePath("/dashboard");
}

// ── Publish ─────────────────────────────────────────────────────────

export async function publishCandidatePage(
  candidatePageId: string
): Promise<{ error?: string; success?: boolean; publicUrl?: string }> {
  const result = await authenticateAndGetPage(candidatePageId);
  if ("error" in result) return { error: result.error };

  const { supabase, page } = result;
  const status = page.status as CandidatePageStatus;

  // Must have completed all generation steps
  if (status !== "two_week_plan_generated" && status !== "published") {
    return {
      error:
        "All generation steps must be completed before publishing. Current status: " +
        status,
    };
  }

  if (!page.slug) {
    return { error: "Candidate page has no slug. Please recreate the opportunity." };
  }

  // Upsert into published_pages
  const { error: publishError } = await supabase
    .from("published_pages")
    .upsert(
      {
        candidate_page_id: candidatePageId,
        public_slug: page.slug,
        is_public: true,
      },
      { onConflict: "candidate_page_id" }
    );

  if (publishError) {
    return { error: "Failed to publish: " + publishError.message };
  }

  // Update candidate page status
  const { error: updateError } = await supabase
    .from("candidate_pages")
    .update({
      status: "published" as CandidatePageStatus,
      published_at: new Date().toISOString(),
    })
    .eq("id", candidatePageId);

  if (updateError) {
    return { error: "Failed to update page status: " + updateError.message };
  }

  revalidatePages(page.opportunity_id);

  const publicUrl = `/p/${page.slug}`;
  return { success: true, publicUrl };
}

// ── Unpublish ───────────────────────────────────────────────────────

export async function unpublishCandidatePage(
  candidatePageId: string
): Promise<{ error?: string; success?: boolean }> {
  const result = await authenticateAndGetPage(candidatePageId);
  if ("error" in result) return { error: result.error };

  const { supabase, page } = result;

  // Set is_public = false (keep the record for re-publishing)
  const { error: unpublishError } = await supabase
    .from("published_pages")
    .update({ is_public: false })
    .eq("candidate_page_id", candidatePageId);

  if (unpublishError) {
    return { error: "Failed to unpublish: " + unpublishError.message };
  }

  // Revert status
  const { error: updateError } = await supabase
    .from("candidate_pages")
    .update({
      status: "two_week_plan_generated" as CandidatePageStatus,
      published_at: null,
    })
    .eq("id", candidatePageId);

  if (updateError) {
    return { error: "Failed to update page status: " + updateError.message };
  }

  revalidatePages(page.opportunity_id);

  return { success: true };
}
