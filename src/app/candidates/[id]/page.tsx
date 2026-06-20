import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { StatusBadge } from "@/components/status-badge";
import { formatDate } from "@/lib/format";
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

export default async function CandidateProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let candidate: CandidateProfile | null = null;
  let error: string | null = null;

  try {
    const supabase = await createClient();
    const { data, error: queryError } = await supabase
      .from("candidates")
      .select(
        "name,email,phone,current_location,current_position,notice_period,salary_expectation,linkedin_url,resume_file_path,resume_file_name,status,last_activity_at,jobs(title)",
      )
      .eq("id", id)
      .single();

    if (queryError) {
      error = queryError.message;
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
    }
  } catch {
    error = "Supabase is not configured yet.";
  }

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
        <section className="mt-6 rounded-lg border border-line bg-panel p-6">
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
        </section>
      ) : null}
    </AppShell>
  );
}
