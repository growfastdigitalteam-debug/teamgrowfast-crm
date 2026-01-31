/**
 * Root page - Redirects to dashboard or login based on auth status
 */

'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthContext } from '@/lib/providers/auth-provider'
import { FullPageLoader } from '@/components/loading-spinner'
import { ROUTES } from '@/lib/constants'

export default function HomePage() {
  const { isLoading, isAuthenticated } = useAuthContext()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        router.replace(ROUTES.DASHBOARD)
      } else {
        router.replace(ROUTES.LOGIN)
      }
    }
  }, [isLoading, isAuthenticated, router])

  return <FullPageLoader text="Loading CRM..." />
}
