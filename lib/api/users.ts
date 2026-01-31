/**
 * Users API functions using React Query
 */

import { supabase } from '@/lib/supabase/client'
import type { User } from '@/lib/types'
import { useQuery } from '@tanstack/react-query'

// Query Keys
export const usersKeys = {
    all: ['users'] as const,
    lists: () => [...usersKeys.all, 'list'] as const,
    list: (tenantId: string) => [...usersKeys.lists(), tenantId] as const,
}

// Transform Supabase user to app User type
function transformSupabaseUser(sbUser: any): User {
    return {
        id: sbUser.id,
        email: sbUser.email,
        role: sbUser.role,
        displayName: sbUser.full_name || sbUser.email,
        fullName: sbUser.full_name,
        tenantId: sbUser.tenant_id,
        isActive: sbUser.is_active,
    }
}

// Fetch users for a tenant
export async function fetchUsers(tenantId: string) {
    const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('tenant_id', tenantId)
        .is('deleted_at', null)
        .order('full_name', { ascending: true })

    if (error) {
        throw error
    }

    return data?.map(transformSupabaseUser) || []
}

// Hook to fetch users
export function useUsers(tenantId: string | undefined) {
    return useQuery({
        queryKey: usersKeys.list(tenantId!),
        queryFn: () => fetchUsers(tenantId!),
        enabled: !!tenantId,
    })
}
