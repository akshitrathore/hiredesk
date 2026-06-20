import Link from "next/link";
import { ArrowLeft, Download, ExternalLink } from "lucide-react";
import {
  CompleteInterviewForm,
  ScheduleInterviewForm,
} from "@/app/candidates/[id]/interview-forms";
import { ApplicationLinkCard } from "@/app/candidates/[id]/application-link-card";
import { CandidateDecisionPanel } from "@/app/candidates/[id]/decision-form";
import { OfferDocumentForm } from "@/app/candidates/[id]/offer-form";
import { AppShell } from "@/components/app-shell";
import { StatusBadge } from "@/components/status-badge";
import { formatDate, formatDateTime } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import { getApplicationLink } from "@/lib/tokens";

type CandidateProfile = {
  name: string;
  email: string;
  phone: string | null;
  current_location: string | null;
  current_position: string | null;
  notice_period: string | null;
  salary_expectation: string | null;
  linkedin_url: string | null;
  resume_file_name: string | null;
  status: string;
  last_activity_at: string;
  jobTitle: string;
  resumeUrl: string | null;
};

type Interview = {
  id: string;
  scheduled_at: string;
  type: "Screening" | "Technical";
  interviewer_name: string;
  notes: string | null;
  status: "Scheduled" | "Completed";
  recommendation: "Hire" | "No Hire" | "Maybe" | null;
  feedback_note: string | null;
  completed_at: string | null;
};

type TimelineEvent = {
  id: string;
  title: string;
  description: string | null;
  created_at: string;
};

type CandidateDocument = {
  id: string;
  type: "Offer Letter" | "NDA";
  file_name: string;
  created_at: string;
  downloadUrl: string | null;
};

