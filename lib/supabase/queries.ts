/**
 * Supabase Query Utilities
 * Common database queries and helper functions
 */

import type { Database } from './database.types'
import type { SupabaseClient } from '@supabase/supabase-js'

type Tables = Database['public']['Tables']

/**
 * Get the current user's tenant_id
 */
export async function getCurrentTenantId(
    supabase: SupabaseClient<Database>
): Promise<string | null> {
    const {
        data: { user },
    } = await supabase.auth.getUser()
    if (!user) return null

    const { data } = await supabase
        .from('users')
        .select('tenant_id')
        .eq('id', user.id)
        .single()

    return data?.tenant_id || null
}

/**
 * Get the current user's profile
 */
export async function getCurrentUserProfile(
    supabase: SupabaseClient<Database>
): Promise<Tables['users']['Row'] | null> {
    const {
        data: { user },
    } = await supabase.auth.getUser()
    if (!user) return null

    const { data } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

    return data
}

/**
 * Check if user has a specific role
 */
export async function hasRole(
    supabase: SupabaseClient<Database>,
    roles: string | string[]
): Promise<boolean> {
    const profile = await getCurrentUserProfile(supabase)
    if (!profile) return false

    const roleArray = Array.isArray(roles) ? roles : [roles]
    return roleArray.includes(profile.role)
}

/**
 * Get all CRM settings by type
 */
export async function getCrmSettings(
    supabase: SupabaseClient<Database>,
    type: string
): Promise<Tables['crm_settings']['Row'][]> {
    const tenantId = await getCurrentTenantId(supabase)
    if (!tenantId) return []

    const { data } = await supabase
        .from('crm_settings')
        .select('*')
        .eq('tenant_id', tenantId)
        .eq('type', type)
        .eq('is_active', true)
        .order('sort_order', { ascending: true })

    return data || []
}

/**
 * Get all active properties
 */
export async function getActiveProperties(
    supabase: SupabaseClient<Database>
): Promise<Tables['properties']['Row'][]> {
    const tenantId = await getCurrentTenantId(supabase)
    if (!tenantId) return []

    const { data } = await supabase
        .from('properties')
        .select('*')
        .eq('tenant_id', tenantId)
        .eq('status', 'active')
        .is('deleted_at', null)
        .order('created_at', { ascending: false })

    return data || []
}

/**
 * Get leads with filters
 */
export async function getLeads(
    supabase: SupabaseClient<Database>,
    filters?: {
        status?: string
        source?: string
        assigned_to?: string
        property_id?: string
    }
): Promise<Tables['leads']['Row'][]> {
    const tenantId = await getCurrentTenantId(supabase)
    if (!tenantId) return []

    let query = supabase
        .from('leads')
        .select('*')
        .eq('tenant_id', tenantId)
        .is('deleted_at', null)

    if (filters?.status) {
        query = query.eq('status', filters.status)
    }
    if (filters?.source) {
        query = query.eq('source', filters.source)
    }
    if (filters?.assigned_to) {
        query = query.eq('assigned_to', filters.assigned_to)
    }
    if (filters?.property_id) {
        query = query.eq('property_id', filters.property_id)
    }

    const { data } = await query.order('created_at', { ascending: false })

    return data || []
}

/**
 * Get lead by ID with related data
 */
export async function getLeadById(
    supabase: SupabaseClient<Database>,
    leadId: string
) {
    const { data } = await supabase
        .from('leads')
        .select(
            `
      *,
      property:properties(*),
      assigned_user:users!leads_assigned_to_fkey(*),
      activities(*)
    `
        )
        .eq('id', leadId)
        .single()

    return data
}

/**
 * Create a new lead
 */
export async function createLead(
    supabase: SupabaseClient<Database>,
    lead: Omit<
        Tables['leads']['Insert'],
        'id' | 'tenant_id' | 'created_by' | 'created_at' | 'updated_at'
    >
): Promise<Tables['leads']['Row'] | null> {
    const tenantId = await getCurrentTenantId(supabase)
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!tenantId || !user) return null

    const { data, error } = await supabase
        .from('leads')
        .insert({
            ...lead,
            tenant_id: tenantId,
            created_by: user.id,
        })
        .select()
        .single()

    if (error) {
        console.error('Error creating lead:', error)
        return null
    }

    return data
}

