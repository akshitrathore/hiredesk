import Link from "next/link";

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/jobs", label: "Jobs" },
  { href: "/interviews", label: "Interviews" },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-line bg-panel/90 px-5 py-6 lg:block">
        <Link href="/dashboard" className="flex items-center gap-3">
          <span className="grid size-9 place-items-center rounded-lg bg-accent text-sm font-semibold text-white">
            RH
          </span>
          <span>
            <span className="block text-sm font-semibold">ROVE Hire</span>
            <span className="block text-xs text-muted">Hiring operations</span>
          </span>
        </Link>

        <nav className="mt-10 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block rounded-md px-3 py-2 text-sm font-medium text-muted transition hover:bg-background hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-10 border-b border-line bg-background/90 px-5 py-4 backdrop-blur md:px-8">
          <div className="mx-auto flex max-w-7xl items-center justify-between">
            <Link href="/dashboard" className="flex items-center gap-3 lg:hidden">
              <span className="grid size-8 place-items-center rounded-lg bg-accent text-xs font-semibold text-white">
                RH
              </span>
              <span className="text-sm font-semibold">ROVE Hire</span>
            </Link>
            <div className="hidden text-sm text-muted lg:block">
              Internal workspace
            </div>
            <div className="flex items-center gap-3">
              <span className="hidden rounded-full border border-line bg-panel px-3 py-1 text-xs text-muted sm:inline">
                HR team
              </span>
              <Link
                href="/sign-in"
                className="rounded-md border border-line bg-panel px-3 py-2 text-sm font-medium transition hover:border-foreground"
              >
                Sign in
              </Link>
            </div>
          </div>
        </header>
        <main className="mx-auto max-w-7xl px-5 py-8 md:px-8">{children}</main>
      </div>
    </div>
  );
}
