import { AppShell } from "@/components/app-shell";

export default function InterviewsPage() {
  return (
    <AppShell>
      <div>
        <p className="text-sm font-medium text-muted">Calendar</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          Interviews
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
          Scheduled and completed interviews will appear here sorted by date.
        </p>
      </div>

      <section className="mt-6 rounded-lg border border-line bg-panel px-4 py-14 text-center">
        <h2 className="text-sm font-semibold">No interviews scheduled</h2>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted">
          Interviews are scheduled from a candidate profile after intake begins.
        </p>
      </section>
    </AppShell>
  );
}
