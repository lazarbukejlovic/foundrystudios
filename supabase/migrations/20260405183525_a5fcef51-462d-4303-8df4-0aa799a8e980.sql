
-- 1. Update protect_booking_fields to use single-arg has_role
CREATE OR REPLACE FUNCTION public.protect_booking_fields()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  -- Admins can change anything
  IF public.has_role('admin'::app_role) THEN
    RETURN NEW;
  END IF;

  -- Allow users to cancel their own pending/confirmed bookings
  IF OLD.status IN ('pending', 'confirmed') AND NEW.status = 'cancelled' AND OLD.user_id = auth.uid() THEN
    NEW.status := 'cancelled';
  ELSE
    NEW.status := OLD.status;
  END IF;

  -- Always protect these fields for non-admins
  NEW.payment_status := OLD.payment_status;
  NEW.total_cents := OLD.total_cents;
  NEW.confirmation_code := OLD.confirmation_code;
  NEW.stripe_session_id := OLD.stripe_session_id;
  NEW.payment_intent_id := OLD.payment_intent_id;
  NEW.service_id := OLD.service_id;
  NEW.time_slot_id := OLD.time_slot_id;
  NEW.user_id := OLD.user_id;

  RETURN NEW;
END;
$function$;

-- 2. Drop the unsafe two-argument overload
DROP FUNCTION IF EXISTS public.has_role(uuid, app_role);
