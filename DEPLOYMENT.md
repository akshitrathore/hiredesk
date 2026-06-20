# Deployment Checklist

## Supabase

- Run all SQL migrations in `supabase/migrations`.
- Confirm storage buckets exist:
  - `resumes`
  - `documents`
- Create at least one HR user:

```txt
Authentication -> Users -> Add user
```

## Vercel

Create a new Vercel project from this repository.

Set Node.js to 20 or newer if prompted.

Add environment variables:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_APP_URL=
```

`NEXT_PUBLIC_APP_URL` must be the final deployed URL. Candidate magic links use
this value.

## Verify Production

- Sign in as HR.
- Create a job opening.
- Add a candidate with a PDF resume.
- Copy the generated application link.
- Open the link in a private browser window and submit the candidate form.
- Schedule and complete an interview.
- Generate Offer Letter and NDA.
- Download the generated PDFs.
- Mark the candidate Hired or Rejected.
