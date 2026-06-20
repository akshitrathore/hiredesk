import Link from "next/link";
import { AppShell } from "@/components/app-shell";

export default function NewCandidatePage() {
  return (
    <AppShell>
      <div className="max-w-2xl">
        <Link
          href="/dashboard"
          className="text-sm font-medium text-muted hover:text-foreground"
        >
          Back to dashboard
        </Link>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight">
          Add candidate
        </h1>
        <p className="mt-2 text-sm leading-6 text-muted">
          This intake route is ready for resume upload, job selection, and magic
          link generation in the candidate intake milestone.
        </p>

        <form className="mt-6 space-y-5 rounded-lg border border-line bg-panel p-5">
          <label className="block">
            <span className="text-sm font-medium">Candidate name</span>
            <input className="mt-2 h-11 w-full rounded-md border border-line bg-white px-3 text-sm outline-none focus:border-foreground" />
          </label>
          <label className="block">
            <span className="text-sm font-medium">Email</span>
            <input
              className="mt-2 h-11 w-full rounded-md border border-line bg-white px-3 text-sm outline-none focus:border-foreground"
              type="email"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium">Job opening</span>
            <select className="mt-2 h-11 w-full rounded-md border border-line bg-white px-3 text-sm outline-none focus:border-foreground">
              <option>No open jobs yet</option>
            </select>
          </label>
          <label className="block">
            <span className="text-sm font-medium">Resume PDF</span>
            <input
              className="mt-2 w-full rounded-md border border-dashed border-line bg-white px-3 py-3 text-sm outline-none focus:border-foreground"
              type="file"
              accept="application/pdf"
            />
          </label>
          <button
            className="h-10 rounded-md bg-accent px-4 text-sm font-semibold text-white"
            type="button"
          >
            Create candidate
          </button>
        </form>
      </div>
    </AppShell>
  );
}
