"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { hashApplicationToken } from "@/lib/tokens";

type ApplicationState = {
  error?: string;
  success?: boolean;
};

export async function submitApplication(
  _previousState: ApplicationState,
  formData: FormData,
): Promise<ApplicationState> {
  const token = String(formData.get("token") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const currentLocation = String(formData.get("current_location") ?? "").trim();
  const currentPosition = String(formData.get("current_position") ?? "").trim();
  const noticePeriod = String(formData.get("notice_period") ?? "").trim();
  const salaryExpectation = String(
    formData.get("salary_expectation") ?? "",
  ).trim();
  const linkedinUrl = String(formData.get("linkedin_url") ?? "").trim();

  if (
    !token ||
    !phone ||
    !currentLocation ||
    !currentPosition ||
    !noticePeriod ||
    !salaryExpectation ||
    !linkedinUrl
  ) {
    return { error: "Complete every field before submitting." };
  }

  let parsedLinkedInUrl: URL;

  try {
    parsedLinkedInUrl = new URL(linkedinUrl);
  } catch {
    return { error: "Enter a valid LinkedIn URL." };
  }

  if (!parsedLinkedInUrl.hostname.includes("linkedin.com")) {
    return { error: "Enter a LinkedIn profile URL." };
  }

  let supabase;

  try {
    supabase = createAdminClient();
  } catch {
    return { error: "Supabase is not configured yet." };
  }

  const tokenHash = hashApplicationToken(token);
  const { data: applicationToken, error: tokenError } = await supabase
    .from("application_tokens")
    .select("id,candidate_id,expires_at,used_at")
    .eq("token_hash", tokenHash)
    .single();

  if (tokenError || !applicationToken) {
    return { error: "This application link is invalid." };
  }

  if (applicationToken.used_at) {
    return { error: "This application link has already been used." };
  }

  if (new Date(applicationToken.expires_at).getTime() < Date.now()) {
    return { error: "This application link has expired." };
  }

  const now = new Date().toISOString();
  const { error: candidateError } = await supabase
    .from("candidates")
    .update({
      phone,
      current_location: currentLocation,
      current_position: currentPosition,
      notice_period: noticePeriod,
      salary_expectation: salaryExpectation,
      linkedin_url: parsedLinkedInUrl.toString(),
      status: "Form Submitted",
      last_activity_at: now,
    })
    .eq("id", applicationToken.candidate_id);

  if (candidateError) {
    return { error: candidateError.message };
  }

  const { error: usedError } = await supabase
    .from("application_tokens")
    .update({ used_at: now })
    .eq("id", applicationToken.id)
    .is("used_at", null);

  if (usedError) {
    return { error: usedError.message };
  }

  await supabase.from("timeline_events").insert({
    candidate_id: applicationToken.candidate_id,
    type: "form_submitted",
    title: "Application form submitted",
    description: "The candidate completed their application details.",
    metadata: {
      linkedin_url: parsedLinkedInUrl.toString(),
    },
  });

  revalidatePath("/dashboard");
  revalidatePath(`/candidates/${applicationToken.candidate_id}`);

  return { success: true };
}
