-- Add class clicks tracking
CREATE TABLE IF NOT EXISTS public.class_clicks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  class_id UUID NOT NULL REFERENCES public.class_schedules(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexing
CREATE INDEX IF NOT EXISTS idx_class_clicks_user ON public.class_clicks(user_id);

-- RLS
ALTER TABLE public.class_clicks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_class_clicks_all" ON public.class_clicks;
CREATE POLICY "admin_class_clicks_all" ON public.class_clicks
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'ADMIN')
  );

DROP POLICY IF EXISTS "user_insert_own_click" ON public.class_clicks;
CREATE POLICY "user_insert_own_click" ON public.class_clicks
  FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "user_select_own_click" ON public.class_clicks;
CREATE POLICY "user_select_own_click" ON public.class_clicks
  FOR SELECT USING (user_id = auth.uid());
