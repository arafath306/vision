export interface BadgeDefinition {
    id: string
    name: string
    role: string
    required_referrals: number
    required_income: number
    color_class: string
    icon_emoji: string
    is_auto_assign: boolean
    description?: string
}

export function getBadgeColor(badgeName: string | undefined | null, badges?: BadgeDefinition[]) {
    // If we have dynamic badges, use them
    if (badges && badgeName) {
        const found = badges.find(b => b.name.toLowerCase() === badgeName.toLowerCase())
        if (found) return found.color_class
    }

    // Static defaults if fallback is needed or for initial loads
    const staticColors: Record<string, string> = {
        'Diamond Earner': 'text-indigo-400 bg-indigo-400/10 border-indigo-400/20 shadow-indigo-400/20',
        'Elite Earner': 'text-fuchsia-400 bg-fuchsia-400/10 border-fuchsia-400/20 shadow-fuchsia-400/20',
        'Pro Worker': 'text-sky-400 bg-sky-400/10 border-sky-400/20 shadow-sky-400/20',
        'Newbie': 'text-slate-400 bg-slate-400/10 border-slate-400/20',
    }
    
    if (badgeName && staticColors[badgeName]) return staticColors[badgeName]
    if (!badgeName) return staticColors['Newbie']
    
    return 'text-white bg-slate-800 border-slate-700 shadow-slate-700/20'
}

export function evaluateAutoBadge(role: string, referrals: number, income: number, currentBadge: string | null, badges?: BadgeDefinition[]) {
    if (!badges || badges.length === 0) return currentBadge || 'Newbie'

    // Highest required_income/referrals comes first
    const eligibleBadges = badges
        .filter(t => t.is_auto_assign && t.role === role && referrals >= t.required_referrals && income >= t.required_income)
        .sort((a, b) => b.required_income - a.required_income || b.required_referrals - a.required_referrals)

    const bestBadge = eligibleBadges[0]
    
    if (!bestBadge) return currentBadge || 'Newbie'
    
    // If they have a badge that is in our system, we allow overwriting with a better one.
    // If they have a custom badge NOT in our system, we don't automatically overwrite it unless Admin manually does it.
    const isStandardBadge = badges.some(b => b.name.toLowerCase() === (currentBadge || '').toLowerCase())
    
    if (!currentBadge || currentBadge === 'Newbie' || isStandardBadge) {
        return bestBadge.name
    }

    return currentBadge
}
