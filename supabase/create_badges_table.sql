/* 
  SQL Migration to create the 'badges' table for dynamic badge management.
  Run this in the Supabase SQL Editor.
*/

CREATE TABLE IF NOT EXISTS public.badges (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL UNIQUE,
    role text NOT NULL, -- MEMBER, TEAM_TRAINER, TEAM_LEADER, ADMIN
    required_referrals integer DEFAULT 0,
    required_income numeric DEFAULT 0,
    color_class text DEFAULT 'text-slate-400 bg-slate-400/10 border-slate-400/20',
    icon_emoji text DEFAULT '🏆',
    description text,
    is_auto_assign boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Public read access to badges" ON public.badges FOR SELECT USING (true);
CREATE POLICY "Admin full access to badges" ON public.badges FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'ADMIN')
);

-- Insert initial data based on previous hardcoded tiers
INSERT INTO public.badges (name, role, required_referrals, required_income, color_class, icon_emoji)
VALUES 
    ('Diamond Earner', 'MEMBER', 50, 10000, 'text-indigo-400 bg-indigo-400/10 border-indigo-400/20 shadow-indigo-400/20', '💎'),
    ('Elite Earner', 'MEMBER', 20, 5000, 'text-fuchsia-400 bg-fuchsia-400/10 border-fuchsia-400/20 shadow-fuchsia-400/20', '👑'),
    ('Pro Worker', 'MEMBER', 5, 1000, 'text-sky-400 bg-sky-400/10 border-sky-400/20 shadow-sky-400/20', '⭐'),
    ('Newbie', 'MEMBER', 0, 0, 'text-slate-400 bg-slate-400/10 border-slate-400/20', '🌱'),
    ('Master Trainer', 'TEAM_TRAINER', 30, 15000, 'text-amber-400 bg-amber-400/10 border-amber-400/20 shadow-amber-400/20', '🎓'),
    ('Top Trainer', 'TEAM_TRAINER', 10, 5000, 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20 shadow-emerald-400/20', '🎖️'),
    ('Trainer', 'TEAM_TRAINER', 0, 0, 'text-teal-400 bg-teal-400/10 border-teal-400/20', '👤'),
    ('Legend Leader', 'TEAM_LEADER', 100, 50000, 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30', '🦁'),
    ('Top Leader', 'TEAM_LEADER', 30, 15000, 'text-rose-400 bg-rose-400/10 border-rose-400/20 shadow-rose-400/20', '🎖️'),
    ('Leader', 'TEAM_LEADER', 0, 0, 'text-red-400 bg-red-400/10 border-red-400/20', '🚩'),
    ('Admin', 'ADMIN', 0, 0, 'text-sky-400 bg-sky-400/10 border-sky-400/20 font-black', '🛡️')
ON CONFLICT (name) DO NOTHING;
