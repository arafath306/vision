-- ============================================================
-- EXPANDIA NETWORK — Complete Supabase Database Schema
-- Project ID: xwfujiwvheftcfiozugi
-- Run this entire script in Supabase SQL Editor
-- ============================================================

-- ─────────────────────────────────────────────────────────────
-- 1. EXTENSIONS
-- ─────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─────────────────────────────────────────────────────────────
-- 2. ENUMS
-- ─────────────────────────────────────────────────────────────
DO $$ BEGIN
  CREATE TYPE user_role   AS ENUM ('MEMBER','TEAM_TRAINER','TEAM_LEADER','ADMIN');
  CREATE TYPE user_status AS ENUM ('INACTIVE','ACTIVE','SUSPENDED','BANNED');
  CREATE TYPE commission_type    AS ENUM ('REFERRAL','TRAINER','LEADER');
  CREATE TYPE withdraw_method    AS ENUM ('BKASH','NAGAD','ROCKET','BANK');
  CREATE TYPE withdraw_status    AS ENUM ('PENDING','APPROVED','PAID');
  CREATE TYPE activation_status  AS ENUM ('PENDING','APPROVED');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ─────────────────────────────────────────────────────────────
-- 3. TABLES
-- ─────────────────────────────────────────────────────────────

-- 3a. users (extends auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id             UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role           user_role   NOT NULL DEFAULT 'MEMBER',
  status         user_status NOT NULL DEFAULT 'INACTIVE',
  full_name      TEXT        NOT NULL,
  email          TEXT,
  whatsapp       TEXT        NOT NULL UNIQUE,
  referral_code  TEXT        UNIQUE,
  referred_by    UUID        REFERENCES public.users(id) ON DELETE SET NULL,
  trainer_id     UUID        REFERENCES public.users(id) ON DELETE SET NULL,
  leader_id      UUID        REFERENCES public.users(id) ON DELETE SET NULL,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3b. activation_payments
CREATE TABLE IF NOT EXISTS public.activation_payments (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  amount      NUMERIC(10,2) NOT NULL,
  status      activation_status NOT NULL DEFAULT 'PENDING',
  approved_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3c. commissions
CREATE TABLE IF NOT EXISTS public.commissions (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id        UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  source_user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  amount         NUMERIC(10,2) NOT NULL,
  type           commission_type NOT NULL,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3d. withdraw_requests
CREATE TABLE IF NOT EXISTS public.withdraw_requests (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id        UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  amount         NUMERIC(10,2) NOT NULL,
  method         withdraw_method NOT NULL,
  account_number TEXT NOT NULL,
  status         withdraw_status NOT NULL DEFAULT 'PENDING',
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3e. system_settings (single row)
CREATE TABLE IF NOT EXISTS public.system_settings (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  activation_fee        NUMERIC(10,2) NOT NULL DEFAULT 500,
  referral_percentage   NUMERIC(5,2)  NOT NULL DEFAULT 10,
  trainer_percentage    NUMERIC(5,2)  NOT NULL DEFAULT 5,
  leader_percentage     NUMERIC(5,2)  NOT NULL DEFAULT 3,
  updated_at            TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- Seed default settings row if not exists
INSERT INTO public.system_settings (activation_fee, referral_percentage, trainer_percentage, leader_percentage)
SELECT 500, 10, 5, 3
WHERE NOT EXISTS (SELECT 1 FROM public.system_settings);

-- ─────────────────────────────────────────────────────────────
-- 4. INDEXES
-- ─────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_users_whatsapp      ON public.users(whatsapp);
CREATE INDEX IF NOT EXISTS idx_users_referral_code ON public.users(referral_code);
CREATE INDEX IF NOT EXISTS idx_users_referred_by   ON public.users(referred_by);
CREATE INDEX IF NOT EXISTS idx_users_trainer_id    ON public.users(trainer_id);
CREATE INDEX IF NOT EXISTS idx_users_leader_id     ON public.users(leader_id);
CREATE INDEX IF NOT EXISTS idx_users_status        ON public.users(status);
CREATE INDEX IF NOT EXISTS idx_users_role          ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_commissions_user    ON public.commissions(user_id);
CREATE INDEX IF NOT EXISTS idx_commissions_source  ON public.commissions(source_user_id);
CREATE INDEX IF NOT EXISTS idx_commissions_created ON public.commissions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_withdrawals_user    ON public.withdraw_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_withdrawals_status  ON public.withdraw_requests(status);
CREATE INDEX IF NOT EXISTS idx_activations_user    ON public.activation_payments(user_id);
CREATE INDEX IF NOT EXISTS idx_activations_status  ON public.activation_payments(status);

-- ─────────────────────────────────────────────────────────────
-- 5. HELPER: auto-generate referral code on insert
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS TRIGGER AS $$
DECLARE
  code TEXT;
  name_part TEXT;
  phone_part TEXT;
  rand_part TEXT;
BEGIN
  -- Only generate if referral_code is NULL
  IF NEW.referral_code IS NULL THEN
    name_part  := UPPER(SUBSTRING(REGEXP_REPLACE(NEW.full_name, '\s+', '', 'g'), 1, 4));
    phone_part := SUBSTRING(NEW.whatsapp FROM '.{4}$');
    rand_part  := UPPER(SUBSTRING(MD5(RANDOM()::TEXT), 1, 3));
    code := name_part || phone_part || rand_part;

    -- Ensure uniqueness
    WHILE EXISTS (SELECT 1 FROM public.users WHERE referral_code = code) LOOP
      rand_part := UPPER(SUBSTRING(MD5(RANDOM()::TEXT), 1, 4));
      code := name_part || phone_part || rand_part;
    END LOOP;

    NEW.referral_code := code;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_generate_referral_code ON public.users;
CREATE TRIGGER trg_generate_referral_code
  BEFORE INSERT ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION generate_referral_code();

-- ─────────────────────────────────────────────────────────────
-- 6. HELPER: auto-create user profile from auth.users
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Only insert if not already present (app may insert manually)
  IF NOT EXISTS (SELECT 1 FROM public.users WHERE id = NEW.id) THEN
    INSERT INTO public.users (id, full_name, email, whatsapp, role, status)
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'full_name', 'Unknown'),
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'whatsapp', ''),
      'MEMBER',
      'INACTIVE'
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_new_auth_user ON auth.users;
CREATE TRIGGER trg_new_auth_user
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_auth_user();

-- ─────────────────────────────────────────────────────────────
-- 7. HELPER FUNCTIONS FOR RLS (Avoids infinite recursion)
-- ─────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.get_auth_user_role()
RETURNS user_role AS $$
  SELECT role FROM public.users WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

-- ─────────────────────────────────────────────────────────────
-- 8. ROW LEVEL SECURITY (RLS)
-- ─────────────────────────────────────────────────────────────

-- Enable RLS on all tables
ALTER TABLE public.users               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activation_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commissions         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.withdraw_requests   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings     ENABLE ROW LEVEL SECURITY;

-- ── users ────────────────────────────────────────────────────

-- Admin: full access
DROP POLICY IF EXISTS "admin_users_all" ON public.users;
CREATE POLICY "admin_users_all" ON public.users
  FOR ALL USING ( (SELECT role FROM public.users WHERE id = auth.uid()) = 'ADMIN' );

-- Member: view own row only (Must be simple to avoid recursion)
DROP POLICY IF EXISTS "user_select_own" ON public.users;
CREATE POLICY "user_select_own" ON public.users
  FOR SELECT USING (id = auth.uid());

-- Separate policy for managed members to avoid deep nesting
DROP POLICY IF EXISTS "management_select" ON public.users;
CREATE POLICY "management_select" ON public.users
  FOR SELECT USING (
    trainer_id = auth.uid() 
    OR leader_id = auth.uid()
  );

-- Any logged-in user can insert their own row (registration)
DROP POLICY IF EXISTS "user_insert_self" ON public.users;
CREATE POLICY "user_insert_self" ON public.users
  FOR INSERT WITH CHECK (id = auth.uid());

-- Users can update only their own row
DROP POLICY IF EXISTS "user_update_own" ON public.users;
CREATE POLICY "user_update_own" ON public.users
  FOR UPDATE USING (id = auth.uid());

-- Allow anyone to look up a user by referral code (needed for registration)
DROP POLICY IF EXISTS "anyone_can_check_referral" ON public.users;
CREATE POLICY "anyone_can_check_referral" ON public.users
  FOR SELECT TO anon, authenticated
  USING (true);

-- ── activation_payments ──────────────────────────────────────
DROP POLICY IF EXISTS "admin_activations_all" ON public.activation_payments;
CREATE POLICY "admin_activations_all" ON public.activation_payments
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'ADMIN')
  );

DROP POLICY IF EXISTS "user_own_activations" ON public.activation_payments;
CREATE POLICY "user_own_activations" ON public.activation_payments
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "user_insert_activation" ON public.activation_payments;
CREATE POLICY "user_insert_activation" ON public.activation_payments
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- ── commissions ──────────────────────────────────────────────
DROP POLICY IF EXISTS "admin_commissions_all" ON public.commissions;
CREATE POLICY "admin_commissions_all" ON public.commissions
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'ADMIN')
  );

