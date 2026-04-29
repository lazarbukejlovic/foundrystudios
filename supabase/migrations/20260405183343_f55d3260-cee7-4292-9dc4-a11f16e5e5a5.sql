
-- 1. Replace permissive deny policies on user_roles with RESTRICTIVE ones
DROP POLICY IF EXISTS "Deny all inserts on user_roles" ON public.user_roles;
DROP POLICY IF EXISTS "Deny all updates on user_roles" ON public.user_roles;
DROP POLICY IF EXISTS "Deny all deletes on user_roles" ON public.user_roles;

CREATE POLICY "Block all inserts on user_roles"
  ON public.user_roles AS RESTRICTIVE FOR INSERT TO authenticated
  WITH CHECK (false);

CREATE POLICY "Block all updates on user_roles"
  ON public.user_roles AS RESTRICTIVE FOR UPDATE TO authenticated
  USING (false);

CREATE POLICY "Block all deletes on user_roles"
  ON public.user_roles AS RESTRICTIVE FOR DELETE TO authenticated
  USING (false);

-- 2. Create single-arg has_role that uses auth.uid() internally
CREATE OR REPLACE FUNCTION public.has_role(_role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = _role
  )
$$;

-- 3. Update all RLS policies to use single-arg has_role()
DROP POLICY IF EXISTS "Admins can view all bookings" ON public.bookings;
CREATE POLICY "Admins can view all bookings"
  ON public.bookings FOR SELECT TO public
  USING (public.has_role('admin'::app_role));

DROP POLICY IF EXISTS "Admins can manage services" ON public.services;
CREATE POLICY "Admins can manage services"
  ON public.services FOR ALL TO public
  USING (public.has_role('admin'::app_role));

DROP POLICY IF EXISTS "Admins can manage slots" ON public.time_slots;
CREATE POLICY "Admins can manage slots"
  ON public.time_slots FOR ALL TO public
  USING (public.has_role('admin'::app_role));

-- 4. Restrict user_roles SELECT to authenticated only
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- 5. Tighten booking UPDATE with explicit WITH CHECK
DROP POLICY IF EXISTS "Users can update their own bookings" ON public.bookings;
CREATE POLICY "Users can update their own bookings"
  ON public.bookings FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
