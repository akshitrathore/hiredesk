"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import {
  completeInterview,
  scheduleInterview,
} from "@/app/interviews/actions";

function SubmitButton({
  label,
  pendingLabel,
  disabled = false,
}: {
  label: string;
  pendingLabel: string;
  disabled?: boolean;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      className="h-10 rounded-md bg-accent px-4 text-sm font-semibold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
      disabled={disabled || pending}
      type="submit"
    >
      {pending ? pendingLabel : label}
    </button>
  );
}

export function ScheduleInterviewForm({
  candidateId,
  disabled,
}: {
  candidateId: string;
  disabled: boolean;
}) {
  const [state, formAction] = useActionState(scheduleInterview, {});

  return (
    <form action={formAction} className="space-y-4 rounded-md border border-line bg-background p-4">
      <input name="candidate_id" type="hidden" value={candidateId} />
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium">Date</span>
          <input
            className="mt-2 h-10 w-full rounded-md border border-line bg-white px-3 text-sm outline-none focus:border-foreground"
            disabled={disabled}
            name="date"
            required
            type="date"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium">Time</span>
          <input
            className="mt-2 h-10 w-full rounded-md border border-line bg-white px-3 text-sm outline-none focus:border-foreground"
            disabled={disabled}
            name="time"
            required
            type="time"
          />
        </label>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium">Type</span>
          <select
            className="mt-2 h-10 w-full rounded-md border border-line bg-white px-3 text-sm outline-none focus:border-foreground"
            disabled={disabled}
            name="type"
            required
          >
            <option>Screening</option>
            <option>Technical</option>
          </select>
        </label>
        <label className="block">
          <span className="text-sm font-medium">Interviewer</span>
          <input
            className="mt-2 h-10 w-full rounded-md border border-line bg-white px-3 text-sm outline-none focus:border-foreground"
            disabled={disabled}
            name="interviewer_name"
            placeholder="Maya Patel"
            required
          />
        </label>
      </div>
      <label className="block">
        <span className="text-sm font-medium">Notes</span>
        <textarea
          className="mt-2 min-h-20 w-full rounded-md border border-line bg-white px-3 py-2 text-sm outline-none focus:border-foreground"
          disabled={disabled}
          name="notes"
          placeholder="Optional context for the interviewer"
        />
      </label>

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

      <SubmitButton
        disabled={disabled}
        label="Schedule interview"
        pendingLabel="Scheduling..."
      />
    </form>
  );
}

export function CompleteInterviewForm({
  interviewId,
  candidateId,
}: {
  interviewId: string;
  candidateId: string;
}) {
  const [state, formAction] = useActionState(completeInterview, {});

  return (
    <form action={formAction} className="mt-4 space-y-3 rounded-md border border-line bg-background p-3">
      <input name="interview_id" type="hidden" value={interviewId} />
      <input name="candidate_id" type="hidden" value={candidateId} />
      <label className="block">
        <span className="text-xs font-medium uppercase tracking-wide text-muted">
          Recommendation
        </span>
        <select
          className="mt-2 h-10 w-full rounded-md border border-line bg-white px-3 text-sm outline-none focus:border-foreground"
          name="recommendation"
          required
        >
          <option>Hire</option>
          <option>Maybe</option>
          <option>No Hire</option>
        </select>
      </label>
      <label className="block">
        <span className="text-xs font-medium uppercase tracking-wide text-muted">
          Feedback note
        </span>
        <textarea
          className="mt-2 min-h-20 w-full rounded-md border border-line bg-white px-3 py-2 text-sm outline-none focus:border-foreground"
          name="feedback_note"
          placeholder="Short feedback from the interview"
          required
        />
      </label>

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

      <SubmitButton label="Record feedback" pendingLabel="Saving..." />
    </form>
  );
}
