# ROVE Hire

ROVE Hire is a full-stack hiring operations platform for managing candidates
from resume intake through application completion, interviews, offer documents,
and final hiring decisions.

The app has two audiences:

- Authenticated HR users and hiring managers.
- External candidates using one-time public application links.

## Live Product Flow

- HR signs in and lands on the candidate dashboard.
- HR creates open or closed job openings.
- HR adds a candidate to an open job and uploads a resume PDF.
- The system stores the resume and generates a copyable candidate magic link.
- The candidate completes their public application form without logging in.
- HR schedules interviews from the candidate profile.
- HR completes interviews with Hire, No Hire, or Maybe feedback.
- HR generates Offer Letter and NDA PDFs after at least one completed interview.
- HR marks the candidate Hired or Rejected through explicit final-decision actions.

## Feature Coverage

- HR email/password authentication through Supabase Auth.
- Protected internal routes for dashboard, jobs, candidates, and interviews.
- Candidate dashboard with status filter and search by name or role.
- Job create/edit flow with Open and Closed status.
- Candidate intake with PDF upload validation and Supabase Storage persistence.
- One-time candidate magic links with 14-day expiry.
- Public candidate application page with invalid, expired, used, and success states.
- Candidate profile with basic info, resume download, application details, interviews,
  documents, final decisions, and timeline.
- Interview scheduling, pending-interview guard, completion, and feedback.
- Offer Letter and NDA PDF generation using server-side templates.
- Generated PDF persistence and signed downloads.
- Hired and Rejected terminal states with server-side business-rule enforcement.
- Branded loading states and polished empty/error states.

## Stack

- Frontend and backend: Next.js App Router with TypeScript.
- Server logic: Next.js Server Actions and server components.
- Styling: Tailwind CSS.
- Auth, database, and storage: Supabase.
- Database: Postgres.
- File storage: Supabase Storage.
- PDF generation: `@react-pdf/renderer`.
- Deployment target: Vercel with Node 20.

Postgres is a natural fit because ROVE Hire is highly relational: candidates
belong to jobs, interviews belong to candidates, documents belong to candidates,
and timeline events capture workflow history. Supabase gives us hosted Postgres,
auth, and durable file storage in one deploy-friendly stack, which keeps the
assignment production-like without adding unnecessary infrastructure.

## UX Decisions

- The candidate profile is the operational center of the product.
- Timeline events are stored as first-class records instead of inferred from UI.
- Interview feedback does not automatically reject candidates; HR makes the final
  decision explicitly.
- Offer documents are only enabled after at least one completed interview.
- Hired is only available after both Offer Letter and NDA exist.
- Rejected always requires a reason.
- Closed jobs remain visible for history but cannot receive new candidates.
- Files are private and downloaded through short-lived signed URLs.

## Environment

Copy `.env.example` to `.env.local` and provide:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

For production, set `NEXT_PUBLIC_APP_URL` to the deployed app URL so generated
candidate magic links point to the public site.

## Supabase Setup

Run the SQL migrations in Supabase SQL Editor:

```txt
supabase/migrations/001_initial_schema.sql
supabase/migrations/002_store_application_token_for_hr_display.sql
```

Then create the first HR user:

```txt
Supabase Dashboard -> Authentication -> Users -> Add user
```

The first successful sign-in creates or updates the app-level `hr_users` profile
row automatically.

More detail is in `supabase/README.md`.

## Development

Use Node 20.19 or newer.

```bash
npm install
npm run dev
```

Open:

```txt
http://localhost:3000
```

## Verification

```bash
npm run lint
npm run build
```

## Deployment

Deploy the Next.js app to Vercel.

Required Vercel environment variables:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_APP_URL=https://your-production-url.vercel.app
```

After deployment, create an HR user in Supabase Auth and sign in at:

```txt
https://your-production-url.vercel.app/sign-in
```
