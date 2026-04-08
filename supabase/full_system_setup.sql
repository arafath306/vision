-- ==========================================
-- SKYX VIEW MASTER SYSTEM SETUP (VAULT & TELEMETRY)
-- Run this in your Supabase SQL Editor
-- ==========================================

-- 1. Ensure columns exist in system_settings
ALTER TABLE public.system_settings ADD COLUMN IF NOT EXISTS is_maintenance_mode BOOLEAN DEFAULT FALSE;
ALTER TABLE public.system_settings ADD COLUMN IF NOT EXISTS maintenance_developer TEXT DEFAULT 'Admin';
ALTER TABLE public.system_settings ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- 2. Ensure avatar_url exists in users for Telemetry list
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- 3. Optimization: Create helper function for RLS Admin Check
-- This prevents recursion in policies
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND role = 'ADMIN'
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- 4. Update Policies to use the new helper (Fixes recursion/performance)
-- Users Table
DROP POLICY IF EXISTS "admin_users_all" ON public.users;
CREATE POLICY "admin_users_all" ON public.users FOR ALL USING (public.is_admin());

-- Commissions Table
DROP POLICY IF EXISTS "admin_commissions_all" ON public.commissions;
CREATE POLICY "admin_commissions_all" ON public.commissions FOR ALL USING (public.is_admin());

-- Withdraw Requests Table
DROP POLICY IF EXISTS "admin_withdraw_all" ON public.withdraw_requests;
CREATE POLICY "admin_withdraw_all" ON public.withdraw_requests FOR ALL USING (public.is_admin());

-- System Settings
DROP POLICY IF EXISTS "admin_settings_all" ON public.system_settings;
CREATE POLICY "admin_settings_all" ON public.system_settings FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "user_read_settings" ON public.system_settings;
CREATE POLICY "user_read_settings" ON public.system_settings FOR SELECT USING (true);

-- 5. Create the default settings row if it doesn't exist
INSERT INTO public.system_settings (id, activation_fee, is_maintenance_mode, maintenance_developer)
SELECT '00000000-0000-0000-0000-000000000000', 500, false, 'Admin'
WHERE NOT EXISTS (SELECT 1 FROM public.system_settings);

-- 6. Enable Realtime Presence for the users table (optional but good for tracking)
-- Note: Realtime Presence for "channels" like 'skyx-telemetry' is handled by the SDK, 
-- but ensuring 'users' table has realtime enabled helps the database stay in sync.
ALTER PUBLICATION supabase_realtime ADD TABLE public.users;
ALTER PUBLICATION supabase_realtime ADD TABLE public.system_settings;

-- 7. Ghost Mode / Admin Permissions verification
-- Grant select to authenticated users for the get_auth_user_role function if used
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
