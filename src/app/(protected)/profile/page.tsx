import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ProfileForm } from "@/components/forms/profile-form";
import { EvidenceList } from "@/components/shared/evidence-list";

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("student_profiles")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (!profile) redirect("/login");

  const { data: evidenceItems } = await supabase
    .from("evidence_items")
    .select("*")
    .eq("user_id", user.id)
    .is("candidate_page_id", null)
    .order("display_order", { ascending: true });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Your Profile</h1>
        <p className="text-muted-foreground">
          Build your profile to help AI generate better content for your
          candidate pages.
        </p>
      </div>
      <ProfileForm profile={profile} />
      <EvidenceList items={evidenceItems ?? []} />
    </div>
  );
}
