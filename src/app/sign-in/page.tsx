export default function SignInPage() {
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

        <form className="space-y-4">
          <label className="block">
            <span className="text-sm font-medium">Email</span>
            <input
              className="mt-2 h-11 w-full rounded-md border border-line bg-white px-3 text-sm outline-none transition focus:border-foreground"
              type="email"
              placeholder="hr@rove.com"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium">Password</span>
            <input
              className="mt-2 h-11 w-full rounded-md border border-line bg-white px-3 text-sm outline-none transition focus:border-foreground"
              type="password"
              placeholder="Enter password"
            />
          </label>
          <button
            className="h-11 w-full rounded-md bg-accent text-sm font-semibold text-white transition hover:bg-black"
            type="submit"
          >
            Sign in
          </button>
        </form>
      </section>
    </main>
  );
}
