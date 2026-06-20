"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  generateApplicationToken,
  getApplicationLink,
  getTokenExpiryDate,
  hashApplicationToken,
} from "@/lib/tokens";

type AddCandidateState = {
  error?: string;
  magicLink?: string;
};

const MAX_RESUME_SIZE = 10 * 1024 * 1024;

function sanitizeFileName(fileName: string) {
  return fileName
    .trim()
    .replace(/[^a-zA-Z0-9.\-_]+/g, "-")
    .replace(/-+/g, "-")
    .toLowerCase();
}

export async function addCandidate(
  _previousState: AddCandidateState,
  formData: FormData,
): Promise<AddCandidateState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const jobId = String(formData.get("job_id") ?? "").trim();
  const resume = formData.get("resume");

  if (!name || !email || !jobId) {
    return { error: "Add the candidate name, email, and job opening." };
  }

  if (!(resume instanceof File) || resume.size === 0) {
    return { error: "Upload the candidate resume as a PDF." };
  }

  if (resume.size > MAX_RESUME_SIZE) {
    return { error: "Resume must be 10 MB or smaller." };
  }

  const fileName = sanitizeFileName(resume.name);
  const isPdf =
    resume.type === "application/pdf" || fileName.toLowerCase().endsWith(".pdf");

  if (!isPdf) {
    return { error: "Resume must be a PDF file." };
  }

  let supabase;

  try {
    supabase = await createClient();
  } catch {
    return { error: "Supabase is not configured yet." };
  }

  const { data: job, error: jobError } = await supabase
    .from("jobs")
    .select("id,status,title")
    .eq("id", jobId)
    .single();

  if (jobError || !job) {
    return { error: "Choose a valid open job opening." };
  }

  if (job.status !== "Open") {
    return { error: "Closed openings cannot have new candidates added." };
  }

  const candidateId = randomUUID();
  const resumePath = `${candidateId}/${Date.now()}-${fileName}`;
  const token = generateApplicationToken();
  const tokenHash = hashApplicationToken(token);
  const expiresAt = getTokenExpiryDate();
  const now = new Date().toISOString();

  const { error: uploadError } = await supabase.storage
    .from("resumes")
    .upload(resumePath, resume, {
      contentType: "application/pdf",
      upsert: false,
    });

  if (uploadError) {
    return { error: uploadError.message };
  }

  const { error: candidateError } = await supabase.from("candidates").insert({
    id: candidateId,
    job_id: jobId,
    name,
    email,
    status: "Applied",
    resume_file_path: resumePath,
    resume_file_name: resume.name,
    last_activity_at: now,
  });

  if (candidateError) {
    await supabase.storage.from("resumes").remove([resumePath]);
    return { error: candidateError.message };
  }

  const { error: tokenError } = await supabase.from("application_tokens").insert({
    candidate_id: candidateId,
    token_hash: tokenHash,
    expires_at: expiresAt.toISOString(),
  });

  if (tokenError) {
    return { error: tokenError.message };
  }

  await supabase.from("timeline_events").insert({
    candidate_id: candidateId,
    type: "candidate_applied",
    title: "Candidate added",
    description: `${name} was added to ${job.title}.`,
    metadata: {
      job_id: jobId,
      resume_file_path: resumePath,
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/jobs");

  return { magicLink: getApplicationLink(token) };
}
