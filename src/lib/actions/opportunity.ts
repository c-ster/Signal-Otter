"use server";

import { createClient } from "@/lib/supabase/server";
import { opportunitySchema } from "@/lib/validations/opportunity";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function createOpportunity(values: unknown) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  const parsed = opportunitySchema.safeParse(values);
  if (!parsed.success)
    return { error: "Invalid form data", details: parsed.error.flatten() };

  // Insert opportunity
  const { data: opportunity, error: oppError } = await supabase
    .from("opportunities")
    .insert({ ...parsed.data, user_id: user.id })
    .select()
    .single();

  if (oppError || !opportunity)
    return { error: oppError?.message ?? "Failed to create opportunity" };

  // Auto-create associated candidate page in draft status
  // Generate slug from student name + company + role
  const { data: profile } = await supabase
    .from("student_profiles")
    .select("full_name")
    .eq("user_id", user.id)
    .single();

  const namePart = (profile?.full_name ?? "user")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  const companyPart = opportunity.company_name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  const rolePart = opportunity.role_title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  const slug = `${namePart}/${companyPart}-${rolePart}`;

  await supabase.from("candidate_pages").insert({
    user_id: user.id,
    opportunity_id: opportunity.id,
    slug,
    status: "draft",
  });

  revalidatePath("/opportunities");
  revalidatePath("/dashboard");
  redirect(`/opportunities/${opportunity.id}`);
}

export async function updateOpportunity(id: string, values: unknown) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  const parsed = opportunitySchema.safeParse(values);
  if (!parsed.success)
    return { error: "Invalid form data", details: parsed.error.flatten() };

  const { error } = await supabase
    .from("opportunities")
    .update(parsed.data)
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { error: error.message };

  revalidatePath(`/opportunities/${id}`);
  revalidatePath("/opportunities");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function deleteOpportunity(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("opportunities")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/opportunities");
  revalidatePath("/dashboard");
  redirect("/opportunities");
}
