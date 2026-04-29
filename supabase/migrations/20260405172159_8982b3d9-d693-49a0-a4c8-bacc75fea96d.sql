
-- 1. BEFORE INSERT trigger: enforce safe defaults on bookings
CREATE OR REPLACE FUNCTION public.enforce_booking_defaults()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  NEW.payment_status := 'unpaid';
  NEW.status := 'pending';
  NEW.total_cents := (SELECT price_cents FROM public.services WHERE id = NEW.service_id);
  IF NEW.total_cents IS NULL THEN
    RAISE EXCEPTION 'Invalid service_id';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_enforce_booking_defaults
  BEFORE INSERT ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_booking_defaults();

-- 2. BEFORE UPDATE trigger: prevent users from modifying payment-critical fields
CREATE OR REPLACE FUNCTION public.protect_booking_fields()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- If the caller is an admin (via service role or has admin role), allow all changes
  IF public.has_role(auth.uid(), 'admin') THEN
    RETURN NEW;
  END IF;
  -- For regular users, revert all sensitive fields to their old values
  NEW.payment_status := OLD.payment_status;
  NEW.total_cents := OLD.total_cents;
  NEW.status := OLD.status;
  NEW.confirmation_code := OLD.confirmation_code;
  NEW.stripe_session_id := OLD.stripe_session_id;
  NEW.payment_intent_id := OLD.payment_intent_id;
  NEW.service_id := OLD.service_id;
  NEW.time_slot_id := OLD.time_slot_id;
  NEW.user_id := OLD.user_id;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_protect_booking_fields
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_booking_fields();

-- 3. Restrict user_roles table: deny all writes via restrictive policies
CREATE POLICY "Deny all inserts on user_roles"
  ON public.user_roles
  FOR INSERT
  TO authenticated
  WITH CHECK (false);

CREATE POLICY "Deny all updates on user_roles"
  ON public.user_roles
  FOR UPDATE
  TO authenticated
  USING (false);

CREATE POLICY "Deny all deletes on user_roles"
  ON public.user_roles
  FOR DELETE
  TO authenticated
  USING (false);
