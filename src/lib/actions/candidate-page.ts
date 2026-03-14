"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import {
  candidatePageEditorSchema,
  type CandidatePageEditorValues,
} from "@/lib/validations/candidate-page";

export async function updateCandidatePageContent(
  candidatePageId: string,
  values: CandidatePageEditorValues
): Promise<{ error?: string; success?: boolean }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  // Validate input
  const parsed = candidatePageEditorSchema.safeParse(values);
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Invalid input" };
  }

  // Verify ownership
  const { data: page } = await supabase
    .from("candidate_pages")
    .select("id, opportunity_id")
    .eq("id", candidatePageId)
    .eq("user_id", user.id)
    .single();

  if (!page) return { error: "Candidate page not found" };

  // Build update object with only non-undefined fields
  const update: Record<string, string | null> = {};
  if (parsed.data.headline !== undefined) {
    update.headline = parsed.data.headline || null;
  }
  if (parsed.data.recruiter_summary_md !== undefined) {
    update.recruiter_summary_md = parsed.data.recruiter_summary_md || null;
  }
  if (parsed.data.why_this_company_md !== undefined) {
    update.why_this_company_md = parsed.data.why_this_company_md || null;
  }
  if (parsed.data.evidence_summary_md !== undefined) {
    update.evidence_summary_md = parsed.data.evidence_summary_md || null;
  }

  if (Object.keys(update).length === 0) {
    return { success: true };
  }

  const { error: updateError } = await supabase
    .from("candidate_pages")
    .update(update)
    .eq("id", candidatePageId);

  if (updateError) {
    return { error: "Failed to save: " + updateError.message };
  }

  revalidatePath(`/opportunities/${page.opportunity_id}`);
  revalidatePath("/opportunities");
  revalidatePath("/dashboard");

  return { success: true };
}
