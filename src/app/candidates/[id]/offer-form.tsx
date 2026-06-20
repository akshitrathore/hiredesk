"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { generateOfferDocuments } from "@/app/candidates/[id]/offer-actions";

function SubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();

  return (
    <button
      className="h-10 rounded-md bg-accent px-4 text-sm font-semibold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
      disabled={disabled || pending}
      type="submit"
    >
      {pending ? "Generating..." : "Generate Offer Documents"}
    </button>
  );
}

export function OfferDocumentForm({
  candidateId,
  defaultRoleTitle,
  disabled,
}: {
  candidateId: string;
  defaultRoleTitle: string;
  disabled: boolean;
}) {
  const [state, formAction] = useActionState(generateOfferDocuments, {});

  return (
    <form action={formAction} className="space-y-4 rounded-md border border-line bg-background p-4">
      <input name="candidate_id" type="hidden" value={candidateId} />
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium">Role title</span>
          <input
            className="mt-2 h-10 w-full rounded-md border border-line bg-white px-3 text-sm outline-none focus:border-foreground disabled:bg-background disabled:text-muted"
            defaultValue={defaultRoleTitle}
            disabled={disabled}
            name="role_title"
            required
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium">Location</span>
          <input
            className="mt-2 h-10 w-full rounded-md border border-line bg-white px-3 text-sm outline-none focus:border-foreground disabled:bg-background disabled:text-muted"
            disabled={disabled}
            name="location"
            placeholder="Bengaluru, India"
            required
          />
        </label>
      </div>
      <div className="grid gap-4 sm:grid-cols-[0.6fr_1.4fr]">
        <label className="block">
          <span className="text-sm font-medium">Currency</span>
          <select
            className="mt-2 h-10 w-full rounded-md border border-line bg-white px-3 text-sm outline-none focus:border-foreground disabled:bg-background disabled:text-muted"
            defaultValue="INR"
            disabled={disabled}
            name="currency"
            required
          >
            <option>INR</option>
            <option>USD</option>
            <option>EUR</option>
            <option>GBP</option>
          </select>
        </label>
        <label className="block">
          <span className="text-sm font-medium">Salary amount</span>
          <input
            className="mt-2 h-10 w-full rounded-md border border-line bg-white px-3 text-sm outline-none focus:border-foreground disabled:bg-background disabled:text-muted"
            disabled={disabled}
            name="salary_amount"
            placeholder="2400000"
            required
          />
        </label>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium">Start date</span>
          <input
            className="mt-2 h-10 w-full rounded-md border border-line bg-white px-3 text-sm outline-none focus:border-foreground disabled:bg-background disabled:text-muted"
            disabled={disabled}
            name="start_date"
            required
            type="date"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium">Reporting manager</span>
          <input
            className="mt-2 h-10 w-full rounded-md border border-line bg-white px-3 text-sm outline-none focus:border-foreground disabled:bg-background disabled:text-muted"
            disabled={disabled}
            name="reporting_manager"
            placeholder="Maya Patel"
            required
          />
        </label>
      </div>

      {state.error ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      ) : null}
      {state.success ? (
        <p className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          {state.success}
        </p>
      ) : null}

      <SubmitButton disabled={disabled} />
    </form>
  );
}
