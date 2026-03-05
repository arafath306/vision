-- ============================================================
-- SkyX View — Profile & Security Update SQL
-- Run this in Supabase SQL Editor to enable new features
-- ============================================================

-- 1. Add extra fields to public.users table for a "more unique" profile
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS avatar_url TEXT,
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS gender TEXT;

-- 2. Function to allow a user to delete their own account
-- This deletes from BOTH public.users (via cascade) and auth.users
CREATE OR REPLACE FUNCTION delete_own_account()
RETURNS void AS $$
BEGIN
  DELETE FROM auth.users WHERE id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Function to allow an Admin to delete any user
-- This is secure because it checks the role of the person calling it
CREATE OR REPLACE FUNCTION delete_user_by_admin(target_user_id UUID)
RETURNS void AS $$
BEGIN
  -- Perform security check: only allow if caller is an ADMIN
  IF (SELECT role FROM public.users WHERE id = auth.uid()) = 'ADMIN' THEN
    DELETE FROM auth.users WHERE id = target_user_id;
  ELSE
    RAISE EXCEPTION 'Access Denied: Only admins can perform this action';
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Ensure RLS policies don't interfere with deletion from public.users
-- (Since we delete from auth.users, the CASCADE on the foreign key handle the rest)
-- However, we make sure public.users has proper CASCADE.
-- ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_id_fkey;
-- ALTER TABLE public.users ADD CONSTRAINT users_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;
