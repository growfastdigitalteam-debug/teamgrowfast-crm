/**
 * Settings API functions using React Query
 * Fetch categories, sources, statuses, teams
 */

import { supabase } from '@/lib/supabase/client'
import type { CRMSetting } from '@/lib/types'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useToast } from '@/lib/hooks/use-toast-notification'

// Query Keys
export const settingsKeys = {
    all: ['settings'] as const,
    lists: () => [...settingsKeys.all, 'list'] as const,
    list: (tenantId: string, type?: string) => [...settingsKeys.lists(), { tenantId, type }] as const,
}

// Transform Supabase setting to app Setting type
function transformSupabaseSetting(sbSetting: any): CRMSetting {
    return {
        id: sbSetting.id,
        tenantId: sbSetting.tenant_id,
        type: sbSetting.type,
        name: sbSetting.name,
        color: sbSetting.color || undefined,
        isActive: sbSetting.is_active,
        order: sbSetting.order || undefined,
    }
}

// Fetch settings
export async function fetchSettings(tenantId: string, type?: string) {
    let query = supabase
        .from('crm_settings')
        .select('*')
        .eq('tenant_id', tenantId)
        .eq('is_active', true)
        .order('order', { ascending: true })

    if (type) {
        query = query.eq('type', type)
    }

    const { data, error } = await query

    if (error) {
        throw error
    }

    return data?.map(transformSupabaseSetting) || []
}

// Hook to fetch all settings
export function useSettings(tenantId: string | undefined, type?: string) {
    return useQuery({
        queryKey: settingsKeys.list(tenantId!, type),
        queryFn: () => fetchSettings(tenantId!, type),
        enabled: !!tenantId,
    })
}

// Hook to fetch categories
export function useCategories(tenantId: string | undefined) {
    return useSettings(tenantId, 'category')
}

// Hook to fetch sources
export function useSources(tenantId: string | undefined) {
    return useSettings(tenantId, 'lead_source')
}

// Hook to fetch statuses
export function useStatuses(tenantId: string | undefined) {
    return useSettings(tenantId, 'lead_status')
}

// Hook to fetch teams
export function useTeams(tenantId: string | undefined) {
    return useSettings(tenantId, 'team')
}

// Hook to create a setting
export function useCreateSetting() {
    const queryClient = useQueryClient()
    const toast = useToast()

    return useMutation({
        mutationFn: async ({
            tenantId,
            type,
            name,
            color,
        }: {
            tenantId: string
            type: string
            name: string
            color?: string
        }) => {
            const { data, error } = await supabase
                .from('crm_settings')
                .insert({
                    tenant_id: tenantId,
                    type,
                    name,
                    color: color || null,
                    is_active: true,
                })
                .select()
                .single()

            if (error) throw error
            return transformSupabaseSetting(data)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: settingsKeys.lists() })
            toast.success('Setting created successfully')
        },
        onError: (error: any) => {
            toast.error('Failed to create setting', error.message)
        },
    })
}

// Hook to update a setting
export function useUpdateSetting() {
    const queryClient = useQueryClient()
    const toast = useToast()

    return useMutation({
        mutationFn: async ({ id, name, color }: { id: string; name?: string; color?: string }) => {
            const updateData: any = {}
            if (name) updateData.name = name
            if (color !== undefined) updateData.color = color

            const { data, error } = await supabase
                .from('crm_settings')
                .update(updateData)
                .eq('id', id)
                .select()
                .single()

            if (error) throw error
            return transformSupabaseSetting(data)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: settingsKeys.lists() })
            toast.success('Setting updated successfully')
        },
        onError: (error: any) => {
            toast.error('Failed to update setting', error.message)
        },
    })
}

// Hook to delete a setting
export function useDeleteSetting() {
    const queryClient = useQueryClient()
    const toast = useToast()

    return useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase.from('crm_settings').update({ is_active: false }).eq('id', id)

            if (error) throw error
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: settingsKeys.lists() })
            toast.success('Setting deleted successfully')
        },
        onError: (error: any) => {
            toast.error('Failed to delete setting', error.message)
        },
    })
}
