type EmptyStateProps = {
  title: string;
  description: string;
  action?: React.ReactNode;
};

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="px-4 py-14 text-center">
      <div className="mx-auto grid size-11 place-items-center rounded-2xl border border-line bg-background text-sm font-semibold">
        R
      </div>
      <h2 className="mt-4 text-sm font-semibold">{title}</h2>
      <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted">
        {description}
      </p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
