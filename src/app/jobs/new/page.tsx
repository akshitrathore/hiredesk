import Link from "next/link";
import { JobForm } from "@/app/jobs/new/job-form";
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
          Define the role, required skills, and whether the opening is ready for
          new candidates.
        </p>

        <JobForm />
      </div>
    </AppShell>
  );
}
