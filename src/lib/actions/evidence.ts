"use server";

import { createClient } from "@/lib/supabase/server";
import { evidenceItemSchema } from "@/lib/validations/evidence";
import { revalidatePath } from "next/cache";

export async function createEvidenceItem(values: unknown) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const parsed = evidenceItemSchema.safeParse(values);
  if (!parsed.success) {
    return { error: "Invalid form data", details: parsed.error.flatten() };
  }

  // Get current max display_order for this user's unattached evidence
  const { data: existing } = await supabase
    .from("evidence_items")
    .select("display_order")
    .eq("user_id", user.id)
    .is("candidate_page_id", null)
    .order("display_order", { ascending: false })
    .limit(1);

  const nextOrder = existing && existing.length > 0 ? existing[0].display_order + 1 : 0;

  const { error } = await supabase.from("evidence_items").insert({
    ...parsed.data,
    user_id: user.id,
    display_order: nextOrder,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/profile");
  return { success: true };
}

export async function updateEvidenceItem(id: string, values: unknown) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const parsed = evidenceItemSchema.safeParse(values);
  if (!parsed.success) {
    return { error: "Invalid form data", details: parsed.error.flatten() };
  }

  const { error } = await supabase
    .from("evidence_items")
    .update(parsed.data)
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/profile");
  return { success: true };
}

export async function deleteEvidenceItem(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const { error } = await supabase
    .from("evidence_items")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/profile");
  return { success: true };
}
