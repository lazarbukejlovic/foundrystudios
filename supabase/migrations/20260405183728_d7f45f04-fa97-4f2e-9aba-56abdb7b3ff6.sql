
-- Revoke table-level UPDATE first
REVOKE UPDATE ON public.bookings FROM anon, authenticated;

-- Grant column-specific UPDATE only on safe fields
GRANT UPDATE (notes, status) ON public.bookings TO authenticated;
