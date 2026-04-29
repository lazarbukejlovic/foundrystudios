
-- 1. Restrict booking INSERT to authenticated only
DROP POLICY IF EXISTS "Users can create their own bookings" ON public.bookings;
CREATE POLICY "Users can create their own bookings"
  ON public.bookings FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- 2. Restrict booking SELECT to authenticated only
DROP POLICY IF EXISTS "Users can view their own bookings" ON public.bookings;
CREATE POLICY "Users can view their own bookings"
  ON public.bookings FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- 3. Replace update policy — only allow notes and status (trigger protects status)
DROP POLICY IF EXISTS "Users can update their own bookings" ON public.bookings;
CREATE POLICY "Users can update their own bookings"
  ON public.bookings FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Grant UPDATE only on safe columns to authenticated users
-- (We already revoked sensitive columns; now explicitly grant only safe ones)
GRANT UPDATE (notes, status) ON public.bookings TO authenticated;
