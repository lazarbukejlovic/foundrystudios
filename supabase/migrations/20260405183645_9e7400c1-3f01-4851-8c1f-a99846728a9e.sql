
-- Ensure authenticated can only UPDATE notes and status (trigger protects status further)
GRANT UPDATE (notes, status) ON public.bookings TO authenticated;
GRANT UPDATE (notes, status) ON public.bookings TO anon;
