/**
 * Authentication hook
 * Provides user session, login, logout functionality
 */

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import type { User } from '@/lib/types'
import { useToast } from './use-toast-notification'

export function useAuth() {
    const [user, setUser] = useState<User | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const { error: showError } = useToast()

    useEffect(() => {
        // Check active session
        const checkSession = async () => {
            try {
                const { data: { session }, error } = await supabase.auth.getSession()

                if (error) {
                    throw error
                }

                if (session?.user) {
                    await loadUserProfile(session.user.id)
                }
            } catch (err) {
                console.error('Session check error:', err)
            } finally {
                setIsLoading(false)
            }
        }

        checkSession()

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_IN' && session?.user) {
                await loadUserProfile(session.user.id)
            } else if (event === 'SIGNED_OUT') {
                setUser(null)
            }
        })

        return () => {
            subscription.unsubscribe()
        }
    }, [])

    const loadUserProfile = async (userId: string) => {
        try {
            const { data: profile, error } = await supabase
                .from('users')
                .select('*, tenants(*)')
                .eq('id', userId)
                .maybeSingle()

            if (error) {
                throw error
            }

            if (profile) {
                setUser({
                    id: profile.id,
                    email: profile.email,
                    role: profile.role as any,
                    displayName: profile.full_name || profile.email,
                    fullName: profile.full_name,
                    tenantId: profile.tenant_id || undefined,
                    tenantName: (profile.tenants as any)?.name,
                    isActive: profile.is_active,
                })
            }
        } catch (err: any) {
            console.error('Error loading user profile:', err)
            showError('Failed to load user profile', err.message)
        }
    }

    const login = async (email: string, password: string) => {
        try {
            setIsLoading(true)
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            })

            if (error) {
                throw error
            }

            if (data.user) {
                await loadUserProfile(data.user.id)
                return { success: true }
            }

            return { success: false, error: 'Login failed' }
        } catch (err: any) {
            console.error('Login error:', err)
            return { success: false, error: err.message || 'Login failed' }
        } finally {
            setIsLoading(false)
        }
    }

    const logout = async () => {
        try {
            setIsLoading(true)
            const { error } = await supabase.auth.signOut()

            if (error) {
                throw error
            }

            setUser(null)
            return { success: true }
        } catch (err: any) {
            console.error('Logout error:', err)
            return { success: false, error: err.message || 'Logout failed' }
        } finally {
            setIsLoading(false)
        }
    }

    return {
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        refreshUser: () => user?.id && loadUserProfile(user.id),
    }
}
