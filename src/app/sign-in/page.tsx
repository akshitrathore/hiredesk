import { SignInForm } from "@/app/sign-in/sign-in-form";

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;

  return (
    <main className="product-shell grid min-h-screen place-items-center px-5 py-12">
      <section className="grid w-full max-w-5xl overflow-hidden rounded-2xl border border-line bg-panel shadow-[0_24px_80px_rgba(23,22,21,0.08)] lg:grid-cols-[1fr_1.1fr]">
        <div className="border-b border-line bg-foreground p-8 text-white lg:border-b-0 lg:border-r">
          <span className="grid size-11 place-items-center rounded-xl border border-white/15 bg-white text-sm font-semibold text-foreground">
            R
          </span>
          <h1 className="mt-8 max-w-sm text-3xl font-semibold tracking-tight">
            ROVE Hire command center
          </h1>
          <p className="mt-3 max-w-sm text-sm leading-6 text-white/70">
            Manage roles, candidates, interviews, documents, and final decisions
            from one focused HR workspace.
          </p>
          <div className="mt-10 grid gap-3 text-sm text-white/75">
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              Resume intake to offer generation
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              Public candidate forms with secure magic links
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              Persistent files, timelines, and hiring decisions
            </div>
          </div>
        </div>

        <div className="p-6 sm:p-8 lg:p-10">
          <div className="mb-8">
            <span className="grid size-10 place-items-center rounded-xl bg-accent text-sm font-semibold text-white lg:hidden">
              R
            </span>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
              Secure access
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight">
              Sign in to ROVE Hire
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted">
              HR access is required before managing candidates, jobs,
              interviews, and offer documents.
            </p>
          </div>

          <SignInForm nextPath={next ?? "/dashboard"} />
        </div>
      </section>
    </main>
  );
}