/**
 * Update a lead
 */
export async function updateLead(
    supabase: SupabaseClient<Database>,
    leadId: string,
    updates: Partial<Tables['leads']['Update']>
): Promise<Tables['leads']['Row'] | null> {
    const { data, error } = await supabase
        .from('leads')
        .update(updates)
        .eq('id', leadId)
        .select()
        .single()

    if (error) {
        console.error('Error updating lead:', error)
        return null
    }

    return data
}

/**
 * Soft delete a lead
 */
export async function deleteLead(
    supabase: SupabaseClient<Database>,
    leadId: string
): Promise<boolean> {
    const { error } = await supabase
        .from('leads')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', leadId)

    if (error) {
        console.error('Error deleting lead:', error)
        return false
    }

    return true
}

/**
 * Create an activity
 */
export async function createActivity(
    supabase: SupabaseClient<Database>,
    activity: Omit<
        Tables['activities']['Insert'],
        'id' | 'tenant_id' | 'created_by' | 'created_at' | 'updated_at'
    >
): Promise<Tables['activities']['Row'] | null> {
    const tenantId = await getCurrentTenantId(supabase)
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!tenantId || !user) return null

    const { data, error } = await supabase
        .from('activities')
        .insert({
            ...activity,
            tenant_id: tenantId,
            created_by: user.id,
        })
        .select()
        .single()

    if (error) {
        console.error('Error creating activity:', error)
        return null
    }

    return data
}

/**
 * Get activities for a lead
 */
export async function getLeadActivities(
    supabase: SupabaseClient<Database>,
    leadId: string
): Promise<Tables['activities']['Row'][]> {
    const { data } = await supabase
        .from('activities')
        .select('*, created_user:users!activities_created_by_fkey(*)')
        .eq('lead_id', leadId)
        .order('created_at', { ascending: false })

    return data || []
}

/**
 * Get users in the current tenant
 */
export async function getTenantUsers(
    supabase: SupabaseClient<Database>
): Promise<Tables['users']['Row'][]> {
    const tenantId = await getCurrentTenantId(supabase)
    if (!tenantId) return []

    const { data } = await supabase
        .from('users')
        .select('*')
        .eq('tenant_id', tenantId)
        .eq('is_active', true)
        .is('deleted_at', null)
        .order('full_name', { ascending: true })

    return data || []
}

/**
 * Get dashboard statistics
 */
export async function getDashboardStats(supabase: SupabaseClient<Database>) {
    const tenantId = await getCurrentTenantId(supabase)
    if (!tenantId) return null

    // Get total leads
    const { count: totalLeads } = await supabase
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .eq('tenant_id', tenantId)
        .is('deleted_at', null)

    // Get new leads (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const { count: newLeads } = await supabase
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .eq('tenant_id', tenantId)
        .gte('created_at', thirtyDaysAgo.toISOString())
        .is('deleted_at', null)

    // Get leads by status
    const { data: leadsByStatus } = await supabase
        .from('leads')
        .select('status')
        .eq('tenant_id', tenantId)
        .is('deleted_at', null)

    // Get total properties
    const { count: totalProperties } = await supabase
        .from('properties')
        .select('*', { count: 'exact', head: true })
        .eq('tenant_id', tenantId)
        .is('deleted_at', null)

    // Get total activities
    const { count: totalActivities } = await supabase
        .from('activities')
        .select('*', { count: 'exact', head: true })
        .eq('tenant_id', tenantId)

    return {
        totalLeads: totalLeads || 0,
        newLeads: newLeads || 0,
        totalProperties: totalProperties || 0,
        totalActivities: totalActivities || 0,
        leadsByStatus: leadsByStatus || [],
    }
}

/**
 * Search leads by name, email, or phone
 */
export async function searchLeads(
    supabase: SupabaseClient<Database>,
    searchTerm: string
): Promise<Tables['leads']['Row'][]> {
    const tenantId = await getCurrentTenantId(supabase)
    if (!tenantId) return []

    const { data } = await supabase
        .from('leads')
        .select('*')
        .eq('tenant_id', tenantId)
        .is('deleted_at', null)
        .or(`name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%`)
        .order('created_at', { ascending: false })
        .limit(20)

    return data || []
}
