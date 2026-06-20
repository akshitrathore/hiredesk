"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { submitApplication } from "@/app/apply/[token]/actions";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      className="h-11 w-full rounded-md bg-accent text-sm font-semibold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
      disabled={pending}
      type="submit"
    >
      {pending ? "Submitting..." : "Submit application"}
    </button>
  );
}

export function ApplicationForm({ token }: { token: string }) {
  const [state, formAction] = useActionState(submitApplication, {});

  if (state.success) {
    return (
      <section className="rounded-lg border border-emerald-200 bg-emerald-50 p-6 text-center">
        <h1 className="text-2xl font-semibold tracking-tight text-emerald-950">
          Thanks, we received your details.
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-emerald-800">
          The ROVE hiring team has your completed application and will follow up
          with next steps.
        </p>
      </section>
    );
  }

  return (
    <form action={formAction} className="space-y-5 rounded-lg border border-line bg-panel p-5">
      <input name="token" type="hidden" value={token} />
      <label className="block">
        <span className="text-sm font-medium">Phone number</span>
        <input
          className="mt-2 h-11 w-full rounded-md border border-line bg-white px-3 text-sm outline-none focus:border-foreground"
          name="phone"
          placeholder="+91 98765 43210"
          required
        />
      </label>
      <label className="block">
        <span className="text-sm font-medium">Current location</span>
        <input
          className="mt-2 h-11 w-full rounded-md border border-line bg-white px-3 text-sm outline-none focus:border-foreground"
          name="current_location"
          placeholder="Bengaluru, India"
          required
        />
      </label>
      <label className="block">
        <span className="text-sm font-medium">Current role</span>
        <input
          className="mt-2 h-11 w-full rounded-md border border-line bg-white px-3 text-sm outline-none focus:border-foreground"
          name="current_position"
          placeholder="Product Manager"
          required
        />
      </label>
      <label className="block">
        <span className="text-sm font-medium">Notice period</span>
        <input
          className="mt-2 h-11 w-full rounded-md border border-line bg-white px-3 text-sm outline-none focus:border-foreground"
          name="notice_period"
          placeholder="30 days"
          required
        />
      </label>
      <label className="block">
        <span className="text-sm font-medium">Salary expectation</span>
        <input
          className="mt-2 h-11 w-full rounded-md border border-line bg-white px-3 text-sm outline-none focus:border-foreground"
          name="salary_expectation"
          placeholder="INR 24 LPA"
          required
        />
      </label>
      <label className="block">
        <span className="text-sm font-medium">LinkedIn URL</span>
        <input
          className="mt-2 h-11 w-full rounded-md border border-line bg-white px-3 text-sm outline-none focus:border-foreground"
          name="linkedin_url"
          placeholder="https://www.linkedin.com/in/avery"
          required
          type="url"
        />
      </label>

      {state.error ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      ) : null}

      <SubmitButton />
    </form>
  );
}
