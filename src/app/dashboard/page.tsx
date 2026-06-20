import Link from "next/link";
import { AppShell } from "@/components/app-shell";

const statuses = [
  "Applied",
  "Form Submitted",
  "Interview Scheduled",
  "Offer Sent",
  "Hired",
  "Rejected",
];

export default function DashboardPage() {
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
            <p className="mt-3 text-3xl font-semibold">0</p>
          </div>
          <div className="rounded-lg border border-line bg-panel p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-muted">
              Interviews this week
            </p>
            <p className="mt-3 text-3xl font-semibold">0</p>
          </div>
          <div className="rounded-lg border border-line bg-panel p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-muted">
              Offers sent
            </p>
            <p className="mt-3 text-3xl font-semibold">0</p>
          </div>
        </div>

        <div className="rounded-lg border border-line bg-panel">
          <div className="flex flex-col gap-3 border-b border-line p-4 md:flex-row">
            <input
              className="h-10 flex-1 rounded-md border border-line bg-white px-3 text-sm outline-none transition placeholder:text-muted focus:border-foreground"
              placeholder="Search by candidate name or role"
            />
            <select className="h-10 rounded-md border border-line bg-white px-3 text-sm outline-none transition focus:border-foreground">
              <option>All statuses</option>
              {statuses.map((status) => (
                <option key={status}>{status}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-[1.3fr_1fr_1fr_1fr] border-b border-line px-4 py-3 text-xs font-medium uppercase tracking-wide text-muted">
            <span>Name</span>
            <span>Role</span>
            <span>Status</span>
            <span>Last activity</span>
          </div>
          <div className="px-4 py-14 text-center">
            <h2 className="text-sm font-semibold">No candidates yet</h2>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted">
              Add the first candidate after creating an open job. This table will
              become the HR team&apos;s home base.
            </p>
          </div>
        </div>
      </section>
    </AppShell>
  );
}
