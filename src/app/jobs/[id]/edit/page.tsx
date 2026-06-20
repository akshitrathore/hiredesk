import Link from "next/link";
import { notFound } from "next/navigation";
import { JobForm } from "@/app/jobs/new/job-form";
import { AppShell } from "@/components/app-shell";
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
          className="text-sm font-medium text-muted hover:text-foreground"
        >
          Back to jobs
        </Link>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight">
          Edit job opening
        </h1>
        <p className="mt-2 text-sm leading-6 text-muted">
          Update the role details or close the opening when it should stop
          accepting new candidates.
        </p>

        {error ? (
          <section className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-700">
            {error}
          </section>
        ) : null}

        {job ? <JobForm job={job} /> : null}
      </div>
    </AppShell>
  );
}
