/**
 * Authentication Provider
 * Makes auth state available throughout the app
 */

'use client'

import { createContext, useContext, type ReactNode } from 'react'
import { useAuth } from '@/lib/hooks/use-auth'
import type { User } from '@/lib/types'

interface AuthContextValue {
    user: User | null
    isLoading: boolean
    isAuthenticated: boolean
    login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
    logout: () => Promise<{ success: boolean; error?: string }>
    refreshUser: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
    const auth = useAuth()

    return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>
}

export function useAuthContext() {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuthContext must be used within AuthProvider')
    }
    return context
}
