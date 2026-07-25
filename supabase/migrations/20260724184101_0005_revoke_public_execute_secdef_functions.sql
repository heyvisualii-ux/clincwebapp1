/*
# Revoke EXECUTE from PUBLIC on SECURITY DEFINER functions

## Summary
Removes the implicit PUBLIC execute grant on `is_admin()` and
`handle_new_profile()` that PostgreSQL adds automatically at function-creation
time. The previous migration revoked from the named roles `anon` and
`authenticated`, but those roles inherit EXECUTE through the `PUBLIC`
pseudo-role, which was never explicitly revoked. Revoking from PUBLIC is the
correct way to fully close the RPC endpoint for these internal functions.

## Changes
- `REVOKE EXECUTE ON FUNCTION public.is_admin() FROM PUBLIC`
- `REVOKE EXECUTE ON FUNCTION public.handle_new_profile() FROM PUBLIC`

## Notes
1. `PUBLIC` in PostgreSQL means "every role that exists or will exist". A
   REVOKE on a named role (anon, authenticated) is a no-op when PUBLIC still
   holds the privilege — the named-role check falls through to the PUBLIC grant.
2. These functions are called only by the database engine itself: `is_admin()`
   from RLS policy predicates, `handle_new_profile()` from a BEFORE INSERT
   trigger. Neither call path uses the PostgREST RPC route, so removing PUBLIC
   execute has zero impact on application behaviour.
3. `touch_updated_at()` is not SECURITY DEFINER and cannot be invoked via
   PostgREST RPC regardless, so no change is needed there.
*/

REVOKE EXECUTE ON FUNCTION public.is_admin() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.handle_new_profile() FROM PUBLIC;
