-- FIx infinite recursion loop between users and teams tables
DROP POLICY IF EXISTS "admin_teams_all" ON public.teams;
CREATE POLICY "admin_teams_all" ON public.teams
    FOR ALL USING ( public.get_auth_user_role() = 'ADMIN' );

DROP POLICY IF EXISTS "admin_team_trainers_all" ON public.team_trainers;
CREATE POLICY "admin_team_trainers_all" ON public.team_trainers
    FOR ALL USING ( public.get_auth_user_role() = 'ADMIN' );
