import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { CandidateForm } from "@/app/candidates/new/candidate-form";
import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
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
          className="inline-flex items-center gap-2 text-sm font-medium text-muted transition hover:text-foreground"
        >
          <ArrowLeft aria-hidden="true" size={15} />
          Back to dashboard
        </Link>
        <div className="mt-4">
          <PageHeader
            eyebrow="Candidate intake"
            title="Add candidate"
            description="Upload a resume, associate the candidate with an open job, and generate a secure application link."
          />
        </div>

        {error ? (
          <section className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-700">
            {error}
          </section>
        ) : null}

        <CandidateForm jobs={jobs} />
      </div>
    </AppShell>
  );
}
