import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { StatusBadge } from "@/components/status-badge";
import { formatDate } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";

const statuses = [
  "Applied",
  "Form Submitted",
  "Interview Scheduled",
  "Offer Sent",
  "Hired",
  "Rejected",
];

type DashboardCandidate = {
  id: string;
  name: string;
  status: string;
  last_activity_at: string;
  jobTitle: string;
};

type DashboardData = {
  candidates: DashboardCandidate[];
  activeCount: number;
  interviewsThisWeek: number;
  offersSent: number;
  error?: string;
};

function startOfWeek(date: Date) {
  const next = new Date(date);
  const day = next.getDay();
  const diff = next.getDate() - day + (day === 0 ? -6 : 1);
  next.setDate(diff);
  next.setHours(0, 0, 0, 0);
  return next;
}

async function getDashboardData(
  search: string,
  status: string,
): Promise<DashboardData> {
  try {
    const supabase = await createClient();
    const [{ data: candidates, error }, { count: interviewCount }] =
      await Promise.all([
        supabase
          .from("candidates")
          .select("id,name,status,last_activity_at,jobs(title)")
          .order("last_activity_at", { ascending: false }),
        supabase
          .from("interviews")
          .select("id", { count: "exact", head: true })
          .gte("scheduled_at", startOfWeek(new Date()).toISOString()),
      ]);

    if (error) {
      return {
        candidates: [],
        activeCount: 0,
        interviewsThisWeek: 0,
        offersSent: 0,
        error: error.message,
      };
    }

    const normalizedSearch = search.trim().toLowerCase();
    const rows =
      candidates?.map((candidate) => ({
        id: candidate.id,
        name: candidate.name,
        status: candidate.status,
        last_activity_at: candidate.last_activity_at,
        jobTitle: candidate.jobs?.title ?? "Unassigned role",
      })) ?? [];

    const filteredRows = rows.filter((candidate) => {
      const matchesStatus = !status || candidate.status === status;
      const matchesSearch =
        !normalizedSearch ||
        candidate.name.toLowerCase().includes(normalizedSearch) ||
        candidate.jobTitle.toLowerCase().includes(normalizedSearch);
      return matchesStatus && matchesSearch;
    });

    return {
      candidates: filteredRows,
      activeCount: rows.filter(
        (candidate) =>
          candidate.status !== "Hired" && candidate.status !== "Rejected",
      ).length,
      interviewsThisWeek: interviewCount ?? 0,
      offersSent: rows.filter((candidate) => candidate.status === "Offer Sent")
        .length,
    };
  } catch {
    return {
      candidates: [],
      activeCount: 0,
      interviewsThisWeek: 0,
      offersSent: 0,
      error: "Supabase is not configured yet.",
    };
  }
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const { q = "", status = "" } = await searchParams;
  const data = await getDashboardData(q, status);

  return (
    <AppShell>
      <section className="flex flex-col gap-6">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-medium text-muted">Pipeline</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">
              Candidate dashboard
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
              Track every candidate from resume intake to offer documents and
              final decision.
            </p>
          </div>
          <Link
            href="/candidates/new"
            className="inline-flex h-10 items-center justify-center rounded-md bg-accent px-4 text-sm font-semibold text-white transition hover:bg-black"
          >
            + Add Candidate
          </Link>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-lg border border-line bg-panel p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-muted">
              Active candidates
            </p>
            <p className="mt-3 text-3xl font-semibold">{data.activeCount}</p>
          </div>
          <div className="rounded-lg border border-line bg-panel p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-muted">
              Interviews this week
            </p>
            <p className="mt-3 text-3xl font-semibold">
              {data.interviewsThisWeek}
            </p>
          </div>
          <div className="rounded-lg border border-line bg-panel p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-muted">
              Offers sent
            </p>
            <p className="mt-3 text-3xl font-semibold">{data.offersSent}</p>
          </div>
        </div>

        <div className="rounded-lg border border-line bg-panel">
          <form className="flex flex-col gap-3 border-b border-line p-4 md:flex-row">
            <input
              className="h-10 flex-1 rounded-md border border-line bg-white px-3 text-sm outline-none transition placeholder:text-muted focus:border-foreground"
              defaultValue={q}
              name="q"
              placeholder="Search by candidate name or role"
            />
            <select
              className="h-10 rounded-md border border-line bg-white px-3 text-sm outline-none transition focus:border-foreground"
              defaultValue={status}
              name="status"
            >
              <option value="">All statuses</option>
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
            <button
              className="h-10 rounded-md border border-line bg-background px-4 text-sm font-medium transition hover:border-foreground"
              type="submit"
            >
              Filter
            </button>
          </form>
          <div className="grid grid-cols-[1.3fr_1fr_1fr_1fr] border-b border-line px-4 py-3 text-xs font-medium uppercase tracking-wide text-muted">
            <span>Name</span>
            <span>Role</span>
            <span>Status</span>
            <span>Last activity</span>
          </div>
          {data.error ? (
            <div className="px-4 py-6 text-sm text-red-700">{data.error}</div>
          ) : null}
          {data.candidates.length === 0 && !data.error ? (
            <div className="px-4 py-14 text-center">
              <h2 className="text-sm font-semibold">
                {q || status ? "No matching candidates" : "No candidates yet"}
              </h2>
              <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted">
                {q || status
                  ? "Try a different search or status filter."
                  : "Add the first candidate after creating an open job. This table will become the HR team's home base."}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-line">
              {data.candidates.map((candidate) => (
                <Link
                  className="grid grid-cols-[1.3fr_1fr_1fr_1fr] items-center px-4 py-4 text-sm transition hover:bg-background"
                  href={`/candidates/${candidate.id}`}
                  key={candidate.id}
                >
                  <span className="font-medium">{candidate.name}</span>
                  <span className="text-muted">{candidate.jobTitle}</span>
                  <StatusBadge status={candidate.status} />
                  <span className="text-muted">
                    {formatDate(candidate.last_activity_at)}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </AppShell>
  );
}
