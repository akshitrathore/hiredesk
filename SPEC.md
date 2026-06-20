# ROVE Hire Product & Technical Spec

## 1. Product Summary

ROVE Hire is a full-stack hiring operations platform for the ROVE HR team. It manages candidates from resume intake through application completion, interview scheduling, feedback, offer document generation, and final hiring decision.

The product has two audiences:

- Internal HR users and hiring managers who sign in and operate the hiring pipeline.
- External candidates who access a public, tokenized application page without creating an account.

The candidate profile is the center of the app. Every major workflow should either start there or leave a clear timeline event there.

## 2. Recommended Stack

- Frontend: Next.js App Router, TypeScript, React.
- Backend: Next.js Route Handlers / Server Actions.
- Database: Postgres via Supabase.
- Auth: Supabase Auth for HR email/password sign-in.
- File storage: Supabase Storage for resumes and generated PDFs.
- PDF generation: server-side PDF creation using `@react-pdf/renderer`.
- Deployment: Vercel for the Next.js app, Supabase for database/auth/storage.

Database choice rationale for README:

Postgres is a natural fit because ROVE Hire is highly relational: candidates belong to jobs, interviews belong to candidates, documents belong to candidates, and timeline events capture workflow history. Supabase gives us hosted Postgres, auth, and durable file storage in one deploy-friendly stack, which keeps the assignment production-like without adding unnecessary infrastructure.

## 3. Roles & Permissions

### HR User

Authenticated internal user. Can:

- View dashboard.
- Create and view job openings.
- Add candidates.
- View candidate profiles.
- Download resumes and generated PDFs.
- Schedule interviews.
- Complete interviews and record feedback.
- Generate offer documents.
- Mark candidates as hired or rejected.

### Candidate

Unauthenticated external user. Can:

- Open a public application page through a valid magic link.
- Submit additional application details once.

Candidates cannot sign in, view internal pages, browse jobs, or access other candidate records.

## 4. Candidate Status Model

Allowed statuses:

- `Applied`
- `Form Submitted`
- `Interview Scheduled`
- `Offer Sent`
- `Hired`
- `Rejected`

Terminal statuses:

- `Hired`
- `Rejected`

Status rules:

- New manually added candidates start as `Applied`.
- Candidate application submission moves status to `Form Submitted`.
- Scheduling an interview moves status to `Interview Scheduled`.
- Generating offer documents moves status to `Offer Sent`.
- `Hired` can only be selected if offer documents exist.
- `Rejected` can be selected from any non-terminal status, but requires a reason.
- Terminal candidates should be read-only except for downloading files and viewing history.

## 5. Information Architecture

### Internal App

- `/sign-in`
  - HR login page.
- `/dashboard`
  - Candidate pipeline home view.
- `/jobs`
  - Job opening list.
- `/jobs/new`
  - Create job opening.
- `/candidates/new`
  - Add candidate manually.
- `/candidates/[id]`
  - Candidate profile.
- `/interviews`
  - Upcoming and completed interviews sorted by date.

### Public Candidate App

- `/apply/[token]`
  - Public magic-link application page.
  - Handles valid, expired, already-used, and missing-token states.

## 6. Screen Specs

### Sign In

Purpose: authenticate HR users before they access internal functionality.

Fields:

- Email
- Password

States:

- Loading while signing in.
- Invalid credentials error.
- Redirect authenticated users away from `/sign-in` to `/dashboard`.

### Dashboard

Purpose: home view for the HR pipeline.

Content:

- Candidate table.
- Search by candidate name or role.
- Filter by status.
- Empty state when no candidates exist.
- Empty filtered state when search/filter produces no results.

Each row shows:

- Candidate name.
- Role applied for.
- Current status.
- Last activity date.

Interactions:

- Row click opens `/candidates/[id]`.
- Primary action: `+ Add Candidate`.
- Secondary navigation to Jobs and Interviews.

### Jobs List

Purpose: manage open and closed roles.

Each job row/card shows:

- Title.
- Status: Open or Closed.
- Required skills.
- Candidate count.

Interactions:

- Create new opening.
- Closed jobs remain visible.
- Closed jobs cannot be selected when adding a candidate.

### Create Job Opening

Fields:

- Title.
- Description, markdown textarea is acceptable.
- Required skills as tags.
- Status: Open or Closed.

Validation:

- Title required.
- Description required.
- At least one skill required.

### Add Candidate

Fields:

- Name.
- Email.
- Job opening, open jobs only.
- Resume upload, PDF only, max 10 MB.

On submit:

