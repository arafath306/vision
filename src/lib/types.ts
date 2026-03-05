export type UserRole = 'MEMBER' | 'TEAM_TRAINER' | 'TEAM_LEADER' | 'ADMIN'
export type UserStatus = 'INACTIVE' | 'ACTIVE' | 'SUSPENDED' | 'BANNED'
export type WithdrawMethod = 'BKASH' | 'NAGAD' | 'ROCKET' | 'BANK'
export type WithdrawStatus = 'PENDING' | 'APPROVED' | 'PAID'
export type CommissionType = 'REFERRAL' | 'TRAINER' | 'LEADER'

export interface UserProfile {
    id: string
    role: UserRole
    full_name: string
    email: string
    whatsapp: string
    referral_code: string | null
    referred_by: string | null
    status: UserStatus
    trainer_id: string | null
    leader_id: string | null
    bio?: string
    avatar_url?: string
    address?: string
    gender?: string
    created_at: string
}

export interface ActivationPayment {
    id: string
    user_id: string
    amount: number
    status: 'PENDING' | 'APPROVED'
    approved_by: string | null
    created_at: string
    users?: { full_name: string; whatsapp: string }
}

export interface Commission {
    id: string
    user_id: string
    source_user_id: string
    amount: number
    type: CommissionType
    created_at: string
    source_user?: { full_name: string }
}

export interface WithdrawRequest {
    id: string
    user_id: string
    amount: number
    method: WithdrawMethod
    account_number: string
    status: WithdrawStatus
    created_at: string
    users?: { full_name: string; whatsapp: string }
}

export interface SystemSettings {
    id: string
    referral_percentage: number
    trainer_percentage: number
    leader_percentage: number
    activation_fee: number
}

export interface DashboardStats {
    total_income: number
    today_income: number
    yesterday_income: number
    weekly_income: number
    referral_count: number
    activated_referral_count: number
    withdrawable_balance: number
}
