-- Allow admins to view all admin_users records (not just their own)
DROP POLICY IF EXISTS "Admins can view their own record" ON public.admin_users;

CREATE POLICY "Admins can view all admin users"
ON public.admin_users
FOR SELECT
TO authenticated
USING (is_admin(auth.uid()));
