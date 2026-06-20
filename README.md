# ROVE Hire

ROVE Hire is an internal hiring operations platform for managing candidates from
resume intake through interviews, offer documents, and final hiring decisions.

## Stack

- Frontend and backend: Next.js App Router with TypeScript.
- Styling: Tailwind CSS.
- Auth, database, and storage: Supabase.
- Deployment target: Vercel with Node 20.

Postgres is a natural fit because ROVE Hire is highly relational: candidates
belong to jobs, interviews belong to candidates, documents belong to candidates,
and timeline events capture workflow history. Supabase gives us hosted Postgres,
auth, and durable file storage in one deploy-friendly stack, which keeps the
assignment production-like without adding unnecessary infrastructure.

## Milestone 1 Status

- Next.js App Router project scaffolded.
- TypeScript, ESLint, Tailwind CSS, and base metadata configured.
- Supabase browser/server clients added.
- Auth middleware added for protected internal routes.
- Initial ROVE Hire shell created with Dashboard, Jobs, Interviews, Sign In,
  Create Job, and Add Candidate routes.
- Product and technical spec lives in `SPEC.md`.

## Environment

Copy `.env.example` to `.env.local` and provide:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

Without these values, the app shell can render, but Supabase-backed auth and data
operations will not be active.

## Development

Use Node 20.19 or newer.

```bash
npm install
npm run dev
```

Then open `http://localhost:3000`.
