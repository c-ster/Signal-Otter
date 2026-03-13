"use server";

import { createClient } from "@/lib/supabase/server";
import { studentProfileSchema } from "@/lib/validations/profile";
import { revalidatePath } from "next/cache";

export async function updateProfile(values: unknown) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const parsed = studentProfileSchema.safeParse(values);
  if (!parsed.success) {
    return { error: "Invalid form data", details: parsed.error.flatten() };
  }

  const { error } = await supabase
    .from("student_profiles")
    .update(parsed.data)
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/profile");
  revalidatePath("/dashboard");
  return { success: true };
}
