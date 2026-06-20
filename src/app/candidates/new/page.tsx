import Link from "next/link";
import { CandidateForm } from "@/app/candidates/new/candidate-form";
import { AppShell } from "@/components/app-shell";
import { createClient } from "@/lib/supabase/server";

async function getOpenJobs() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("jobs")
      .select("id,title")
      .eq("status", "Open")
      .order("created_at", { ascending: false });

    if (error) {
      return { jobs: [], error: error.message };
    }

    return { jobs: data ?? [], error: null };
  } catch {
    return { jobs: [], error: "Supabase is not configured yet." };
  }
}

export default async function NewCandidatePage() {
  const { jobs, error } = await getOpenJobs();

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
          Upload a resume, associate the candidate with an open job, and
          generate a secure application link.
        </p>

        {error ? (
          <section className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-700">
            {error}
          </section>
        ) : null}

        <CandidateForm jobs={jobs} />
      </div>
    </AppShell>
  );
}
