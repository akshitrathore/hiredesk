import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { StatusBadge } from "@/components/status-badge";
import { formatDate } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";

export default async function CandidateProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let candidate:
    | {
        name: string;
        email: string;
        status: string;
        last_activity_at: string;
        jobTitle: string;
      }
    | null = null;
  let error: string | null = null;

  try {
    const supabase = await createClient();
    const { data, error: queryError } = await supabase
      .from("candidates")
      .select("name,email,status,last_activity_at,jobs(title)")
      .eq("id", id)
      .single();

    if (queryError) {
      error = queryError.message;
    } else if (data) {
      candidate = {
        name: data.name,
        email: data.email,
        status: data.status,
        last_activity_at: data.last_activity_at,
        jobTitle: data.jobs?.title ?? "Unassigned role",
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

          <div className="mt-8 rounded-md border border-line bg-background p-4">
            <p className="text-sm font-semibold">Profile milestone coming next</p>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
              The candidate profile route is connected so dashboard rows have a
              destination. The full timeline, resume, actions, interviews, and
              documents will be built in the profile milestone.
            </p>
          </div>

          <p className="mt-5 text-xs text-muted">
            Last activity {formatDate(candidate.last_activity_at)}
          </p>
        </section>
      ) : null}
    </AppShell>
  );
}
