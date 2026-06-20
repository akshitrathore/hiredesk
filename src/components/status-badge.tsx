const statusStyles: Record<string, { badge: string; dot: string }> = {
  Applied: {
    badge: "border-neutral-200 bg-neutral-50 text-neutral-700",
    dot: "bg-neutral-500",
  },
  "Form Submitted": {
    badge: "border-blue-200 bg-blue-50 text-blue-700",
    dot: "bg-blue-500",
  },
  "Interview Scheduled": {
    badge: "border-violet-200 bg-violet-50 text-violet-700",
    dot: "bg-violet-500",
  },
  "Offer Sent": {
    badge: "border-amber-200 bg-amber-50 text-amber-700",
    dot: "bg-amber-500",
  },
  Hired: {
    badge: "border-emerald-200 bg-emerald-50 text-emerald-700",
    dot: "bg-emerald-500",
  },
  Rejected: {
    badge: "border-red-200 bg-red-50 text-red-700",
    dot: "bg-red-500",
  },
  Open: {
    badge: "border-emerald-200 bg-emerald-50 text-emerald-700",
    dot: "bg-emerald-500",
  },
  Closed: {
    badge: "border-neutral-200 bg-neutral-50 text-neutral-600",
    dot: "bg-neutral-400",
  },
  Scheduled: {
    badge: "border-violet-200 bg-violet-50 text-violet-700",
    dot: "bg-violet-500",
  },
  Completed: {
    badge: "border-emerald-200 bg-emerald-50 text-emerald-700",
    dot: "bg-emerald-500",
  },
};

export function StatusBadge({ status }: { status: string }) {
  const style = statusStyles[status] ?? {
    badge: "border-line bg-background text-muted",
    dot: "bg-muted",
  };

  return (
    <span
      className={`inline-flex w-fit items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${style.badge}`}
    >
      <span className={`size-1.5 rounded-full ${style.dot}`} />
      {status}
    </span>
  );
}
