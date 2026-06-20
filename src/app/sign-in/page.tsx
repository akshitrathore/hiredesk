import { SignInForm } from "@/app/sign-in/sign-in-form";

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;

  return (
    <main className="grid min-h-screen place-items-center bg-background px-5 py-12">
      <section className="w-full max-w-md rounded-lg border border-line bg-panel p-6 shadow-sm">
        <div className="mb-8">
          <span className="grid size-10 place-items-center rounded-lg bg-accent text-sm font-semibold text-white">
            RH
          </span>
          <h1 className="mt-5 text-2xl font-semibold tracking-tight">
            Sign in to ROVE Hire
          </h1>
          <p className="mt-2 text-sm leading-6 text-muted">
            HR access is required before managing candidates, jobs, interviews,
            and offer documents.
          </p>
        </div>

        <SignInForm nextPath={next ?? "/dashboard"} />
      </section>
    </main>
  );
}
