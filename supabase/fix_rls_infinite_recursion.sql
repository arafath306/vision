-- Fix infinite recursion in RLS
DROP POLICY IF EXISTS "admin_teams_all" ON public.teams;
CREATE POLICY "admin_teams_all" ON public.teams
    FOR ALL USING ( public.get_auth_user_role() = 'ADMIN' );

DROP POLICY IF EXISTS "admin_team_trainers_all" ON public.team_trainers;
CREATE POLICY "admin_team_trainers_all" ON public.team_trainers
    FOR ALL USING ( public.get_auth_user_role() = 'ADMIN' );

-- Also verify if my management select policy is okay.
-- Actually, the earlier existing policy used EXISTS with public.users for "admin_sessions_all" maybe?
-- Let's rewrite the teams policies to use the helper function to avoid recursive RLS loops.
