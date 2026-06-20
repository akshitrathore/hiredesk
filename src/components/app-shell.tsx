import Link from "next/link";
import { LogOut } from "lucide-react";
import { signOut } from "@/app/sign-in/actions";
import { NavLink } from "@/components/nav-link";
import { createClient } from "@/lib/supabase/server";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: "dashboard" as const },
  { href: "/jobs", label: "Jobs", icon: "jobs" as const },
  { href: "/interviews", label: "Interviews", icon: "interviews" as const },
];

export async function AppShell({ children }: { children: React.ReactNode }) {
  let email: string | null = null;

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    email = user?.email ?? null;
  } catch {
    // The shell can render before Supabase environment variables are configured.
  }

  return (
    <div className="product-shell min-h-screen text-foreground">
      <aside className="fixed inset-y-0 left-0 hidden w-72 border-r border-line bg-panel/95 px-4 py-5 shadow-[1px_0_0_rgba(255,255,255,0.6)] lg:block">
        <Link href="/dashboard" className="flex items-center gap-3 rounded-xl px-2 py-2">
          <span className="grid size-10 place-items-center rounded-xl border border-white/20 bg-accent text-sm font-semibold text-white shadow-sm">
            R
          </span>
          <span>
            <span className="block text-[15px] font-semibold tracking-tight">
              ROVE Hire
            </span>
            <span className="block text-xs text-muted">Hiring workspace</span>
          </span>
        </Link>

        <nav className="mt-8 space-y-1.5">
          {navItems.map((item) => (
            <NavLink key={item.href} {...item} />
          ))}
        </nav>

        <div className="absolute bottom-5 left-4 right-4 rounded-xl border border-line bg-background/70 p-3">
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted">
            Signed in
          </p>
          <p className="mt-2 truncate text-sm font-medium">
            {email ?? "Not authenticated"}
          </p>
          {email ? (
            <form action={signOut} className="mt-3">
              <button
                className="inline-flex h-9 w-full items-center justify-center gap-2 rounded-lg border border-line bg-panel text-sm font-medium transition hover:border-foreground"
                type="submit"
              >
                <LogOut aria-hidden="true" size={15} />
                Sign out
              </button>
            </form>
          ) : null}
        </div>
      </aside>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-10 border-b border-line bg-background/88 px-5 py-3 backdrop-blur md:px-8">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
            <Link href="/dashboard" className="flex items-center gap-3 lg:hidden">
              <span className="grid size-9 place-items-center rounded-xl bg-accent text-xs font-semibold text-white">
                R
              </span>
              <span className="text-sm font-semibold">ROVE Hire</span>
            </Link>
            <div className="hidden text-sm text-muted lg:block">
              HR command center
            </div>
            <div className="flex items-center gap-3">
              {email ? (
                <>
                  <span className="hidden max-w-52 truncate rounded-full border border-line bg-panel px-3 py-1 text-xs text-muted sm:inline">
                    {email}
                  </span>
                  <form action={signOut} className="lg:hidden">
                    <button
                      className="inline-flex size-9 items-center justify-center rounded-lg border border-line bg-panel text-muted transition hover:border-foreground hover:text-foreground"
                      aria-label="Sign out"
                      type="submit"
                    >
                      <LogOut aria-hidden="true" size={15} />
                    </button>
                  </form>
                </>
              ) : (
                <Link
                  href="/sign-in"
                  className="rounded-md border border-line bg-panel px-3 py-2 text-sm font-medium transition hover:border-foreground"
                >
                  Sign in
                </Link>
              )}
            </div>
          </div>
          <nav className="mx-auto mt-3 flex max-w-7xl gap-2 overflow-x-auto pb-1 lg:hidden">
            {navItems.map((item) => (
              <NavLink key={item.href} {...item} />
            ))}
          </nav>
        </header>
        <main className="mx-auto max-w-7xl px-5 py-7 md:px-8 lg:py-9">
          {children}
        </main>
      </div>
    </div>
  );
}
