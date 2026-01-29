/**
 * Dashboard Home Page
 * Matches User Screenshots: Colorful Activity Types Grid
 */

'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { supabase } from '@/lib/supabase/client'
import { useUserProfile } from '@/lib/supabase/hooks'

// Colorful Dashboard Cards Configuration
const DASHBOARD_CARDS = [
    { title: 'Interested', count: 7, color: 'bg-green-400 text-black' },
    { title: 'visited client', count: 24, color: 'bg-yellow-400 text-black' },
    { title: 'Junk Lead', count: 509, color: 'bg-red-600 text-white' },
    { title: 'Expected Visit', count: 3, color: 'bg-cyan-400 text-black' },
    { title: 'Flat Sold', count: 31, color: 'bg-blue-600 text-white' },
    { title: 'TOTAL LEADS', count: 0, color: 'bg-slate-400 text-black' }, // Dynamic
    { title: 'NOT INTERESTED', count: 2137, color: 'bg-red-500 text-white' },
    { title: 'NEED TO FOLLOWUP', count: 151, color: 'bg-fuchsia-400 text-black' },
    { title: 'BOOKED IN OTHER PROJECT', count: 424, color: 'bg-pink-600 text-white' },
    { title: 'FRIDAY', count: 0, color: 'bg-lime-500 text-black' },
    { title: 'SATURDAY', count: 0, color: 'bg-purple-300 text-black' },
    { title: 'REQUIRED SAMPLE FLAT (DEMO)', count: 0, color: 'bg-green-500 text-black' },
    { title: 'Demo Data', count: 1, color: 'bg-amber-200 text-black' },
    { title: 'test', count: 8, color: 'bg-amber-200 text-black' },
    { title: 'REQUIRED READY TO MOVE', count: 15, color: 'bg-orange-500 text-black' },
    { title: 'INVALID NUMBER', count: 60, color: 'bg-amber-200 text-black' },
]

export default function DashboardPage() {
    const { profile, loading: profileLoading } = useUserProfile()
    const [totalLeads, setTotalLeads] = useState(0)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (profile?.tenant_id) {
            fetchStats()
        }
    }, [profile?.tenant_id])

    const fetchStats = async () => {
        if (!profile?.tenant_id) return
        try {
            setLoading(true)
            // Fetch real total leads count
            const { count } = await supabase
                .from('leads')
                .select('*', { count: 'exact', head: true })
                .eq('tenant_id', profile.tenant_id)
                .is('deleted_at', null)

            setTotalLeads(count || 0)
        } catch (error) {
            console.error('Error fetching stats:', error)
        } finally {
            setLoading(false)
        }
    }

    if (profileLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        )
    }

    return (
        <div className="container mx-auto py-6 px-4 space-y-6">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-foreground">Activity Types</h2>
            </div>

            {/* Colorful Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {DASHBOARD_CARDS.map((card, index) => (
                    <Card
                        key={index}
                        className={`border-0 shadow-sm ${card.color} h-32 flex flex-col justify-between transition-transform hover:scale-105 cursor-pointer`}
                    >
                        <CardHeader className="pb-0 pt-4 px-4">
                            <CardTitle className="text-sm font-medium opacity-90">
                                {card.title}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="px-4 pb-4">
                            <div className="text-4xl font-bold">
                                {card.title === 'TOTAL LEADS' ? totalLeads : card.count}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}
