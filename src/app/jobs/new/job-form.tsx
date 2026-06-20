"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { createJob, updateJob } from "@/app/jobs/actions";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      className="h-10 rounded-lg bg-accent px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
      disabled={pending}
      type="submit"
    >
      {pending ? "Saving..." : "Save opening"}
    </button>
  );
}

type JobFormProps = {
  job?: {
    id: string;
    title: string;
    description: string;
    required_skills: string[];
    status: "Open" | "Closed";
  };
};

export function JobForm({ job }: JobFormProps) {
  const [state, formAction] = useActionState(job ? updateJob : createJob, {});

  return (
    <form
      action={formAction}
      className="mt-6 space-y-5 rounded-xl border border-line bg-panel p-5 shadow-sm"
    >
      {job ? <input name="id" type="hidden" value={job.id} /> : null}
      <label className="block">
        <span className="text-sm font-medium">Title</span>
        <input
          defaultValue={job?.title}
          className="mt-2 h-11 w-full rounded-lg border border-line bg-white px-3 text-sm outline-none transition focus:border-foreground"
          name="title"
          placeholder="Senior Product Designer"
          required
        />
      </label>
      <label className="block">
        <span className="text-sm font-medium">Description</span>
        <textarea
          defaultValue={job?.description}
          className="mt-2 min-h-36 w-full rounded-lg border border-line bg-white px-3 py-3 text-sm outline-none transition focus:border-foreground"
          name="description"
          placeholder="Describe the role, team, and what success looks like."
          required
        />
      </label>
      <label className="block">
        <span className="text-sm font-medium">Required skills</span>
        <input
          defaultValue={job?.required_skills.join(", ")}
          className="mt-2 h-11 w-full rounded-lg border border-line bg-white px-3 text-sm outline-none transition focus:border-foreground"
          name="required_skills"
          placeholder="Product, SQL, stakeholder management"
          required
        />
        <span className="mt-2 block text-xs text-muted">
          Separate skills with commas.
        </span>
      </label>
      <label className="block">
        <span className="text-sm font-medium">Status</span>
        <select
          className="mt-2 h-11 w-full rounded-lg border border-line bg-white px-3 text-sm outline-none transition focus:border-foreground"
          name="status"
          defaultValue={job?.status ?? "Open"}
        >
          <option>Open</option>
          <option>Closed</option>
        </select>
      </label>
      {state.error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      ) : null}
      <SubmitButton />
    </form>
  );
}
