"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import {
  markCandidateHired,
  rejectCandidate,
} from "@/app/candidates/[id]/decision-actions";

function SubmitButton({
  children,
  variant,
  disabled,
}: {
  children: React.ReactNode;
  variant: "dark" | "danger";
  disabled: boolean;
}) {
  const { pending } = useFormStatus();
  const className =
    variant === "danger"
      ? "h-10 rounded-lg bg-red-700 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-60"
      : "h-10 rounded-lg bg-accent px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-60";

  return (
    <button className={className} disabled={disabled || pending} type="submit">
      {pending ? "Saving..." : children}
    </button>
  );
}

export function CandidateDecisionPanel({
  candidateId,
  isTerminal,
  canMarkHired,
}: {
  candidateId: string;
  isTerminal: boolean;
  canMarkHired: boolean;
}) {
  const [hiredState, hiredAction] = useActionState(markCandidateHired, {});
  const [rejectedState, rejectedAction] = useActionState(rejectCandidate, {});

  return (
    <section className="rounded-xl border border-line bg-panel p-5 shadow-sm">
      <h2 className="text-lg font-semibold">Final decision</h2>
      <p className="mt-1 text-sm text-muted">
        Move the candidate into a terminal status once HR has made the final
        call.
      </p>

      {isTerminal ? (
        <p className="mt-4 rounded-lg border border-line bg-background px-3 py-2 text-sm text-muted">
          This candidate is already in a terminal status.
        </p>
      ) : null}

      {!isTerminal && !canMarkHired ? (
        <p className="mt-4 rounded-lg border border-line bg-background px-3 py-2 text-sm text-muted">
          Hired becomes available after the Offer Letter and NDA are generated.
        </p>
      ) : null}

      <div className="mt-4 grid gap-4">
        <form action={hiredAction}>
          <input name="candidate_id" type="hidden" value={candidateId} />
          <SubmitButton
            disabled={isTerminal || !canMarkHired}
            variant="dark"
          >
            Mark as Hired
          </SubmitButton>
          {hiredState.error ? (
            <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {hiredState.error}
            </p>
          ) : null}
          {hiredState.success ? (
            <p className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
              {hiredState.success}
            </p>
          ) : null}
        </form>

        <form action={rejectedAction} className="space-y-3">
          <input name="candidate_id" type="hidden" value={candidateId} />
          <label className="block">
            <span className="text-sm font-medium">Rejection reason</span>
            <textarea
              className="mt-2 min-h-20 w-full rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none transition focus:border-foreground disabled:bg-background disabled:text-muted"
              disabled={isTerminal}
              name="reason"
              placeholder="Short reason for the timeline"
              required
            />
          </label>
          <SubmitButton disabled={isTerminal} variant="danger">
            Reject Candidate
          </SubmitButton>
          {rejectedState.error ? (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {rejectedState.error}
            </p>
          ) : null}
          {rejectedState.success ? (
            <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
              {rejectedState.success}
            </p>
          ) : null}
        </form>
      </div>
    </section>
  );
}
