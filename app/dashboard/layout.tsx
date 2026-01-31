/**
 * Dashboard Layout
 * Protected route layout with sidebar and header
 */

'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthContext } from '@/lib/providers/auth-provider'
import { FullPageLoader } from '@/components/loading-spinner'
import { ROUTES } from '@/lib/constants'

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const { isLoading, isAuthenticated } = useAuthContext()
    const router = useRouter()

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.replace(ROUTES.LOGIN)
        }
    }, [isLoading, isAuthenticated, router])

    if (isLoading) {
        return <FullPageLoader text="Loading dashboard..." />
    }

    if (!isAuthenticated) {
        return <FullPageLoader text="Redirecting to login..." />
    }

    return <>{children}</>
}
