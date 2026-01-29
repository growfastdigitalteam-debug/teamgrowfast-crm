/**
 * Authentication Utilities
 * Helper functions for authentication and authorization
 */

import { createClient as createServerClient } from './server'
import { createClient as createBrowserClient } from './client'
import type { Database } from './database.types'

type UserRole = 'super_admin' | 'admin' | 'manager' | 'agent' | 'user'

/**
 * Check if user is authenticated (server-side)
 */
export async function isAuthenticated() {
    const supabase = await createServerClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()
    return !!user
}

/**
 * Get current user (server-side)
 */
export async function getCurrentUser() {
    const supabase = await createServerClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()
    return user
}

/**
 * Get current user profile (server-side)
 */
export async function getCurrentUserProfile() {
    const supabase = await createServerClient()
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
 * Check if user has required role (server-side)
 */
export async function hasRequiredRole(requiredRoles: UserRole | UserRole[]) {
    const profile = await getCurrentUserProfile()
    if (!profile) return false

    const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles]
    return roles.includes(profile.role as UserRole)
}

/**
 * Require authentication (throws if not authenticated)
 */
export async function requireAuth() {
    const user = await getCurrentUser()
    if (!user) {
        throw new Error('Authentication required')
    }
    return user
}

/**
 * Require specific role (throws if user doesn't have role)
 */
export async function requireRole(requiredRoles: UserRole | UserRole[]) {
    const profile = await getCurrentUserProfile()
    if (!profile) {
        throw new Error('Authentication required')
    }

    const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles]
    if (!roles.includes(profile.role as UserRole)) {
        throw new Error('Insufficient permissions')
    }

    return profile
}

/**
 * Sign in with email and password (client-side)
 */
export async function signInWithEmail(email: string, password: string) {
    const supabase = createBrowserClient()
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (error) throw error
    return data
}

/**
 * Sign up with email and password (client-side)
 */
export async function signUpWithEmail(
    email: string,
    password: string,
    metadata?: {
        full_name?: string
        tenant_id?: string
        role?: string
    }
) {
    const supabase = createBrowserClient()
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: metadata,
        },
    })

    if (error) throw error
    return data
}

/**
 * Sign out (client-side)
 */
export async function signOut() {
    const supabase = createBrowserClient()
    const { error } = await supabase.auth.signOut()
    if (error) throw error
}

/**
 * Sign in with OAuth provider (client-side)
 */
export async function signInWithOAuth(
    provider: 'google' | 'github' | 'azure' | 'facebook'
) {
    const supabase = createBrowserClient()
    const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
            redirectTo: `${window.location.origin}/auth/callback`,
        },
    })

    if (error) throw error
    return data
}

/**
 * Reset password (client-side)
 */
export async function resetPassword(email: string) {
    const supabase = createBrowserClient()
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
    })

    if (error) throw error
    return data
}

/**
 * Update password (client-side)
 */
export async function updatePassword(newPassword: string) {
    const supabase = createBrowserClient()
    const { data, error } = await supabase.auth.updateUser({
        password: newPassword,
    })

    if (error) throw error
    return data
}

/**
 * Update user profile
 */
export async function updateUserProfile(
    userId: string,
    updates: {
        full_name?: string
        avatar_url?: string
        phone?: string
        preferences?: any
    }
) {
    const supabase = await createServerClient()
    const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', userId)
        .select()
        .single()

    if (error) throw error
    return data
}

/**
 * Role hierarchy for permission checking
 */
const ROLE_HIERARCHY: Record<UserRole, number> = {
    super_admin: 5,
    admin: 4,
    manager: 3,
    agent: 2,
    user: 1,
}

/**
 * Check if user's role is at least the required level
 */
export async function hasMinimumRole(minimumRole: UserRole) {
    const profile = await getCurrentUserProfile()
    if (!profile) return false

    const userLevel = ROLE_HIERARCHY[profile.role as UserRole] || 0
    const requiredLevel = ROLE_HIERARCHY[minimumRole] || 0

    return userLevel >= requiredLevel
}

/**
 * Check if user can manage another user (based on role hierarchy)
 */
export async function canManageUser(targetUserId: string) {
    const supabase = await createServerClient()
    const currentProfile = await getCurrentUserProfile()
    if (!currentProfile) return false

    // Super admin can manage anyone
    if (currentProfile.role === 'super_admin') return true

    // Get target user's profile
    const { data: targetProfile } = await supabase
        .from('users')
        .select('role, tenant_id')
        .eq('id', targetUserId)
        .single()

    if (!targetProfile) return false

    // Must be in same tenant
    if (targetProfile.tenant_id !== currentProfile.tenant_id) return false

    // Check role hierarchy
    const currentLevel = ROLE_HIERARCHY[currentProfile.role as UserRole] || 0
    const targetLevel = ROLE_HIERARCHY[targetProfile.role as UserRole] || 0

    return currentLevel > targetLevel
}
