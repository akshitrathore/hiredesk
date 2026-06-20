"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

type DecisionState = {
  error?: string;
  success?: string;
};

const terminalStatuses = new Set(["Hired", "Rejected"]);

async function getSupabase() {
  try {
    return await createClient();
  } catch {
    return null;
  }
}

export async function markCandidateHired(
  _previousState: DecisionState,
  formData: FormData,
): Promise<DecisionState> {
  const candidateId = String(formData.get("candidate_id") ?? "").trim();

  if (!candidateId) {
    return { error: "Missing candidate id." };
  }

  const supabase = await getSupabase();

  if (!supabase) {
    return { error: "Supabase is not configured yet." };
  }

  const { data: candidate, error: candidateError } = await supabase
    .from("candidates")
    .select("id,name,status")
    .eq("id", candidateId)
    .single();

  if (candidateError || !candidate) {
    return { error: "Candidate not found." };
  }

  if (terminalStatuses.has(candidate.status)) {
    return { error: "Candidate is already in a terminal status." };
  }

  const { data: documents, error: documentsError } = await supabase
    .from("documents")
    .select("type")
    .eq("candidate_id", candidateId);

  if (documentsError) {
    return { error: documentsError.message };
  }

  const documentTypes = new Set(documents?.map((document) => document.type));

  if (!documentTypes.has("Offer Letter") || !documentTypes.has("NDA")) {
    return {
      error: "Generate the offer letter and NDA before marking hired.",
    };
  }

  const now = new Date().toISOString();
  const { error: updateError } = await supabase
    .from("candidates")
    .update({
      status: "Hired",
      last_activity_at: now,
    })
    .eq("id", candidateId);

  if (updateError) {
    return { error: updateError.message };
  }

  await supabase.from("timeline_events").insert({
    candidate_id: candidateId,
    type: "candidate_hired",
    title: "Candidate marked hired",
    description: `${candidate.name} was moved to Hired.`,
    metadata: {},
  });

  revalidatePath("/dashboard");
  revalidatePath(`/candidates/${candidateId}`);

  return { success: "Candidate marked as hired." };
}

export async function rejectCandidate(
  _previousState: DecisionState,
  formData: FormData,
): Promise<DecisionState> {
  const candidateId = String(formData.get("candidate_id") ?? "").trim();
  const reason = String(formData.get("reason") ?? "").trim();

  if (!candidateId) {
    return { error: "Missing candidate id." };
  }

  if (!reason) {
    return { error: "Add a rejection reason." };
  }

  const supabase = await getSupabase();

  if (!supabase) {
    return { error: "Supabase is not configured yet." };
  }

  const { data: candidate, error: candidateError } = await supabase
    .from("candidates")
    .select("id,name,status")
    .eq("id", candidateId)
    .single();

  if (candidateError || !candidate) {
    return { error: "Candidate not found." };
  }

  if (terminalStatuses.has(candidate.status)) {
    return { error: "Candidate is already in a terminal status." };
  }

  const now = new Date().toISOString();
  const { error: updateError } = await supabase
    .from("candidates")
    .update({
      status: "Rejected",
      rejection_reason: reason,
      last_activity_at: now,
    })
    .eq("id", candidateId);

  if (updateError) {
    return { error: updateError.message };
  }

  await supabase.from("timeline_events").insert({
    candidate_id: candidateId,
    type: "candidate_rejected",
    title: "Candidate rejected",
    description: reason,
    metadata: {
      reason,
    },
  });

  revalidatePath("/dashboard");
  revalidatePath(`/candidates/${candidateId}`);

  return { success: "Candidate rejected." };
}
