import { ApplicationForm } from "@/app/apply/[token]/application-form";
import { createAdminClient } from "@/lib/supabase/admin";
import { hashApplicationToken } from "@/lib/tokens";

type TokenState =
  | {
      status: "valid";
      candidateName: string;
      jobTitle: string;
    }
  | {
      status: "invalid" | "expired" | "used";
    };

async function getTokenState(token: string): Promise<TokenState> {
  try {
    const supabase = createAdminClient();
    const tokenHash = hashApplicationToken(token);
    const { data, error } = await supabase
      .from("application_tokens")
      .select("expires_at,used_at,candidates(name,jobs(title))")
      .eq("token_hash", tokenHash)
      .single();

    if (error || !data) {
      return { status: "invalid" };
    }

    if (data.used_at) {
      return { status: "used" };
    }

    if (new Date(data.expires_at).getTime() < Date.now()) {
      return { status: "expired" };
    }

    const candidate = Array.isArray(data.candidates)
      ? data.candidates[0]
      : data.candidates;
    const job = Array.isArray(candidate?.jobs)
      ? candidate?.jobs[0]
      : candidate?.jobs;

    return {
      status: "valid",
      candidateName: candidate?.name ?? "Candidate",
      jobTitle: job?.title ?? "ROVE role",
    };
  } catch {
    return { status: "invalid" };
  }
}

function MessageScreen({
  title,
  message,
}: {
  title: string;
  message: string;
}) {
  return (
    <section className="rounded-lg border border-line bg-panel p-6 text-center">
      <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
      <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted">
        {message}
      </p>
    </section>
  );
}

export default async function ApplyPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const tokenState = await getTokenState(token);

  return (
    <main className="grid min-h-screen place-items-center bg-background px-5 py-12 text-foreground">
      <div className="w-full max-w-2xl">
        <div className="mb-8 text-center">
          <span className="mx-auto grid size-10 place-items-center rounded-lg bg-accent text-sm font-semibold text-white">
            RH
          </span>
          <p className="mt-4 text-sm font-medium text-muted">ROVE Hire</p>
        </div>

        {tokenState.status === "invalid" ? (
          <MessageScreen
            title="This application link is invalid"
            message="Ask your ROVE hiring contact to send a fresh application link."
          />
        ) : null}

        {tokenState.status === "expired" ? (
          <MessageScreen
            title="This application link has expired"
            message="Application links expire after 14 days. Ask your ROVE hiring contact to generate a new one."
          />
        ) : null}

        {tokenState.status === "used" ? (
          <MessageScreen
            title="This application was already submitted"
            message="We already have the completed details for this application."
          />
        ) : null}

        {tokenState.status === "valid" ? (
          <>
            <div className="mb-5">
              <h1 className="text-3xl font-semibold tracking-tight">
                Complete your application
              </h1>
              <p className="mt-2 text-sm leading-6 text-muted">
                Hi {tokenState.candidateName}, share a few details for the{" "}
                {tokenState.jobTitle} role so the hiring team can continue.
              </p>
            </div>
            <ApplicationForm token={token} />
          </>
        ) : null}
      </div>
    </main>
  );
}
