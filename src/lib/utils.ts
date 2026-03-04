import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function generateReferralCode(name: string, whatsapp: string): string {
    const namePart = name.replace(/\s+/g, '').toUpperCase().substring(0, 4)
    const phonePart = whatsapp.slice(-4)
    const rand = Math.random().toString(36).substring(2, 5).toUpperCase()
    return `${namePart}${phonePart}${rand}`
}

export function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-BD', {
        style: 'currency',
        currency: 'BDT',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount)
}

export function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-BD', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    })
}

export function formatDateTime(dateString: string): string {
    return new Date(dateString).toLocaleString('en-BD', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    })
}

export function getStatusColor(status: string): string {
    switch (status) {
        case 'ACTIVE':
        case 'APPROVED':
        case 'PAID':
            return 'text-green-400 bg-green-400/10'
        case 'INACTIVE':
        case 'PENDING':
            return 'text-yellow-400 bg-yellow-400/10'
        case 'SUSPENDED':
            return 'text-orange-400 bg-orange-400/10'
        case 'BANNED':
            return 'text-red-400 bg-red-400/10'
        default:
            return 'text-gray-400 bg-gray-400/10'
    }
}

export function getRoleColor(role: string): string {
    switch (role) {
        case 'ADMIN':
            return 'text-purple-400 bg-purple-400/10'
        case 'TEAM_LEADER':
            return 'text-blue-400 bg-blue-400/10'
        case 'TEAM_TRAINER':
            return 'text-cyan-400 bg-cyan-400/10'
        case 'MEMBER':
            return 'text-green-400 bg-green-400/10'
        default:
            return 'text-gray-400 bg-gray-400/10'
    }
}

export function getRoleLabel(role: string): string {
    switch (role) {
        case 'ADMIN': return 'Admin'
        case 'TEAM_LEADER': return 'Team Leader'
        case 'TEAM_TRAINER': return 'Team Trainer'
        case 'MEMBER': return 'Member'
        default: return role
    }
}
