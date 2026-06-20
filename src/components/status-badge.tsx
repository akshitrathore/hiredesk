const statusStyles: Record<string, string> = {
  Applied: "border-neutral-200 bg-neutral-50 text-neutral-700",
  "Form Submitted": "border-blue-200 bg-blue-50 text-blue-700",
  "Interview Scheduled": "border-violet-200 bg-violet-50 text-violet-700",
  "Offer Sent": "border-amber-200 bg-amber-50 text-amber-700",
  Hired: "border-emerald-200 bg-emerald-50 text-emerald-700",
  Rejected: "border-red-200 bg-red-50 text-red-700",
  Open: "border-emerald-200 bg-emerald-50 text-emerald-700",
  Closed: "border-neutral-200 bg-neutral-50 text-neutral-600",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex w-fit items-center rounded-full border px-2.5 py-1 text-xs font-medium ${
        statusStyles[status] ?? "border-line bg-background text-muted"
      }`}
    >
      {status}
    </span>
  );
}
