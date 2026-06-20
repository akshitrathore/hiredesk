import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { JobForm } from "@/app/jobs/new/job-form";
import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { createClient } from "@/lib/supabase/server";

export default async function EditJobPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let error: string | null = null;
  let job:
    | {
        id: string;
        title: string;
        description: string;
        required_skills: string[];
        status: "Open" | "Closed";
      }
    | null = null;

  try {
    const supabase = await createClient();
    const { data, error: queryError } = await supabase
      .from("jobs")
      .select("id,title,description,required_skills,status")
      .eq("id", id)
      .single();

    if (queryError) {
      if (queryError.code === "PGRST116") {
        notFound();
      }

      error = queryError.message;
    } else {
      job = data;
    }
  } catch {
    error = "Supabase is not configured yet.";
  }

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
            title="Edit job opening"
            description="Update the role details or close the opening when it should stop accepting new candidates."
          />
        </div>

        {error ? (
          <section className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-700">
            {error}
          </section>
        ) : null}

        {job ? <JobForm job={job} /> : null}
      </div>
    </AppShell>
  );
}
