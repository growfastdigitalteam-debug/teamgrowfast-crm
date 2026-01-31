/**
 * Lead API functions using React Query
 * Centralized data fetching for leads
 */

import { supabase } from '@/lib/supabase/client'
import type { Lead, LeadFormData, Remark } from '@/lib/types'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useToast } from '@/lib/hooks/use-toast-notification'

// Query Keys
export const leadKeys = {
    all: ['leads'] as const,
    lists: () => [...leadKeys.all, 'list'] as const,
    list: (filters: any) => [...leadKeys.lists(), filters] as const,
    details: () => [...leadKeys.all, 'detail'] as const,
    detail: (id: string) => [...leadKeys.details(), id] as const,
}

// Transform Supabase lead to app Lead type
function transformSupabaseLead(sbLead: any): Lead {
    return {
        id: sbLead.id,
        tenantId: sbLead.tenant_id,
        fullName: sbLead.name,
        phone: sbLead.phone || '',
        alternatePhone: sbLead.alternate_phone || undefined,
        email: sbLead.email || undefined,
        location: (sbLead.custom_fields as any)?.location || undefined,
        flatConfig: (sbLead.custom_fields as any)?.flatConfig || undefined,
        source: sbLead.source || undefined,
        category: (sbLead.custom_fields as any)?.category || undefined,
        status: sbLead.status || 'Interested',
        notes: sbLead.notes || undefined,
        remarksHistory: (sbLead.custom_fields as any)?.remarksHistory || [],
        assignedTo: sbLead.assigned_to || undefined,
        createdAt: sbLead.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
        updatedAt: sbLead.updated_at || new Date().toISOString(),
        createdBy: sbLead.created_by || undefined,
    }
}

// Fetch all leads for a tenant
export async function fetchLeads(tenantId: string, filters?: any) {
    let query = supabase
        .from('leads')
        .select('*')
        .eq('tenant_id', tenantId)
        .is('deleted_at', null)
        .order('updated_at', { ascending: false })

    if (filters?.status) {
        query = query.eq('status', filters.status)
    }

    if (filters?.source) {
        query = query.eq('source', filters.source)
    }

    if (filters?.assignedTo) {
        query = query.eq('assigned_to', filters.assignedTo)
    }

    if (filters?.search) {
        query = query.or(`name.ilike.%${filters.search}%,phone.ilike.%${filters.search}%`)
    }

    const { data, error } = await query

    if (error) {
        throw error
    }

    return data?.map(transformSupabaseLead) || []
}

// Hook to fetch leads
export function useLeads(tenantId: string | undefined, filters?: any) {
    return useQuery({
        queryKey: leadKeys.list({ tenantId, ...filters }),
        queryFn: () => fetchLeads(tenantId!, filters),
        enabled: !!tenantId,
    })
}

// Hook to create a lead
export function useCreateLead() {
    const queryClient = useQueryClient()
    const toast = useToast()

    return useMutation({
        mutationFn: async ({ tenantId, data, userId }: { tenantId: string; data: LeadFormData; userId: string }) => {
            const leadData = {
                tenant_id: tenantId,
                name: data.fullName,
                phone: data.phone,
                alternate_phone: data.alternatePhone || null,
                email: data.email || null,
                source: data.source || null,
                status: data.status || 'Interested',
                notes: data.notes || null,
                custom_fields: {
                    location: data.location || null,
                    flatConfig: data.flatConfig || null,
                    category: data.status === 'Booked' ? 'Converted' : (data.category || null),
                    remarksHistory: data.notes ? [{
                        id: Date.now().toString(),
                        text: data.notes,
                        date: new Date().toISOString(),
                        author: 'Current User',
                    }] : [],
                },
                created_by: userId,
            }

            const { data: newLead, error } = await supabase
                .from('leads')
                .insert(leadData)
                .select()
                .single()

            if (error) throw error
            return transformSupabaseLead(newLead)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: leadKeys.lists() })
            toast.success('Lead created successfully')
        },
        onError: (error: any) => {
            toast.error('Failed to create lead', error.message)
        },
    })
}

