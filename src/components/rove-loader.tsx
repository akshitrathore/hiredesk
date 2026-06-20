export function RoveLoader({ label }: { label: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6 text-foreground">
      <div className="flex flex-col items-center text-center">
        <div className="relative grid size-20 place-items-center">
          <div className="absolute inset-0 rounded-full border border-line" />
          <div className="absolute inset-0 animate-[spin_1.1s_linear_infinite] rounded-full border-2 border-transparent border-t-foreground" />
          <div className="grid size-12 place-items-center rounded-xl bg-foreground text-sm font-semibold tracking-wide text-white shadow-lg shadow-black/10">
            RH
          </div>
        </div>

        <p className="mt-5 text-sm font-semibold">{label}</p>
        <p className="mt-1 text-xs text-muted">Preparing your workspace</p>

        <div className="mt-5 h-1 w-40 overflow-hidden rounded-full bg-line">
          <div className="h-full w-1/2 animate-[loadingBar_1.35s_ease-in-out_infinite] rounded-full bg-foreground" />
        </div>
      </div>
    </div>
  );
}
