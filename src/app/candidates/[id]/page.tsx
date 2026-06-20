import Link from "next/link";
import {
  CompleteInterviewForm,
  ScheduleInterviewForm,
} from "@/app/candidates/[id]/interview-forms";
import { AppShell } from "@/components/app-shell";
import { StatusBadge } from "@/components/status-badge";
import { formatDate, formatDateTime } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";

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

export default async function CandidateProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let candidate: CandidateProfile | null = null;
  let interviews: Interview[] = [];
  let timelineEvents: TimelineEvent[] = [];
  let error: string | null = null;

  try {
    const supabase = await createClient();
    const [
      { data, error: queryError },
      { data: interviewRows, error: interviewsError },
      { data: timelineRows, error: timelineError },
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
        .order("created_at", { ascending: false }),
    ]);

    if (queryError) {
      error = queryError.message;
    } else if (interviewsError) {
      error = interviewsError.message;
    } else if (timelineError) {
      error = timelineError.message;
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
  const schedulingDisabled = isTerminal || hasPendingInterview;

  return (
    <AppShell>
      <Link
        href="/dashboard"
        className="text-sm font-medium text-muted hover:text-foreground"
      >
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
          <div className="rounded-lg border border-line bg-panel p-6">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
              <div>
                <p className="text-sm font-medium text-muted">
                  {candidate.jobTitle}
                </p>
                <h1 className="mt-2 text-3xl font-semibold tracking-tight">
                  {candidate.name}
                </h1>
                <p className="mt-2 text-sm text-muted">{candidate.email}</p>
              </div>
              <StatusBadge status={candidate.status} />
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-2">
              <div className="rounded-md border border-line bg-background p-4">
                <p className="text-sm font-semibold">Basic info</p>
                <dl className="mt-4 space-y-3 text-sm">
                  <div>
                    <dt className="text-muted">Phone</dt>
                    <dd>{candidate.phone ?? "Not submitted"}</dd>
                  </div>
                  <div>
                    <dt className="text-muted">Location</dt>
                    <dd>{candidate.current_location ?? "Not submitted"}</dd>
                  </div>
                  <div>
                    <dt className="text-muted">Current role</dt>
                    <dd>{candidate.current_position ?? "Not submitted"}</dd>
                  </div>
                  <div>
                    <dt className="text-muted">Notice period</dt>
                    <dd>{candidate.notice_period ?? "Not submitted"}</dd>
                  </div>
                  <div>
                    <dt className="text-muted">Salary expectation</dt>
                    <dd>{candidate.salary_expectation ?? "Not submitted"}</dd>
                  </div>
                </dl>
              </div>

              <div className="rounded-md border border-line bg-background p-4">
                <p className="text-sm font-semibold">Files and links</p>
                <div className="mt-4 space-y-3 text-sm">
                  {candidate.resumeUrl ? (
                    <a
                      className="block rounded-md border border-line bg-panel px-3 py-2 font-medium transition hover:border-foreground"
                      href={candidate.resumeUrl}
                    >
                      Download {candidate.resume_file_name ?? "resume"}
                    </a>
                  ) : (
                    <p className="text-muted">No resume available.</p>
                  )}

                  {candidate.linkedin_url ? (
                    <a
                      className="block rounded-md border border-line bg-panel px-3 py-2 font-medium transition hover:border-foreground"
                      href={candidate.linkedin_url}
                      rel="noreferrer"
                      target="_blank"
                    >
                      View LinkedIn profile
                    </a>
                  ) : (
                    <p className="text-muted">LinkedIn not submitted.</p>
                  )}
                </div>
              </div>
            </div>

            <p className="mt-5 text-xs text-muted">
              Last activity {formatDate(candidate.last_activity_at)}
            </p>
          </div>

          <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-5">
              <section className="rounded-lg border border-line bg-panel p-5">
                <div className="mb-4">
                  <h2 className="text-lg font-semibold">Schedule interview</h2>
                  <p className="mt-1 text-sm text-muted">
                    Add screening or technical interviews directly from this
                    profile.
                  </p>
                </div>
                {isTerminal ? (
                  <p className="rounded-md border border-line bg-background px-3 py-2 text-sm text-muted">
                    Terminal candidates cannot be scheduled.
                  </p>
                ) : null}
                {!isTerminal && hasPendingInterview ? (
                  <p className="rounded-md border border-line bg-background px-3 py-2 text-sm text-muted">
                    Complete the pending interview before scheduling another
                    one.
                  </p>
                ) : null}
                <ScheduleInterviewForm
                  candidateId={id}
                  disabled={schedulingDisabled}
                />
              </section>

              <section className="rounded-lg border border-line bg-panel p-5">
                <h2 className="text-lg font-semibold">Interviews</h2>
                {interviews.length === 0 ? (
                  <p className="mt-4 rounded-md border border-line bg-background px-3 py-8 text-center text-sm text-muted">
                    No interviews scheduled yet.
                  </p>
                ) : (
                  <div className="mt-4 space-y-3">
                    {interviews.map((interview) => (
                      <article
                        className="rounded-md border border-line bg-background p-4"
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
                          <div className="mt-4 rounded-md border border-line bg-panel p-3 text-sm">
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
            </div>

            <section className="rounded-lg border border-line bg-panel p-5">
              <h2 className="text-lg font-semibold">Timeline</h2>
              {timelineEvents.length === 0 ? (
                <p className="mt-4 rounded-md border border-line bg-background px-3 py-8 text-center text-sm text-muted">
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
                        className={`rounded-md border p-4 ${
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
