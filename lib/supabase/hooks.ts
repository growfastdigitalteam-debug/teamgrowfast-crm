/**
 * Custom React Hooks for Supabase
 * Reusable hooks for common Supabase operations
 */

'use client'

import { useEffect, useState } from 'react'
import { supabase } from './client'
import type { User } from '@supabase/supabase-js'
import type { Database } from './database.types'

type Tables = Database['public']['Tables']

/**
 * Hook to get the current authenticated user
 */
export function useUser() {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Get initial user
        supabase.auth.getUser().then(({ data: { user } }) => {
            setUser(user)
            setLoading(false)
        })

        // Listen for auth changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null)
            setLoading(false)
        })

        return () => subscription.unsubscribe()
    }, [])

    return { user, loading }
}

/**
 * Hook to get the current user's profile from the users table
 */
export function useUserProfile() {
    const { user } = useUser()
    const [profile, setProfile] = useState<Tables['users']['Row'] | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!user) {
            setProfile(null)
            setLoading(false)
            return
        }

        supabase
            .from('users')
            .select('*')
            .eq('id', user.id)
            .single()
            .then(({ data, error }) => {
                if (!error && data) {
                    setProfile(data)
                }
                setLoading(false)
            })
    }, [user])

    return { profile, loading }
}

/**
 * Hook to get the current user's tenant
 */
export function useTenant() {
    const { profile } = useUserProfile()
    const [tenant, setTenant] = useState<Tables['tenants']['Row'] | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!profile?.tenant_id) {
            setTenant(null)
            setLoading(false)
            return
        }

        supabase
            .from('tenants')
            .select('*')
            .eq('id', profile.tenant_id)
            .single()
            .then(({ data, error }) => {
                if (!error && data) {
                    setTenant(data)
                }
                setLoading(false)
            })
    }, [profile])

    return { tenant, loading }
}

/**
 * Hook to check if user has a specific role
 */
export function useRole(requiredRole?: string | string[]) {
    const { profile } = useUserProfile()

    if (!requiredRole) return { hasRole: true, role: profile?.role }

    const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole]
    const hasRole = profile ? roles.includes(profile.role) : false

    return { hasRole, role: profile?.role }
}

/**
 * Hook to subscribe to real-time changes on a table
 */
export function useRealtimeSubscription<T extends keyof Tables>(
    table: T,
    callback: (payload: any) => void,
    filter?: string
) {
    useEffect(() => {
        const channel = supabase
            .channel(`${table}_changes`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: table as string,
                    filter,
                },
                callback
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [table, callback, filter])
}
