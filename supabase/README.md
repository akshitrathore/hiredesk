# Supabase Setup

## 1. Create a Supabase project

Create a new Supabase project and copy these values into `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_APP_URL=
```

The service role key must stay server-only. Never expose it in client components
or browser code.

## 2. Apply the database schema

Open Supabase SQL Editor and run:

```txt
supabase/migrations/001_initial_schema.sql
```

If the initial schema has already been applied, run later migrations in order:

```txt
supabase/migrations/002_store_application_token_for_hr_display.sql
```

This creates:

- Hiring workflow enums.
- HR profile, jobs, candidates, tokens, interviews, documents, and timeline tables.
- Private storage buckets for resumes and generated documents.
- Row level security policies for authenticated HR access.

## 3. Create the first HR user

In Supabase:

```txt
Authentication -> Users -> Add user
```

Create an email/password user. The first time that user signs in to ROVE Hire,
the app creates or updates their `hr_users` profile row automatically.
