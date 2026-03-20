-- Create teams table
CREATE TABLE IF NOT EXISTS public.teams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    leader_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Team trainers mapping
CREATE TABLE IF NOT EXISTS public.team_trainers (
    team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
    trainer_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    PRIMARY KEY (team_id, trainer_id)
);

-- Add team_id to users to map members
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL;

-- Enable RLS
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_trainers ENABLE ROW LEVEL SECURITY;

-- Admins can do everything
CREATE POLICY "admin_teams_all" ON public.teams
    FOR ALL USING (
      EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'ADMIN')
    );

CREATE POLICY "admin_team_trainers_all" ON public.team_trainers
    FOR ALL USING (
      EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'ADMIN')
    );

-- Everyone can read
CREATE POLICY "anyone_read_teams" ON public.teams
    FOR SELECT USING (true);
    
CREATE POLICY "anyone_read_team_trainers" ON public.team_trainers
    FOR SELECT USING (true);

-- Update RLS for users table so trainers and leaders can see members of their teams.
-- For a leader: team_id IN (SELECT id FROM public.teams WHERE leader_id = auth.uid())
-- For a trainer: team_id IN (SELECT team_id FROM public.team_trainers WHERE trainer_id = auth.uid())

DROP POLICY IF EXISTS "team_management_select" ON public.users;
CREATE POLICY "team_management_select" ON public.users
  FOR SELECT USING (
    team_id IN (SELECT id FROM public.teams WHERE leader_id = auth.uid()) 
    OR 
    team_id IN (SELECT team_id FROM public.team_trainers WHERE trainer_id = auth.uid())
  );
