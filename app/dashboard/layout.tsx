/**
 * Dashboard Layout
 * Main layout for authenticated dashboard pages with navigation
 */

import { ReactNode } from 'react'
import { DashboardNav } from '@/components/dashboard-nav'

export default function DashboardLayout({ children }: { children: ReactNode }) {
    return (
        <div className="flex h-screen bg-background overflow-hidden">
            <DashboardNav />
            <main className="flex-1 overflow-y-auto lg:mt-0 mt-16">
                {children}
            </main>
        </div>
    )
}
