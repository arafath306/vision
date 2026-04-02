-- Creates the registration forms table

CREATE TABLE IF NOT EXISTS public.registration_forms (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  submitted_by   UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  employee_id    TEXT NOT NULL UNIQUE,
  full_name      TEXT NOT NULL,
  email          TEXT,
  whatsapp       TEXT NOT NULL,
  contact_number TEXT NOT NULL,
  district       TEXT NOT NULL,
  upazila        TEXT NOT NULL,
  village        TEXT NOT NULL,
  gender         TEXT NOT NULL,
  has_nid        BOOLEAN NOT NULL DEFAULT false,
  nid_region     TEXT,
  nid_number     TEXT,
  account_name   TEXT NOT NULL,
  account_number TEXT NOT NULL,
  password       TEXT NOT NULL,
  status         TEXT NOT NULL DEFAULT 'PENDING',
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS
ALTER TABLE public.registration_forms ENABLE ROW LEVEL SECURITY;

-- users can insert their own
DROP POLICY IF EXISTS "user_insert_own_forms" ON public.registration_forms;
CREATE POLICY "user_insert_own_forms" ON public.registration_forms
  FOR INSERT WITH CHECK (submitted_by = auth.uid());

-- users can view their own
DROP POLICY IF EXISTS "user_select_own_forms" ON public.registration_forms;
CREATE POLICY "user_select_own_forms" ON public.registration_forms
  FOR SELECT USING (submitted_by = auth.uid());

-- trainers and leaders can view their team forms
DROP POLICY IF EXISTS "management_select_forms" ON public.registration_forms;
CREATE POLICY "management_select_forms" ON public.registration_forms
  FOR SELECT USING (
    submitted_by IN (
      SELECT id FROM public.users
      WHERE trainer_id = auth.uid() 
         OR leader_id = auth.uid()
         OR trainer_id IN (SELECT id FROM public.users WHERE leader_id = auth.uid())
    )
  );

-- admins can do everything
DROP POLICY IF EXISTS "admin_all_forms" ON public.registration_forms;
CREATE POLICY "admin_all_forms" ON public.registration_forms
  FOR ALL USING (
    (SELECT role FROM public.users WHERE id = auth.uid()) = 'ADMIN'
  );


-- Notifications for forms
CREATE TABLE IF NOT EXISTS public.form_notifications (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  form_id        UUID NOT NULL REFERENCES public.registration_forms(id) ON DELETE CASCADE,
  user_id        UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  message        TEXT NOT NULL,
  whatsapp       TEXT,
  is_read        BOOLEAN NOT NULL DEFAULT false,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.form_notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "user_select_own_notifications" ON public.form_notifications;
CREATE POLICY "user_select_own_notifications" ON public.form_notifications
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "admin_all_notifications" ON public.form_notifications;
CREATE POLICY "admin_all_notifications" ON public.form_notifications
  FOR ALL USING (
    (SELECT role FROM public.users WHERE id = auth.uid()) = 'ADMIN'
  );

-- Allows inserting by system/admin
DROP POLICY IF EXISTS "admin_insert_notifications" ON public.form_notifications;
CREATE POLICY "admin_insert_notifications" ON public.form_notifications
  FOR INSERT WITH CHECK (
     EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'ADMIN')
     OR auth.uid() IS NOT NULL
  );