- Upload resume to storage.
- Create candidate in `Applied`.
- Create one-time magic token expiring 14 days from creation.
- Write `Applied` timeline event.
- Show generated application link with copy action.

Failure handling:

- Resume upload errors.
- Invalid file type.
- File too large.
- No open jobs available.

### Public Application Page

Access:

- No login.
- Valid token required.

Fields:

- Phone number.
- Current location.
- Current role.
- Notice period.
- Salary expectation.
- LinkedIn URL.

Token states:

- Valid and unused: show form.
- Expired: show clean expired-link screen.
- Used: show already-submitted screen.
- Invalid: show invalid-link screen.

On submit:

- Save candidate details.
- Mark token as used.
- Move candidate to `Form Submitted`.
- Write timeline event.
- Show confirmation screen.

### Interviews Page

Purpose: calendar-like operational list of scheduled interviews.

Content:

- Interviews sorted by date and time.
- Candidate name.
- Job role.
- Interview type.
- Interviewer.
- Status: Scheduled or Completed.
- Recommendation, if completed.

Interactions:

- Click candidate to open profile.
- Completed interviews remain visible.

### Candidate Profile

Purpose: the spine of the app.

Content sections:

- Header with name, role, status, and key actions.
- Basic information.
- Resume download.
- Application details.
- Interview list and feedback.
- Generated documents.
- Timeline, most recent first.

Status visual cues:

- Applied: neutral.
- Form Submitted: blue.
- Interview Scheduled: purple.
- Offer Sent: amber.
- Hired: green.
- Rejected: red.

Dynamic actions:

- `Schedule Interview`: visible for non-terminal candidates.
- `Generate Offer Documents`: visible for `Interview Scheduled`, `Offer Sent`, and later non-rejected states. Disabled or hidden until at least interview scheduled.
- `Mark Hired`: visible for non-terminal candidates only when offer documents exist.
- `Reject`: visible for any non-terminal candidate.
- `Download Resume`: visible when resume exists.
- `Download Offer Letter` and `Download NDA`: visible after generation.

## 7. Offer Letter & NDA Generation

Available from candidate profile when status is `Interview Scheduled` or later.

Input form:

- Role title.
- Currency.
- Salary amount.
- Start date.
- Reporting manager name.
- Location.

Generated files:

- Offer Letter PDF.
- NDA PDF.

Offer letter contents:

- ROVE letterhead.
- Candidate name.
- Role title.
- Salary with currency and amount.
- Start date.
- Reporting manager.
- Work location.
- Professional welcome paragraph.
- Responsibilities / employment summary.
- Signature block for ROVE HR.
- Candidate acknowledgement block.

NDA contents:

- ROVE letterhead.
- Candidate name.
- Today's date.
- Basic confidentiality clause.
- Return of materials clause.
- Signature block for candidate.
- Signature block for ROVE representative.

On generation:

- Create PDFs server-side.
- Persist both PDFs in storage.
- Create document records in database.
- Move candidate status to `Offer Sent`.
- Write `Offer Sent` timeline event.

Regeneration policy:

- Allow regeneration from profile.
- Store latest generated documents as primary downloads.
- Timeline should still show that documents were generated.

## 8. Data Model

### `hr_users`

If using Supabase Auth, app-specific profile data can live here.

- `id`
- `auth_user_id`
- `name`
- `email`
- `created_at`

### `jobs`

- `id`
- `title`
- `description`
- `required_skills` as text array or JSON.
- `status` enum: `Open`, `Closed`
- `created_at`
- `updated_at`

### `candidates`

- `id`
- `job_id`
- `name`
- `email`
- `phone`
- `current_location`
- `current_position`
- `notice_period`
- `salary_expectation`
- `linkedin_url`
- `status`
- `resume_file_path`
- `resume_file_name`
- `last_activity_at`
- `created_at`
- `updated_at`

### `application_tokens`

- `id`
- `candidate_id`
- `token_hash`
- `expires_at`
- `used_at`
- `created_at`

Store a hash of the token, not the raw token. Show the raw token only immediately after creation as part of the generated link.

### `interviews`

- `id`
- `candidate_id`
- `scheduled_at`
- `type` enum: `Screening`, `Technical`
- `interviewer_name`
- `notes`
- `status` enum: `Scheduled`, `Completed`
- `recommendation` enum: `Hire`, `No Hire`, `Maybe`
- `feedback_note`
- `completed_at`
- `created_at`
- `updated_at`

### `documents`

- `id`
- `candidate_id`
- `type` enum: `Offer Letter`, `NDA`
- `file_path`
- `file_name`
- `metadata` JSON for role, salary, start date, manager, location.
- `created_at`

