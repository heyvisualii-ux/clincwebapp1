/*
# Add auth_providers tracking to profiles

## Summary
Adds an `auth_providers` text array column to the `profiles` table so the application can
track which authentication methods each user has connected (e.g. "phone", "google").

## Changes
### Modified Tables
- `profiles`
  - New column: `auth_providers` (text[], default empty array) — stores the list of
    auth providers the user has signed in with. Populated on first sign-in and updated
    whenever a new provider is linked.

## Notes
- Existing rows default to an empty array; the application back-fills the value on the
  next sign-in via an upsert in the auth callback / login flow.
- The column intentionally allows duplicates to be prevented at the application layer via
  the `array_append` + `array_remove` pattern, keeping rows idempotent.
- No RLS changes required — the existing policies already cover the `profiles` table.
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name   = 'profiles'
      AND column_name  = 'auth_providers'
  ) THEN
    ALTER TABLE public.profiles
      ADD COLUMN auth_providers text[] NOT NULL DEFAULT '{}';
  END IF;
END $$;
