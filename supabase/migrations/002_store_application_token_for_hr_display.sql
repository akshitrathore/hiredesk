alter table public.application_tokens
add column if not exists token text;
