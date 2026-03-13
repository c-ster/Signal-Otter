import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        // Check if profile exists; if not, create one and redirect to profile setup
        const { data: profile } = await supabase
          .from("student_profiles")
          .select("id, full_name")
          .eq("user_id", user.id)
          .single();

        if (!profile) {
          await supabase.from("student_profiles").insert({
            user_id: user.id,
          });
          return NextResponse.redirect(`${origin}/profile`);
        }

        // If profile exists but name is empty, redirect to profile setup
        if (!profile.full_name) {
          return NextResponse.redirect(`${origin}/profile`);
        }
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_failed`);
}
