"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type SignInState = {
  error?: string;
};

export async function signIn(
  _previousState: SignInState,
  formData: FormData,
): Promise<SignInState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const nextPath = String(formData.get("next") ?? "/dashboard") || "/dashboard";

  if (!email || !password) {
    return { error: "Enter both email and password." };
  }

  let supabase;

  try {
    supabase = await createClient();
  } catch {
    return { error: "Supabase is not configured yet." };
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: "We could not sign you in with those credentials." };
  }

  if (data.user.email) {
    await supabase.from("hr_users").upsert(
      {
        auth_user_id: data.user.id,
        email: data.user.email,
        name: data.user.user_metadata?.name ?? null,
      },
      { onConflict: "auth_user_id" },
    );
  }

  redirect(nextPath.startsWith("/") ? nextPath : "/dashboard");
}

export async function signOut() {
  try {
    const supabase = await createClient();
    await supabase.auth.signOut();
  } catch {
    // If Supabase is not configured yet, still send the user to sign in.
  }

  redirect("/sign-in");
}
