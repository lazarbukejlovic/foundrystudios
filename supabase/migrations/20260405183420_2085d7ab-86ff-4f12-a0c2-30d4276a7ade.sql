
-- 1. Extend restrictive deny policies on user_roles to cover anon (public) role too
DROP POLICY IF EXISTS "Block all inserts on user_roles" ON public.user_roles;
CREATE POLICY "Block all inserts on user_roles"
  ON public.user_roles AS RESTRICTIVE FOR INSERT TO public
  WITH CHECK (false);

DROP POLICY IF EXISTS "Block all updates on user_roles" ON public.user_roles;
CREATE POLICY "Block all updates on user_roles"
  ON public.user_roles AS RESTRICTIVE FOR UPDATE TO public
  USING (false);

DROP POLICY IF EXISTS "Block all deletes on user_roles" ON public.user_roles;
CREATE POLICY "Block all deletes on user_roles"
  ON public.user_roles AS RESTRICTIVE FOR DELETE TO public
  USING (false);

-- 2. Block anon SELECT on user_roles
CREATE POLICY "Block anon select on user_roles"
  ON public.user_roles AS RESTRICTIVE FOR SELECT TO anon
  USING (false);

-- 3. Revoke column-level UPDATE on sensitive booking fields from public roles
-- This ensures even if RLS allows the row, these columns cannot be set by client
REVOKE UPDATE (payment_status, total_cents, stripe_session_id, payment_intent_id, confirmation_code, service_id, time_slot_id, user_id) ON public.bookings FROM anon, authenticated;