export default async function CandidateProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let candidate: CandidateProfile | null = null;
  let interviews: Interview[] = [];
  let timelineEvents: TimelineEvent[] = [];
  let documents: CandidateDocument[] = [];
  let activeApplicationLink: string | null = null;
  let error: string | null = null;

  try {
    const supabase = await createClient();
    const [
      { data, error: queryError },
      { data: interviewRows, error: interviewsError },
      { data: timelineRows, error: timelineError },
      { data: documentRows, error: documentsError },
      { data: tokenRow, error: tokenError },
    ] = await Promise.all([
      supabase
        .from("candidates")
        .select(
          "name,email,phone,current_location,current_position,notice_period,salary_expectation,linkedin_url,resume_file_path,resume_file_name,status,last_activity_at,jobs(title)",
        )
        .eq("id", id)
        .single(),
      supabase
        .from("interviews")
        .select(
          "id,scheduled_at,type,interviewer_name,notes,status,recommendation,feedback_note,completed_at",
        )
        .eq("candidate_id", id)
        .order("scheduled_at", { ascending: false }),
      supabase
        .from("timeline_events")
        .select("id,title,description,created_at")
        .eq("candidate_id", id)
        .order("created_at", { ascending: false })
        .order("id", { ascending: false }),
      supabase
        .from("documents")
        .select("id,type,file_path,file_name,created_at")
        .eq("candidate_id", id)
        .order("created_at", { ascending: false }),
      supabase
        .from("application_tokens")
        .select("token,expires_at,used_at")
        .eq("candidate_id", id)
        .is("used_at", null)
        .gt("expires_at", new Date().toISOString())
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);

    if (queryError) {
      error = queryError.message;
    } else if (interviewsError) {
      error = interviewsError.message;
    } else if (timelineError) {
      error = timelineError.message;
    } else if (documentsError) {
      error = documentsError.message;
    } else if (tokenError) {
      error = tokenError.message;
    } else if (data) {
      let resumeUrl: string | null = null;

      if (data.resume_file_path) {
        const { data: signedUrl } = await supabase.storage
          .from("resumes")
          .createSignedUrl(data.resume_file_path, 60);
        resumeUrl = signedUrl?.signedUrl ?? null;
      }

      candidate = {
        name: data.name,
        email: data.email,
        phone: data.phone,
        current_location: data.current_location,
        current_position: data.current_position,
        notice_period: data.notice_period,
        salary_expectation: data.salary_expectation,
        linkedin_url: data.linkedin_url,
        resume_file_name: data.resume_file_name,
        status: data.status,
        last_activity_at: data.last_activity_at,
        jobTitle: data.jobs?.title ?? "Unassigned role",
        resumeUrl,
      };
      interviews = interviewRows ?? [];
      timelineEvents = timelineRows ?? [];
      documents = await Promise.all(
        (documentRows ?? []).map(async (document) => {
          const { data: signedUrl } = await supabase.storage
            .from("documents")
            .createSignedUrl(document.file_path, 60);

          return {
            id: document.id,
            type: document.type,
            file_name: document.file_name,
            created_at: document.created_at,
            downloadUrl: signedUrl?.signedUrl ?? null,
          };
        }),
      );
      activeApplicationLink = tokenRow?.token
        ? getApplicationLink(tokenRow.token)
        : null;
    }
  } catch {
    error = "Supabase is not configured yet.";
  }

  const isTerminal = candidate
    ? candidate.status === "Hired" || candidate.status === "Rejected"
    : true;
  const hasPendingInterview = interviews.some(
    (interview) => interview.status === "Scheduled",
  );
  const hasCompletedInterview = interviews.some(
    (interview) => interview.status === "Completed",
  );
  const canScheduleInterview =
    candidate?.status === "Form Submitted" ||
    candidate?.status === "Interview Scheduled";
  const schedulingDisabled =
    isTerminal || hasPendingInterview || !canScheduleInterview;
  const canGenerateOffer =
    hasCompletedInterview &&
    (candidate?.status === "Interview Scheduled" ||
      candidate?.status === "Offer Sent");
  const documentTypes = new Set(documents.map((document) => document.type));
  const canMarkHired =
    documentTypes.has("Offer Letter") && documentTypes.has("NDA");

  return (
    <AppShell>
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 text-sm font-medium text-muted transition hover:text-foreground"
      >
        <ArrowLeft aria-hidden="true" size={15} />
        Back to dashboard
      </Link>

      {error ? (
        <section className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-700">
          {error}
        </section>
      ) : null}

      {!candidate && !error ? (
        <section className="mt-6 rounded-lg border border-line bg-panel px-4 py-14 text-center">
          <h1 className="text-sm font-semibold">Candidate not found</h1>
        </section>
      ) : null}

      {candidate ? (
        <section className="mt-6 space-y-5">
          <div className="overflow-hidden rounded-xl border border-line bg-panel shadow-sm">
            <div className="border-b border-line bg-background/55 px-6 py-5">
              <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                    {candidate.jobTitle}
                  </p>
                  <h1 className="mt-2 text-3xl font-semibold tracking-tight">
                    {candidate.name}
                  </h1>
                  <p className="mt-2 text-sm text-muted">{candidate.email}</p>
                </div>
                <div className="flex flex-col items-start gap-2 md:items-end">
                  <StatusBadge status={candidate.status} />
                  <p className="text-xs text-muted">
                    Last activity {formatDate(candidate.last_activity_at)}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-4 p-6 md:grid-cols-[1.1fr_0.9fr]">
              <div className="rounded-xl border border-line bg-white p-4">
                <p className="text-sm font-semibold">Basic info</p>
                <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
                  <div>
                    <dt className="text-xs font-medium uppercase tracking-wide text-muted">
                      Phone
                    </dt>
                    <dd className="mt-1 font-medium">
                      {candidate.phone ?? "Not submitted"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium uppercase tracking-wide text-muted">
                      Location
                    </dt>
                    <dd className="mt-1 font-medium">
                      {candidate.current_location ?? "Not submitted"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium uppercase tracking-wide text-muted">
                      Current role
                    </dt>
                    <dd className="mt-1 font-medium">
                      {candidate.current_position ?? "Not submitted"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium uppercase tracking-wide text-muted">
                      Notice period
                    </dt>
                    <dd className="mt-1 font-medium">
                      {candidate.notice_period ?? "Not submitted"}
                    </dd>
                  </div>
                  <div className="sm:col-span-2">
                    <dt className="text-xs font-medium uppercase tracking-wide text-muted">
                      Salary expectation
                    </dt>
                    <dd className="mt-1 font-medium">
                      {candidate.salary_expectation ?? "Not submitted"}
                    </dd>
                  </div>
                </dl>
              </div>

              <div className="rounded-xl border border-line bg-white p-4">
                <p className="text-sm font-semibold">Files and links</p>
                <div className="mt-4 space-y-3 text-sm">
                  {candidate.resumeUrl ? (
                    <a
                      className="flex items-center justify-between gap-3 rounded-lg border border-line bg-background px-3 py-3 font-medium transition hover:border-foreground hover:bg-white"
                      href={candidate.resumeUrl}
                    >
                      <span className="truncate">
                        {candidate.resume_file_name ?? "Resume"}
                      </span>
                      <Download
                        aria-hidden="true"
                        className="shrink-0 text-muted"
                        size={16}
                      />
                    </a>
                  ) : (
                    <p className="rounded-lg border border-line bg-background px-3 py-3 text-muted">
                      No resume available.
                    </p>
                  )}

                  {candidate.linkedin_url ? (
                    <a
                      className="flex items-center justify-between gap-3 rounded-lg border border-line bg-background px-3 py-3 font-medium transition hover:border-foreground hover:bg-white"
                      href={candidate.linkedin_url}
                      rel="noreferrer"
                      target="_blank"
                    >
                      <span>LinkedIn profile</span>
                      <ExternalLink
                        aria-hidden="true"
                        className="text-muted"
                        size={16}
                      />
                    </a>
                  ) : (
                    <p className="rounded-lg border border-line bg-background px-3 py-3 text-muted">
                      LinkedIn not submitted.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {candidate.status === "Applied" && activeApplicationLink ? (
            <ApplicationLinkCard link={activeApplicationLink} />
          ) : null}

          <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-5">
              <section className="rounded-xl border border-line bg-panel p-5 shadow-sm">
                <div className="mb-4">
                  <h2 className="text-lg font-semibold">Schedule interview</h2>
                  <p className="mt-1 text-sm text-muted">
                    Add screening or technical interviews directly from this
                    profile.
                  </p>
                </div>
                {isTerminal ? (
                  <p className="rounded-lg border border-line bg-background px-3 py-2 text-sm text-muted">
                    Terminal candidates cannot be scheduled.
                  </p>
                ) : null}
                {!isTerminal && hasPendingInterview ? (
                  <p className="rounded-lg border border-line bg-background px-3 py-2 text-sm text-muted">
                    Complete the pending interview before scheduling another
                    one.
                  </p>
                ) : null}
                {!isTerminal && !hasPendingInterview && !canScheduleInterview ? (
                  <p className="rounded-lg border border-line bg-background px-3 py-2 text-sm text-muted">
                    Interviews become available after the candidate submits
                    their application form.
                  </p>
                ) : null}
                <ScheduleInterviewForm
                  candidateId={id}
                  disabled={schedulingDisabled}
                />
              </section>

              <section className="rounded-xl border border-line bg-panel p-5 shadow-sm">
                <h2 className="text-lg font-semibold">Interviews</h2>
                {interviews.length === 0 ? (
                  <p className="mt-4 rounded-lg border border-line bg-background px-3 py-8 text-center text-sm text-muted">
                    No interviews scheduled yet.
                  </p>
                ) : (
                  <div className="mt-4 space-y-3">
                    {interviews.map((interview) => (
                      <article
                        className="rounded-xl border border-line bg-background p-4"
                        key={interview.id}
                      >
                        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                          <div>
                            <p className="font-medium">
                              {interview.type} with{" "}
                              {interview.interviewer_name}
                            </p>
                            <p className="mt-1 text-sm text-muted">
                              {formatDateTime(interview.scheduled_at)}
                            </p>
                          </div>
                          <StatusBadge status={interview.status} />
                        </div>
                        {interview.notes ? (
                          <p className="mt-3 text-sm text-muted">
                            {interview.notes}
                          </p>
                        ) : null}
                        {interview.status === "Completed" ? (
                          <div className="mt-4 rounded-lg border border-line bg-panel p-3 text-sm">
                            <p className="font-medium">
                              Recommendation: {interview.recommendation}
                            </p>
                            <p className="mt-2 text-muted">
                              {interview.feedback_note}
                            </p>
                          </div>
                        ) : (
                          <CompleteInterviewForm
                            candidateId={id}
                            interviewId={interview.id}
                          />
                        )}
                      </article>
                    ))}
                  </div>
                )}
              </section>

              <section className="rounded-xl border border-line bg-panel p-5 shadow-sm">
                <div className="mb-4">
                  <h2 className="text-lg font-semibold">Offer documents</h2>
                  <p className="mt-1 text-sm text-muted">
                    Generate a professional offer letter and NDA after at least
                    one interview is completed.
                  </p>
                </div>
                {!canGenerateOffer ? (
                  <p className="mb-4 rounded-lg border border-line bg-background px-3 py-2 text-sm text-muted">
                    Offer documents become available after at least one
                    interview is completed.
                  </p>
                ) : null}
                <OfferDocumentForm
                  candidateId={id}
                  defaultRoleTitle={candidate.jobTitle}
                  disabled={!canGenerateOffer || isTerminal}
                />

                {documents.length > 0 ? (
                  <div className="mt-5 space-y-2">
                    <p className="text-sm font-semibold">Generated files</p>
                    {documents.map((document) => (
                      <a
                        className="flex items-center justify-between rounded-lg border border-line bg-background px-3 py-2 text-sm transition hover:border-foreground hover:bg-white"
                        href={document.downloadUrl ?? "#"}
                        key={document.id}
                      >
                        <span>
                          <span className="block font-medium">
                            {document.type}
                          </span>
                          <span className="block text-xs text-muted">
                            {formatDateTime(document.created_at)}
                          </span>
                        </span>
                        <span className="text-muted">Download</span>
                      </a>
                    ))}
                  </div>
                ) : null}
              </section>

              <CandidateDecisionPanel
                candidateId={id}
                canMarkHired={canMarkHired}
                isTerminal={isTerminal}
              />
            </div>

            <section className="rounded-xl border border-line bg-panel p-5 shadow-sm xl:sticky xl:top-28 xl:self-start">
              <h2 className="text-lg font-semibold">Timeline</h2>
              {timelineEvents.length === 0 ? (
                <p className="mt-4 rounded-lg border border-line bg-background px-3 py-8 text-center text-sm text-muted">
                  No timeline events yet.
                </p>
              ) : (
                <ol className="mt-5">
                  {timelineEvents.map((event, index) => (
                    <li
                      className="relative grid grid-cols-[28px_1fr] gap-3 pb-4 last:pb-0"
                      key={event.id}
                    >
                      {index !== timelineEvents.length - 1 ? (
                        <span className="absolute left-[9px] top-5 h-[calc(100%-1.25rem)] w-px bg-line" />
                      ) : null}
                      <span
                        className={`relative z-[1] mt-1 grid size-5 place-items-center rounded-full border ${
                          index === 0
                            ? "border-foreground bg-foreground shadow-[0_0_0_4px_rgba(17,17,17,0.08)]"
                            : "border-line bg-panel"
                        }`}
                      >
                        <span
                          className={`size-2 rounded-full ${
                            index === 0 ? "bg-white" : "bg-muted"
                          }`}
                        />
                      </span>
                      <div
                        className={`rounded-xl border p-4 ${
                          index === 0
                            ? "border-foreground bg-white shadow-sm"
                            : "border-line bg-background"
                        }`}
                      >
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-medium">{event.title}</p>
                          {index === 0 ? (
                            <span className="rounded-full bg-foreground px-2 py-0.5 text-[11px] font-medium text-white">
                              Current
                            </span>
                          ) : null}
                        </div>
                        {event.description ? (
                          <p className="mt-1 text-sm text-muted">
                            {event.description}
                          </p>
                        ) : null}
                        <p className="mt-3 text-xs text-muted">
                          {formatDateTime(event.created_at)}
                        </p>
                      </div>
                    </li>
                  ))}
                </ol>
              )}
            </section>
          </div>
        </section>
      ) : null}
    </AppShell>
  );
}
