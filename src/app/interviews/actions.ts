"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

type InterviewState = {
  error?: string;
  success?: string;
};

const terminalStatuses = new Set(["Hired", "Rejected"]);
const interviewSchedulingStatuses = new Set([
  "Form Submitted",
  "Interview Scheduled",
]);

export async function scheduleInterview(
  _previousState: InterviewState,
  formData: FormData,
): Promise<InterviewState> {
  const candidateId = String(formData.get("candidate_id") ?? "").trim();
  const date = String(formData.get("date") ?? "").trim();
  const time = String(formData.get("time") ?? "").trim();
  const type = String(formData.get("type") ?? "").trim();
  const interviewerName = String(formData.get("interviewer_name") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();

  if (!candidateId || !date || !time || !type || !interviewerName) {
    return { error: "Add date, time, type, and interviewer name." };
  }

  if (type !== "Screening" && type !== "Technical") {
    return { error: "Choose a valid interview type." };
  }

  const scheduledAt = new Date(`${date}T${time}`);

  if (Number.isNaN(scheduledAt.getTime())) {
    return { error: "Choose a valid interview date and time." };
  }

  let supabase;

  try {
    supabase = await createClient();
  } catch {
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
    return { error: "Terminal candidates cannot be scheduled." };
  }

  if (!interviewSchedulingStatuses.has(candidate.status)) {
    return {
      error:
        "The candidate must submit their application form before an interview can be scheduled.",
    };
  }

  const { data: pendingInterview, error: pendingError } = await supabase
    .from("interviews")
    .select("id")
    .eq("candidate_id", candidateId)
    .eq("status", "Scheduled")
    .limit(1)
    .maybeSingle();

  if (pendingError) {
    return { error: pendingError.message };
  }

  if (pendingInterview) {
    return {
      error:
        "Complete the pending interview before scheduling another one for this candidate.",
    };
  }

  const now = new Date().toISOString();
  const { error: interviewError } = await supabase.from("interviews").insert({
    candidate_id: candidateId,
    scheduled_at: scheduledAt.toISOString(),
    type,
    interviewer_name: interviewerName,
    notes: notes || null,
    status: "Scheduled",
  });

  if (interviewError) {
    return { error: interviewError.message };
  }

  const { error: updateError } = await supabase
    .from("candidates")
    .update({
      status: "Interview Scheduled",
      last_activity_at: now,
    })
    .eq("id", candidateId);

  if (updateError) {
    return { error: updateError.message };
  }

  await supabase.from("timeline_events").insert({
    candidate_id: candidateId,
    type: "interview_scheduled",
    title: `${type} interview scheduled`,
    description: `${interviewerName} will interview ${candidate.name} on ${scheduledAt.toLocaleString()}.`,
    metadata: {
      scheduled_at: scheduledAt.toISOString(),
      interviewer_name: interviewerName,
      notes,
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/interviews");
  revalidatePath(`/candidates/${candidateId}`);

  return { success: "Interview scheduled." };
}

export async function completeInterview(
  _previousState: InterviewState,
  formData: FormData,
): Promise<InterviewState> {
  const interviewId = String(formData.get("interview_id") ?? "").trim();
  const candidateId = String(formData.get("candidate_id") ?? "").trim();
  const recommendation = String(formData.get("recommendation") ?? "").trim();
  const feedbackNote = String(formData.get("feedback_note") ?? "").trim();

  if (!interviewId || !candidateId || !recommendation || !feedbackNote) {
    return { error: "Add a recommendation and feedback note." };
  }

  if (
    recommendation !== "Hire" &&
    recommendation !== "No Hire" &&
    recommendation !== "Maybe"
  ) {
    return { error: "Choose a valid recommendation." };
  }

  let supabase;

  try {
    supabase = await createClient();
  } catch {
    return { error: "Supabase is not configured yet." };
  }

  const { data: candidate, error: candidateError } = await supabase
    .from("candidates")
    .select("id,status")
    .eq("id", candidateId)
    .single();

  if (candidateError || !candidate) {
    return { error: "Candidate not found." };
  }

  if (terminalStatuses.has(candidate.status)) {
    return { error: "Terminal candidates cannot receive interview feedback." };
  }

  const { data: interview, error: interviewLookupError } = await supabase
    .from("interviews")
    .select("id,status")
    .eq("id", interviewId)
    .eq("candidate_id", candidateId)
    .single();

  if (interviewLookupError || !interview) {
    return { error: "Interview not found." };
  }

  if (interview.status !== "Scheduled") {
    return { error: "Only scheduled interviews can be completed." };
  }

  const now = new Date().toISOString();
  const { error: interviewError } = await supabase
    .from("interviews")
    .update({
      status: "Completed",
      recommendation,
      feedback_note: feedbackNote,
      completed_at: now,
    })
    .eq("id", interviewId)
    .eq("candidate_id", candidateId);

  if (interviewError) {
    return { error: interviewError.message };
  }

  const { error: candidateUpdateError } = await supabase
    .from("candidates")
    .update({ last_activity_at: now })
    .eq("id", candidateId);

  if (candidateUpdateError) {
    return { error: candidateUpdateError.message };
  }

  await supabase.from("timeline_events").insert({
    candidate_id: candidateId,
    type: "interview_completed",
    title: `Interview completed: ${recommendation}`,
    description: feedbackNote,
    metadata: {
      interview_id: interviewId,
      recommendation,
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/interviews");
  revalidatePath(`/candidates/${candidateId}`);

  return { success: "Feedback recorded." };
}
