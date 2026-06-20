import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { formatDateTime } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";

type InterviewRow = {
  id: string;
  candidateId: string;
  candidateName: string;
  jobTitle: string;
  scheduledAt: string;
  type: string;
  interviewerName: string;
  status: string;
  recommendation: string | null;
};

async function getInterviews(): Promise<{
  interviews: InterviewRow[];
  error?: string;
}> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("interviews")
      .select(
        "id,scheduled_at,type,interviewer_name,status,recommendation,candidates(id,name,jobs(title))",
      )
      .order("scheduled_at", { ascending: true });

    if (error) {
      return { interviews: [], error: error.message };
    }

    return {
      interviews:
        data?.map((interview) => {
          const candidate = Array.isArray(interview.candidates)
            ? interview.candidates[0]
            : interview.candidates;
          const job = Array.isArray(candidate?.jobs)
            ? candidate?.jobs[0]
            : candidate?.jobs;

          return {
            id: interview.id,
            candidateId: candidate?.id ?? "",
            candidateName: candidate?.name ?? "Unknown candidate",
            jobTitle: job?.title ?? "Unassigned role",
            scheduledAt: interview.scheduled_at,
            type: interview.type,
            interviewerName: interview.interviewer_name,
            status: interview.status,
            recommendation: interview.recommendation,
          };
        }) ?? [],
    };
  } catch {
    return { interviews: [], error: "Supabase is not configured yet." };
  }
}

export default async function InterviewsPage() {
  const { interviews, error } = await getInterviews();

  return (
    <AppShell>
      <PageHeader
        eyebrow="Calendar"
        title="Interviews"
        description="Scheduled and completed interviews sorted by date."
      />

      {error ? (
        <section className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-700">
          {error}
        </section>
      ) : null}

      {interviews.length === 0 && !error ? (
        <section className="mt-6 rounded-xl border border-line bg-panel shadow-sm">
          <EmptyState
            title="No interviews scheduled"
            description="Interviews are scheduled from a candidate profile after intake begins."
          />
        </section>
      ) : (
        <section className="mt-6 overflow-hidden rounded-xl border border-line bg-panel shadow-sm">
          <div className="overflow-x-auto">
            <div className="min-w-[860px]">
              <div className="grid grid-cols-[1fr_1fr_1.2fr_0.8fr_0.8fr] border-b border-line bg-background/55 px-4 py-3 text-xs font-medium uppercase tracking-wide text-muted">
                <span>Candidate</span>
                <span>Role</span>
                <span>Interview</span>
                <span>Status</span>
                <span>Recommendation</span>
              </div>
              <div className="divide-y divide-line">
                {interviews.map((interview) => (
                  <Link
                    className="grid grid-cols-[1fr_1fr_1.2fr_0.8fr_0.8fr] items-center px-4 py-4 text-sm transition hover:bg-background"
                    href={`/candidates/${interview.candidateId}`}
                    key={interview.id}
                  >
                    <span className="font-medium">
                      {interview.candidateName}
                    </span>
                    <span className="text-muted">{interview.jobTitle}</span>
                    <span>
                      <span className="block font-medium">
                        {interview.type}
                      </span>
                      <span className="mt-1 block text-xs text-muted">
                        {formatDateTime(interview.scheduledAt)} with{" "}
                        {interview.interviewerName}
                      </span>
                    </span>
                    <StatusBadge status={interview.status} />
                    <span className="text-muted">
                      {interview.recommendation ?? "Pending"}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}
    </AppShell>
  );
}
