
-- 1. Allow Super Admin to view ALL users (to see Created Companies)
DROP POLICY IF EXISTS "Super Admin see all users" ON public.users;
CREATE POLICY "Super Admin see all users" ON public.users
FOR SELECT
USING (
  (SELECT email FROM auth.users WHERE id = auth.uid()) = 'admin@admin.com'
  OR 
  (SELECT role FROM public.users WHERE id = auth.uid()) = 'superadmin'
);

-- 2. Allow Admins to View their own Company's Settings
DROP POLICY IF EXISTS "Admins view settings" ON public.crm_settings;
CREATE POLICY "Admins view settings" ON public.crm_settings
FOR SELECT
USING (tenant_id = (SELECT tenant_id FROM public.users WHERE id = auth.uid()));

-- 3. Allow Admins to INSERT Leads (Fix Add Lead)
DROP POLICY IF EXISTS "Admins insert leads" ON public.leads;
CREATE POLICY "Admins insert leads" ON public.leads
FOR INSERT
WITH CHECK (tenant_id = (SELECT tenant_id FROM public.users WHERE id = auth.uid()));

-- 4. Allow Admins to SELECT Leads
DROP POLICY IF EXISTS "Admins select leads" ON public.leads;
CREATE POLICY "Admins select leads" ON public.leads
FOR SELECT
USING (tenant_id = (SELECT tenant_id FROM public.users WHERE id = auth.uid()));

-- 5. Allow Admins to UPDATE Leads
DROP POLICY IF EXISTS "Admins update leads" ON public.leads;
CREATE POLICY "Admins update leads" ON public.leads
FOR UPDATE
USING (tenant_id = (SELECT tenant_id FROM public.users WHERE id = auth.uid()));

