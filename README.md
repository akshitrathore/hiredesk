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

## Milestone 2 Status

- Initial Supabase schema added in `supabase/migrations/001_initial_schema.sql`.
- Private `resumes` and `documents` storage buckets defined.
- RLS policies added for authenticated HR users.
- Email/password sign-in wired through Supabase Auth.
- Sign-out action added.
- App shell now reflects the authenticated HR user when a session exists.

## Milestone 3 Status

- Job openings can be created and persisted to Supabase.
- Job openings can be edited, including changing status between Open and Closed.
- Jobs list reads from Supabase and shows status, required skill tags, created
  date, and candidate count.
- Dashboard reads persisted candidates and jobs from Supabase.
- Dashboard status filtering and name/role search are wired through query params.
- Dashboard summary cards now reflect persisted candidate/interview data.
- Candidate row clicks route to a connected profile placeholder.

## Milestone 4 Status

- HR can add candidates to open job openings.
- Resume PDF upload is validated and persisted in Supabase Storage.
- Closed openings are excluded from candidate intake.
- Candidate records are created in `Applied` status.
- One-time magic links are generated, hashed in storage, and shown for copying.
- Public `/apply/[token]` pages handle valid, invalid, expired, and used links.
- Candidate form submission moves status to `Form Submitted`.
- Candidate profile shows resume download and submitted application details.

## Environment

Copy `.env.example` to `.env.local` and provide:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_APP_URL=http://localhost:3000
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
