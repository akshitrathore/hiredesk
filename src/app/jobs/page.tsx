import Link from "next/link";
import { AppShell } from "@/components/app-shell";

export default function JobsPage() {
  return (
    <AppShell>
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-medium text-muted">Openings</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            Job openings
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
            Create roles, attach required skills, and keep closed openings
            visible for historical candidate records.
          </p>
        </div>
        <Link
          href="/jobs/new"
          className="inline-flex h-10 items-center justify-center rounded-md bg-accent px-4 text-sm font-semibold text-white transition hover:bg-black"
        >
          + New Opening
        </Link>
      </div>

      <section className="mt-6 rounded-lg border border-line bg-panel px-4 py-14 text-center">
        <h2 className="text-sm font-semibold">No job openings yet</h2>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted">
          Create an open role before adding candidates to the pipeline.
        </p>
      </section>
    </AppShell>
  );
}
