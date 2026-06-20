"use server";

import { revalidatePath } from "next/cache";
import { renderNda, renderOfferLetter } from "@/lib/documents/render";
import type { Json } from "@/lib/database.types";
import { createClient } from "@/lib/supabase/server";

type OfferState = {
  error?: string;
  success?: string;
};

const allowedStatuses = new Set(["Interview Scheduled", "Offer Sent"]);

function cleanFilePart(value: string) {
  return value
    .trim()
    .replace(/[^a-zA-Z0-9.\-_]+/g, "-")
    .replace(/-+/g, "-")
    .toLowerCase();
}

export async function generateOfferDocuments(
  _previousState: OfferState,
  formData: FormData,
): Promise<OfferState> {
  const candidateId = String(formData.get("candidate_id") ?? "").trim();
  const roleTitle = String(formData.get("role_title") ?? "").trim();
  const currency = String(formData.get("currency") ?? "").trim();
  const salaryAmount = String(formData.get("salary_amount") ?? "").trim();
  const startDate = String(formData.get("start_date") ?? "").trim();
  const reportingManager = String(
    formData.get("reporting_manager") ?? "",
  ).trim();
  const location = String(formData.get("location") ?? "").trim();

  if (
    !candidateId ||
    !roleTitle ||
    !currency ||
    !salaryAmount ||
    !startDate ||
    !reportingManager ||
    !location
  ) {
    return { error: "Complete every offer document field." };
  }

  if (!/^\d+(\.\d{1,2})?$/.test(salaryAmount.replace(/,/g, ""))) {
    return { error: "Enter a valid salary amount." };
  }

  let supabase;

  try {
    supabase = await createClient();
  } catch {
    return { error: "Supabase is not configured yet." };
  }

  const { data: candidate, error: candidateError } = await supabase
    .from("candidates")
    .select("id,name,email,status")
    .eq("id", candidateId)
    .single();

  if (candidateError || !candidate) {
    return { error: "Candidate not found." };
  }

  if (!allowedStatuses.has(candidate.status)) {
    return {
      error:
        "Offer documents can be generated after an interview has been scheduled.",
    };
  }

  const generatedDate = new Intl.DateTimeFormat("en", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date());

  const documentInput = {
    candidateName: candidate.name,
    roleTitle,
    currency,
    salaryAmount,
    startDate,
    reportingManager,
    location,
    generatedDate,
  };

  const [offerBuffer, ndaBuffer] = await Promise.all([
    renderOfferLetter(documentInput),
    renderNda(documentInput),
  ]);

  const stamp = Date.now();
  const candidateSlug = cleanFilePart(candidate.name);
  const offerFileName = `offer-letter-${candidateSlug}-${stamp}.pdf`;
  const ndaFileName = `nda-${candidateSlug}-${stamp}.pdf`;
  const offerPath = `${candidateId}/${offerFileName}`;
  const ndaPath = `${candidateId}/${ndaFileName}`;

  const [offerUpload, ndaUpload] = await Promise.all([
    supabase.storage.from("documents").upload(offerPath, offerBuffer, {
      contentType: "application/pdf",
      upsert: false,
    }),
    supabase.storage.from("documents").upload(ndaPath, ndaBuffer, {
      contentType: "application/pdf",
      upsert: false,
    }),
  ]);

  if (offerUpload.error || ndaUpload.error) {
    return {
      error:
        offerUpload.error?.message ??
        ndaUpload.error?.message ??
        "Could not upload generated PDFs.",
    };
  }

  const metadata = {
    role_title: roleTitle,
    currency,
    salary_amount: salaryAmount,
    start_date: startDate,
    reporting_manager: reportingManager,
    location,
    generated_date: generatedDate,
  } satisfies Json;

  const { error: documentsError } = await supabase.from("documents").insert([
    {
      candidate_id: candidateId,
      type: "Offer Letter",
      file_path: offerPath,
      file_name: offerFileName,
      metadata,
    },
    {
      candidate_id: candidateId,
      type: "NDA",
      file_path: ndaPath,
      file_name: ndaFileName,
      metadata,
    },
  ]);

  if (documentsError) {
    return { error: documentsError.message };
  }

  const now = new Date().toISOString();
  const { error: updateError } = await supabase
    .from("candidates")
    .update({
      status: "Offer Sent",
      last_activity_at: now,
    })
    .eq("id", candidateId);

  if (updateError) {
    return { error: updateError.message };
  }

  await supabase.from("timeline_events").insert({
    candidate_id: candidateId,
    type: "offer_generated",
    title: "Offer documents generated",
    description: `Offer letter and NDA were generated for ${roleTitle}.`,
    metadata,
  });

  revalidatePath("/dashboard");
  revalidatePath(`/candidates/${candidateId}`);

  return { success: "Offer Letter and NDA generated." };
}