DROP POLICY IF EXISTS "user_own_commissions" ON public.commissions;
CREATE POLICY "user_own_commissions" ON public.commissions
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "trainer_view_commissions" ON public.commissions;
CREATE POLICY "trainer_view_commissions" ON public.commissions
  FOR SELECT USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('TEAM_TRAINER','TEAM_LEADER','ADMIN')
    )
  );

-- Allow admin/system to insert commissions
DROP POLICY IF EXISTS "system_insert_commissions" ON public.commissions;
CREATE POLICY "system_insert_commissions" ON public.commissions
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'ADMIN')
    OR auth.uid() IS NOT NULL  -- authenticated users (client-side admin actions)
  );

-- ── withdraw_requests ────────────────────────────────────────
DROP POLICY IF EXISTS "admin_withdrawals_all" ON public.withdraw_requests;
CREATE POLICY "admin_withdrawals_all" ON public.withdraw_requests
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'ADMIN')
  );

DROP POLICY IF EXISTS "user_own_withdrawals" ON public.withdraw_requests;
CREATE POLICY "user_own_withdrawals" ON public.withdraw_requests
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "user_insert_withdrawal" ON public.withdraw_requests;
CREATE POLICY "user_insert_withdrawal" ON public.withdraw_requests
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Trainer/Leader can view withdrawals of their team
DROP POLICY IF EXISTS "trainer_view_team_withdrawals" ON public.withdraw_requests;
CREATE POLICY "trainer_view_team_withdrawals" ON public.withdraw_requests
  FOR SELECT USING (
    user_id = auth.uid()
    OR user_id IN (
      SELECT id FROM public.users WHERE trainer_id = auth.uid()
    )
    OR user_id IN (
      SELECT id FROM public.users
      WHERE trainer_id IN (SELECT id FROM public.users WHERE leader_id = auth.uid())
    )
  );

-- ── system_settings ──────────────────────────────────────────
DROP POLICY IF EXISTS "admin_settings_all" ON public.system_settings;
CREATE POLICY "admin_settings_all" ON public.system_settings
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'ADMIN')
  );

-- All authenticated users can READ settings (needed for commission calculation display)
DROP POLICY IF EXISTS "auth_settings_read" ON public.system_settings;
CREATE POLICY "auth_settings_read" ON public.system_settings
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- ─────────────────────────────────────────────────────────────
-- 8. GRANT PERMISSIONS
-- ─────────────────────────────────────────────────────────────
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- ─────────────────────────────────────────────────────────────
-- 10. SEED: Admin Support Account
-- Run this if you need to promote your account manually
-- ─────────────────────────────────────────────────────────────

-- UPDATE public.users SET role = 'ADMIN', status = 'ACTIVE' WHERE whatsapp = '01313961899';

-- ─────────────────────────────────────────────────────────────
-- DONE — Expandia Network schema installed successfully
-- ─────────────────────────────────────────────────────────────
```
