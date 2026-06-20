import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { JobForm } from "@/app/jobs/new/job-form";
import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";

export default function NewJobPage() {
  return (
    <AppShell>
      <div className="max-w-2xl">
        <Link
          href="/jobs"
          className="inline-flex items-center gap-2 text-sm font-medium text-muted transition hover:text-foreground"
        >
          <ArrowLeft aria-hidden="true" size={15} />
          Back to jobs
        </Link>
        <div className="mt-4">
          <PageHeader
            eyebrow="Openings"
            title="Create job opening"
            description="Define the role, required skills, and whether the opening is ready for new candidates."
          />
        </div>

        <JobForm />
      </div>
    </AppShell>
  );
}