### `timeline_events`

- `id`
- `candidate_id`
- `type`
- `title`
- `description`
- `metadata` JSON.
- `created_at`

Timeline event types:

- `candidate_applied`
- `form_submitted`
- `interview_scheduled`
- `interview_completed`
- `offer_generated`
- `candidate_hired`
- `candidate_rejected`

## 9. Backend Operations

### Auth

- Middleware protects all internal routes.
- Public `/apply/[token]` route remains unauthenticated.
- Server operations verify HR session before mutating internal data.

### File Uploads

Resume upload:

- Validate MIME type and extension.
- Enforce 10 MB max.
- Store under `resumes/{candidateId}/{originalFileName}` or equivalent.

Generated PDFs:

- Store under `documents/{candidateId}/offer-letter-{timestamp}.pdf`.
- Store under `documents/{candidateId}/nda-{timestamp}.pdf`.

Downloads:

- Use signed URLs or authenticated download route.
- Candidate public page should not expose resume or document downloads.

### Business Rule Enforcement

Server must enforce:

- Closed jobs cannot receive new candidates.
- Expired or used magic links cannot submit applications.
- Hired requires existing offer documents.
- Terminal candidates cannot be moved through normal workflow actions.
- Resume must be a PDF and <= 10 MB.

## 10. UX & Design Direction

Style goal: polished internal product with calm density, similar care level to Linear or Notion but with ROVE's own hiring-ops character.

Design principles:

- Clear left navigation for Dashboard, Jobs, Interviews.
- Candidate profile should feel like an operational record, not a static details page.
- Tables should be scannable and compact.
- Status badges should be visually distinct but restrained.
- Empty states should offer the next obvious action.
- Error states should explain what happened and how to recover.
- Loading states should use skeletons where content shape is predictable.
- Document generation should feel momentous enough to be trusted, but not theatrical.

## 11. Acceptance Criteria

- HR cannot access internal routes without signing in.
- HR can create jobs and see candidate counts.
- HR can add candidates only to open jobs.
- Resume upload persists and remains downloadable after refresh/sign-out/sign-in.
- Adding a candidate generates a copyable magic link.
- Candidate can submit application details through a valid token.
- Expired tokens show an expired state.
- Used tokens cannot submit again.
- Dashboard search and status filter work.
- Candidate profile shows full candidate info, resume, status, timeline, interviews, feedback, and documents.
- HR can schedule interviews from the profile.
- Interviews appear on profile and interviews page.
- HR can complete interviews with recommendation and feedback.
- HR can generate offer letter and NDA PDFs.
- Generated PDFs persist and remain downloadable later.
- Candidate status updates correctly throughout the lifecycle.
- Rejection requires a reason and logs a timeline event.
- Hired requires offer documents and logs a timeline event.
- App is deployed to a public URL.
- README documents stack choices, setup, deployment, and UX decisions.

## 12. Build Milestones

### Milestone 1: Project Foundation

- Scaffold Next.js App Router project.
- Configure TypeScript, linting, styling.
- Add Supabase client/server helpers.
- Set up base layout, auth middleware, and internal navigation.

### Milestone 2: Database & Auth

- Create schema and migrations.
- Implement HR sign-in.
- Protect internal routes.
- Seed one HR test account if appropriate for review.

### Milestone 3: Jobs & Dashboard

- Implement job create/list.
- Implement candidate dashboard with filtering/search.
- Add empty, loading, and error states.

### Milestone 4: Candidate Intake

- Implement manual candidate creation.
- Implement resume storage.
- Generate and display magic links.
- Implement public candidate application flow.

### Milestone 5: Candidate Profile & Interviews

- Implement candidate profile.
- Implement timeline.
- Implement interview scheduling, interview list, completion, and feedback.

### Milestone 6: Offer Documents

- Design offer letter and NDA templates.
- Implement PDF generation.
- Persist PDFs.
- Add document downloads on profile.
- Move candidate to `Offer Sent`.

### Milestone 7: Final Decisions & Polish

- Implement hired/rejected flows.
- Tighten permissions and business rules.
- Polish UI states and responsive behavior.
- Write README.
- Deploy full stack.

## 13. Open Implementation Decisions

These can be finalized during development:

- Whether to use Server Actions or Route Handlers for each mutation.
- Whether document downloads use Supabase signed URLs directly or a protected app route.
- Whether timeline events are rendered with grouped dates or a simple recent-first list.
- Whether the dashboard defaults to all candidates or active non-terminal candidates first.
