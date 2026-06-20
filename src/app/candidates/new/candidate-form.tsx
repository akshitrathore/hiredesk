"use client";

import { useActionState, useRef } from "react";
import { useFormStatus } from "react-dom";
import { addCandidate } from "@/app/candidates/actions";

type CandidateFormProps = {
  jobs: {
    id: string;
    title: string;
  }[];
};

function SubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();

  return (
    <button
      className="h-10 rounded-md bg-accent px-4 text-sm font-semibold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
      disabled={disabled || pending}
      type="submit"
    >
      {pending ? "Creating..." : "Create candidate"}
    </button>
  );
}

export function CandidateForm({ jobs }: CandidateFormProps) {
  const [state, formAction] = useActionState(addCandidate, {});
  const linkRef = useRef<HTMLInputElement>(null);
  const hasJobs = jobs.length > 0;

  return (
    <div className="mt-6 space-y-4">
      <form action={formAction} className="space-y-5 rounded-lg border border-line bg-panel p-5">
        <label className="block">
          <span className="text-sm font-medium">Candidate name</span>
          <input
            className="mt-2 h-11 w-full rounded-md border border-line bg-white px-3 text-sm outline-none focus:border-foreground"
            name="name"
            placeholder="Avery Johnson"
            required
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium">Email</span>
          <input
            className="mt-2 h-11 w-full rounded-md border border-line bg-white px-3 text-sm outline-none focus:border-foreground"
            name="email"
            placeholder="avery@example.com"
            type="email"
            required
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium">Job opening</span>
          <select
            className="mt-2 h-11 w-full rounded-md border border-line bg-white px-3 text-sm outline-none focus:border-foreground disabled:cursor-not-allowed disabled:bg-background disabled:text-muted"
            disabled={!hasJobs}
            name="job_id"
            required
          >
            {hasJobs ? (
              jobs.map((job) => (
                <option key={job.id} value={job.id}>
                  {job.title}
                </option>
              ))
            ) : (
              <option>No open jobs yet</option>
            )}
          </select>
        </label>
        <label className="block">
          <span className="text-sm font-medium">Resume PDF</span>
          <input
            accept="application/pdf"
            className="mt-2 w-full rounded-md border border-dashed border-line bg-white px-3 py-3 text-sm outline-none focus:border-foreground"
            name="resume"
            required
            type="file"
          />
          <span className="mt-2 block text-xs text-muted">
            PDF only, maximum 10 MB.
          </span>
        </label>

        {state.error ? (
          <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {state.error}
          </p>
        ) : null}

        <SubmitButton disabled={!hasJobs} />
      </form>

      {state.magicLink ? (
        <section className="rounded-lg border border-emerald-200 bg-emerald-50 p-5">
          <h2 className="text-sm font-semibold text-emerald-900">
            Candidate added
          </h2>
          <p className="mt-2 text-sm leading-6 text-emerald-800">
            Copy this magic link and share it with the candidate. It expires in
            14 days and can be submitted once.
          </p>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <input
              className="h-10 flex-1 rounded-md border border-emerald-200 bg-white px-3 text-sm text-emerald-950 outline-none"
              readOnly
              ref={linkRef}
              value={state.magicLink}
            />
            <button
              className="h-10 rounded-md bg-emerald-900 px-4 text-sm font-semibold text-white"
              onClick={() => {
                linkRef.current?.select();
                navigator.clipboard.writeText(state.magicLink ?? "");
              }}
              type="button"
            >
              Copy link
            </button>
          </div>
        </section>
      ) : null}
    </div>
  );
}
