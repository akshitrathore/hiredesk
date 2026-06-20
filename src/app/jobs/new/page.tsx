import Link from "next/link";
import { AppShell } from "@/components/app-shell";

export default function NewJobPage() {
  return (
    <AppShell>
      <div className="max-w-2xl">
        <Link
          href="/jobs"
          className="text-sm font-medium text-muted hover:text-foreground"
        >
          Back to jobs
        </Link>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight">
          Create job opening
        </h1>
        <p className="mt-2 text-sm leading-6 text-muted">
          Milestone 2 will connect this form to Postgres. The foundation keeps
          the route and layout ready for the job workflow.
        </p>

        <form className="mt-6 space-y-5 rounded-lg border border-line bg-panel p-5">
          <label className="block">
            <span className="text-sm font-medium">Title</span>
            <input className="mt-2 h-11 w-full rounded-md border border-line bg-white px-3 text-sm outline-none focus:border-foreground" />
          </label>
          <label className="block">
            <span className="text-sm font-medium">Description</span>
            <textarea className="mt-2 min-h-36 w-full rounded-md border border-line bg-white px-3 py-3 text-sm outline-none focus:border-foreground" />
          </label>
          <label className="block">
            <span className="text-sm font-medium">Required skills</span>
            <input
              className="mt-2 h-11 w-full rounded-md border border-line bg-white px-3 text-sm outline-none focus:border-foreground"
              placeholder="Product, SQL, stakeholder management"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium">Status</span>
            <select className="mt-2 h-11 w-full rounded-md border border-line bg-white px-3 text-sm outline-none focus:border-foreground">
              <option>Open</option>
              <option>Closed</option>
            </select>
          </label>
          <button
            className="h-10 rounded-md bg-accent px-4 text-sm font-semibold text-white"
            type="button"
          >
            Save opening
          </button>
        </form>
      </div>
    </AppShell>
  );
}
