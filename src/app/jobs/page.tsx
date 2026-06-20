import Link from "next/link";
import { Pencil } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { formatDate } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";

type JobWithCount = {
  id: string;
  title: string;
  description: string;
  required_skills: string[];
  status: "Open" | "Closed";
  created_at: string;
  candidateCount: number;
};

async function getJobs(): Promise<{ jobs: JobWithCount[]; error?: string }> {
  try {
    const supabase = await createClient();
    const [{ data: jobs, error: jobsError }, { data: candidates }] =
      await Promise.all([
        supabase
          .from("jobs")
          .select("id,title,description,required_skills,status,created_at")
          .order("created_at", { ascending: false }),
        supabase.from("candidates").select("job_id"),
      ]);

    if (jobsError) {
      return { jobs: [], error: jobsError.message };
    }

    const counts = new Map<string, number>();
    candidates?.forEach((candidate) => {
      counts.set(candidate.job_id, (counts.get(candidate.job_id) ?? 0) + 1);
    });

    return {
      jobs:
        jobs?.map((job) => ({
          ...job,
          candidateCount: counts.get(job.id) ?? 0,
        })) ?? [],
    };
  } catch {
    return { jobs: [], error: "Supabase is not configured yet." };
  }
}

export default async function JobsPage() {
  const { jobs, error } = await getJobs();

  return (
    <AppShell>
      <PageHeader
        eyebrow="Openings"
        title="Job openings"
        description="Create roles, attach required skills, and keep closed openings visible for historical candidate records."
        action={
        <Link
          href="/jobs/new"
          className="inline-flex h-10 items-center justify-center rounded-lg bg-accent px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-black"
        >
          + New Opening
        </Link>
        }
      />

      {error ? (
        <section className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-700">
          {error}
        </section>
      ) : null}

      {jobs.length === 0 && !error ? (
        <section className="mt-6 rounded-xl border border-line bg-panel shadow-sm">
          <EmptyState
            title="No job openings yet"
            description="Create an open role before adding candidates to the pipeline."
          />
        </section>
      ) : (
        <section className="mt-6 grid gap-3">
          {jobs.map((job) => (
            <article
              className="rounded-xl border border-line bg-panel p-5 shadow-sm transition hover:border-neutral-300"
              key={job.id}
            >
              <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-lg font-semibold">{job.title}</h2>
                    <StatusBadge status={job.status} />
                  </div>
                  <p className="mt-2 line-clamp-2 max-w-3xl text-sm leading-6 text-muted">
                    {job.description}
                  </p>
                </div>
                <div className="flex items-start justify-between gap-4 md:block md:text-right">
                  <div>
                    <p className="text-2xl font-semibold">
                      {job.candidateCount}
                    </p>
                    <p className="text-xs text-muted">
                      {job.candidateCount === 1 ? "candidate" : "candidates"}
                    </p>
                  </div>
                  <Link
                    aria-label={`Edit ${job.title}`}
                    className="inline-flex size-9 items-center justify-center rounded-lg border border-line bg-background text-muted transition hover:border-foreground hover:bg-white hover:text-foreground"
                    href={`/jobs/${job.id}/edit`}
                    title={`Edit ${job.title}`}
                  >
                    <Pencil aria-hidden="true" size={16} strokeWidth={2} />
                  </Link>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {job.required_skills.map((skill) => (
                  <span
                    className="rounded-full border border-line bg-background px-2.5 py-1 text-xs font-medium text-muted"
                    key={skill}
                  >
                    {skill}
                  </span>
                ))}
              </div>
              <p className="mt-4 text-xs text-muted">
                Created {formatDate(job.created_at)}
              </p>
            </article>
          ))}
        </section>
      )}
    </AppShell>
  );
}
