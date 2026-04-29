-- Fix: Restrict admin bookings SELECT policy to authenticated users only
DROP POLICY IF EXISTS "Admins can view all bookings" ON public.bookings;
CREATE POLICY "Admins can view all bookings"
  ON public.bookings FOR SELECT
  TO authenticated
  USING (public.has_role('admin'::app_role));