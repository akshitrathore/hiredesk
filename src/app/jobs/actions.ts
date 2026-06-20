"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { parseTags } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";

type JobFormState = {
  error?: string;
};

type JobStatus = "Open" | "Closed";

function readJobForm(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const requiredSkills = parseTags(formData.get("required_skills"));
  const rawStatus = String(formData.get("status") ?? "Open");
  const status: JobStatus = rawStatus === "Closed" ? "Closed" : "Open";
  const hasValidStatus = rawStatus === "Open" || rawStatus === "Closed";

  return { title, description, requiredSkills, status, hasValidStatus };
}

function validateJobForm({
  title,
  description,
  requiredSkills,
  hasValidStatus,
}: ReturnType<typeof readJobForm>) {
  if (!title || !description || requiredSkills.length === 0) {
    return "Add a title, description, and at least one required skill.";
  }

  if (!hasValidStatus) {
    return "Choose a valid job status.";
  }

  return null;
}

export async function createJob(
  _previousState: JobFormState,
  formData: FormData,
): Promise<JobFormState> {
  const values = readJobForm(formData);
  const validationError = validateJobForm(values);

  if (validationError) {
    return { error: validationError };
  }

  let supabase;

  try {
    supabase = await createClient();
  } catch {
    return { error: "Supabase is not configured yet." };
  }

  const { error } = await supabase.from("jobs").insert({
    title: values.title,
    description: values.description,
    required_skills: values.requiredSkills,
    status: values.status,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/jobs");
  revalidatePath("/dashboard");
  redirect("/jobs");
}

export async function updateJob(
  _previousState: JobFormState,
  formData: FormData,
): Promise<JobFormState> {
  const id = String(formData.get("id") ?? "").trim();
  const values = readJobForm(formData);
  const validationError = validateJobForm(values);

  if (!id) {
    return { error: "Missing job opening id." };
  }

  if (validationError) {
    return { error: validationError };
  }

  let supabase;

  try {
    supabase = await createClient();
  } catch {
    return { error: "Supabase is not configured yet." };
  }

  const { error } = await supabase
    .from("jobs")
    .update({
      title: values.title,
      description: values.description,
      required_skills: values.requiredSkills,
      status: values.status,
    })
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/jobs");
  revalidatePath(`/jobs/${id}/edit`);
  revalidatePath("/dashboard");
  redirect("/jobs");
}