// Hook to update a lead
export function useUpdateLead() {
    const queryClient = useQueryClient()
    const toast = useToast()

    return useMutation({
        mutationFn: async ({ leadId, data, newRemark }: { leadId: string; data: Partial<Lead>; newRemark?: string }) => {
            const currentLead = queryClient
                .getQueryData<Lead[]>(leadKeys.lists())
                ?.find((l) => l.id === leadId)

            let remarksHistory = currentLead?.remarksHistory || []

            if (newRemark?.trim()) {
                const remark: Remark = {
                    id: Date.now().toString(),
                    text: newRemark.trim(),
                    date: new Date().toISOString(),
                    author: 'Current User',
                }
                remarksHistory = [remark, ...remarksHistory]
            }

            const updateData = {
                name: data.fullName,
                phone: data.phone,
                alternate_phone: data.alternatePhone || null,
                email: data.email || null,
                source: data.source || null,
                status: data.status,
                notes: newRemark?.trim() || data.notes || null,
                custom_fields: {
                    location: data.location || null,
                    flatConfig: data.flatConfig || null,
                    category: data.status === 'Booked' ? 'Converted' : data.category,
                    remarksHistory,
                },
                assigned_to: data.assignedTo || null,
                updated_at: new Date().toISOString(),
            }

            const { data: updatedLead, error } = await supabase
                .from('leads')
                .update(updateData)
                .eq('id', leadId)
                .select()
                .single()

            if (error) throw error
            return transformSupabaseLead(updatedLead)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: leadKeys.lists() })
            toast.success('Lead updated successfully')
        },
        onError: (error: any) => {
            toast.error('Failed to update lead', error.message)
        },
    })
}

// Hook to delete a lead (soft delete)
export function useDeleteLead() {
    const queryClient = useQueryClient()
    const toast = useToast()

    return useMutation({
        mutationFn: async (leadId: string) => {
            const { error } = await supabase
                .from('leads')
                .update({ deleted_at: new Date().toISOString() })
                .eq('id', leadId)

            if (error) throw error
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: leadKeys.lists() })
            toast.success('Lead deleted successfully')
        },
        onError: (error: any) => {
            toast.error('Failed to delete lead', error.message)
        },
    })
}

// Hook to bulk assign leads
export function useBulkAssignLeads() {
    const queryClient = useQueryClient()
    const toast = useToast()

    return useMutation({
        mutationFn: async ({ leadIds, assignedTo }: { leadIds: string[]; assignedTo: string }) => {
            const { error } = await supabase
                .from('leads')
                .update({ assigned_to: assignedTo, updated_at: new Date().toISOString() })
                .in('id', leadIds)

            if (error) throw error
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: leadKeys.lists() })
            toast.success(`${variables.leadIds.length} lead(s) assigned successfully`)
        },
        onError: (error: any) => {
            toast.error('Failed to assign leads', error.message)
        },
    })
}

// Hook to bulk update lead status
export function useBulkUpdateLeads() {
    const queryClient = useQueryClient()
    const toast = useToast()

    return useMutation({
        mutationFn: async ({
            leadIds,
            updates,
        }: {
            leadIds: string[]
            updates: { status?: string; source?: string; category?: string }
        }) => {
            const updateData: any = { updated_at: new Date().toISOString() }

            if (updates.status) updateData.status = updates.status
            if (updates.source) updateData.source = updates.source

            const { error } = await supabase.from('leads').update(updateData).in('id', leadIds)

            if (error) throw error
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: leadKeys.lists() })
            toast.success(`${variables.leadIds.length} lead(s) updated successfully`)
        },
        onError: (error: any) => {
            toast.error('Failed to update leads', error.message)
        },
    })
}
