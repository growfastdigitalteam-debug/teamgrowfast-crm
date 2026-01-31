/**
 * Centralized type definitions
 */

import type { Database } from '@/lib/supabase/database.types'

// Supabase table types
export type SupabaseLead = Database['public']['Tables']['leads']['Row']
export type SupabaseLeadInsert = Database['public']['Tables']['leads']['Insert']
export type SupabaseLeadUpdate = Database['public']['Tables']['leads']['Update']

export type SupabaseUser = Database['public']['Tables']['users']['Row']
export type SupabaseTenant = Database['public']['Tables']['tenants']['Row']
export type SupabaseSetting = Database['public']['Tables']['crm_settings']['Row']

// Application types
export type UserRole = 'admin' | 'user' | 'super_admin'

export interface User {
    id: string
    email: string
    role: UserRole
    displayName: string
    tenantId?: string
    tenantName?: string
    fullName?: string
    isActive: boolean
}

export interface Tenant {
    id: string
    name: string
    slug: string
    status: 'active' | 'blocked'
    createdAt: string
    settings?: Record<string, any>
}

export interface Remark {
    id: string
    text: string
    date: string
    author: string
}

export interface Lead {
    id: string
    tenantId: string
    fullName: string
    phone: string
    alternatePhone?: string
    email?: string
    location?: string
    flatConfig?: string
    source?: string
    category?: string
    status: string
    notes?: string
    remarksHistory: Remark[]
    assignedTo?: string
    createdAt: string
    updatedAt: string
    createdBy?: string
}

export interface CRMSetting {
    id: string
    tenantId: string
    type: 'category' | 'lead_source' | 'lead_status' | 'team'
    name: string
    color?: string
    isActive: boolean
    order?: number
}

export interface Category extends CRMSetting {
    type: 'category'
}

export interface Source extends CRMSetting {
    type: 'lead_source'
}

export interface ActivityType extends CRMSetting {
    type: 'lead_status'
}

export interface Team extends CRMSetting {
    type: 'team'
}

// Form types
export interface LeadFormData {
    fullName: string
    phone: string
    alternatePhone?: string
    email?: string
    location?: string
    flatConfig?: string
    source?: string
    category?: string
    status?: string
    notes?: string
}

export interface TenantFormData {
    name: string
    adminEmail: string
    adminPassword: string
}

// Filter types
export interface LeadFilters {
    search?: string
    status?: string
    source?: string
    category?: string
    assignedTo?: string
    dateFrom?: string
    dateTo?: string
}

// Stats types
export interface DashboardStats {
    totalLeads: number
    leadsToday: number
    leadsThisWeek: number
    leadsThisMonth: number
    conversionRate: number
    bookedCount: number
    statusBreakdown: Record<string, number>
    sourceBreakdown: Record<string, number>
    categoryBreakdown: Record<string, number>
}
