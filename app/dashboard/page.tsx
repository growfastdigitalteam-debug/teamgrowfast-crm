/**
 * Dashboard Home Page
 * Main dashboard with stats, charts, and recent activity
 */

'use client'

import { useEffect, useState } from 'react'
import {
    Users,
    Building2,
    TrendingUp,
    Activity,
    Phone,
    Mail,
    Calendar,
    ArrowUpRight,
    ArrowDownRight,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { supabase } from '@/lib/supabase'
import { useUserProfile } from '@/lib/supabase/hooks'
import Link from 'next/link'

interface DashboardStats {
    totalLeads: number
    newLeads: number
    totalProperties: number
    totalActivities: number
    leadsGrowth: number
    propertiesGrowth: number
}

interface RecentLead {
    id: string
    name: string
    email: string | null
    phone: string | null
    status: string
    source: string | null
    created_at: string
}

export default function DashboardPage() {
    const { profile, loading: profileLoading } = useUserProfile()
    const [stats, setStats] = useState<DashboardStats>({
        totalLeads: 0,
        newLeads: 0,
        totalProperties: 0,
        totalActivities: 0,
        leadsGrowth: 0,
        propertiesGrowth: 0,
    })
    const [recentLeads, setRecentLeads] = useState<RecentLead[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (profile?.tenant_id) {
            fetchDashboardData()
        }
    }, [profile?.tenant_id])

    const fetchDashboardData = async () => {
        if (!profile?.tenant_id) return

        try {
            setLoading(true)

            // Fetch total leads
            const { count: totalLeads } = await supabase
                .from('leads')
                .select('*', { count: 'exact', head: true })
                .eq('tenant_id', profile.tenant_id)
                .is('deleted_at', null)

            // Fetch new leads (last 30 days)
            const thirtyDaysAgo = new Date()
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

            const { count: newLeads } = await supabase
                .from('leads')
                .select('*', { count: 'exact', head: true })
                .eq('tenant_id', profile.tenant_id)
                .gte('created_at', thirtyDaysAgo.toISOString())
                .is('deleted_at', null)

            // Fetch total properties
            const { count: totalProperties } = await supabase
                .from('properties')
                .select('*', { count: 'exact', head: true })
                .eq('tenant_id', profile.tenant_id)
                .is('deleted_at', null)

            // Fetch total activities
            const { count: totalActivities } = await supabase
                .from('activities')
                .select('*', { count: 'exact', head: true })
                .eq('tenant_id', profile.tenant_id)

            // Fetch recent leads
            const { data: recentLeadsData } = await supabase
                .from('leads')
                .select('id, name, email, phone, status, source, created_at')
                .eq('tenant_id', profile.tenant_id)
                .is('deleted_at', null)
                .order('created_at', { ascending: false })
                .limit(5)

            setStats({
                totalLeads: totalLeads || 0,
                newLeads: newLeads || 0,
                totalProperties: totalProperties || 0,
                totalActivities: totalActivities || 0,
                leadsGrowth: totalLeads ? Math.round(((newLeads || 0) / totalLeads) * 100) : 0,
                propertiesGrowth: 12, // Mock data
            })

            setRecentLeads(recentLeadsData || [])
        } catch (error) {
            console.error('Error fetching dashboard data:', error)
        } finally {
            setLoading(false)
        }
    }

    const getStatusColor = (status: string) => {
        const statusColors: Record<string, string> = {
            new: 'bg-blue-500/10 text-blue-600',
            contacted: 'bg-amber-500/10 text-amber-600',
            qualified: 'bg-purple-500/10 text-purple-600',
            proposal: 'bg-indigo-500/10 text-indigo-600',
            negotiation: 'bg-orange-500/10 text-orange-600',
            won: 'bg-emerald-500/10 text-emerald-600',
            lost: 'bg-red-500/10 text-red-600',
        }
        return statusColors[status] || 'bg-gray-500/10 text-gray-600'
    }

    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        const now = new Date()
        const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

        if (diffInHours < 1) return 'Just now'
        if (diffInHours < 24) return `${diffInHours}h ago`
        if (diffInHours < 48) return 'Yesterday'
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }

    if (profileLoading || loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading dashboard...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="container mx-auto py-6 px-4 space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-foreground">
                    Welcome back, {profile?.full_name || 'User'}!
                </h1>
                <p className="text-muted-foreground mt-1">
                    Here's what's happening with your business today.
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Total Leads */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalLeads}</div>
                        <p className="text-xs text-muted-foreground flex items-center mt-1">
                            <ArrowUpRight className="h-3 w-3 text-emerald-500 mr-1" />
                            <span className="text-emerald-500">{stats.leadsGrowth}%</span>
                            <span className="ml-1">from last month</span>
                        </p>
                    </CardContent>
                </Card>

                {/* New Leads */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">New Leads</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.newLeads}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Last 30 days
                        </p>
                    </CardContent>
                </Card>

                {/* Total Properties */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Properties</CardTitle>
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalProperties}</div>
                        <p className="text-xs text-muted-foreground flex items-center mt-1">
                            <ArrowUpRight className="h-3 w-3 text-emerald-500 mr-1" />
                            <span className="text-emerald-500">{stats.propertiesGrowth}%</span>
                            <span className="ml-1">from last month</span>
                        </p>
                    </CardContent>
                </Card>

                {/* Total Activities */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Activities</CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalActivities}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Total interactions
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Leads */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Recent Leads</CardTitle>
                            <CardDescription>Latest leads added to your CRM</CardDescription>
                        </div>
                        <Button asChild variant="outline">
                            <Link href="/dashboard/leads-center">View All</Link>
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {recentLeads.length === 0 ? (
                        <div className="text-center py-12">
                            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                            <h3 className="text-lg font-semibold mb-2">No leads yet</h3>
                            <p className="text-muted-foreground mb-4">
                                Start by adding your first lead
                            </p>
                            <Button asChild>
                                <Link href="/dashboard/add-lead">Add Lead</Link>
                            </Button>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Contact</TableHead>
                                    <TableHead>Source</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Added</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {recentLeads.map((lead) => (
                                    <TableRow key={lead.id}>
                                        <TableCell className="font-medium">{lead.name}</TableCell>
                                        <TableCell>
                                            <div className="flex flex-col gap-1">
                                                {lead.phone && (
                                                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                                        <Phone className="w-3 h-3" />
                                                        {lead.phone}
                                                    </div>
                                                )}
                                                {lead.email && (
                                                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                                        <Mail className="w-3 h-3" />
                                                        {lead.email}
                                                    </div>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-sm capitalize">
                                                {lead.source || 'N/A'}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={getStatusColor(lead.status)} variant="secondary">
                                                {lead.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground">
                                            {formatDate(lead.created_at)}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="hover:shadow-lg transition-shadow cursor-pointer" asChild>
                    <Link href="/dashboard/add-lead">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Users className="w-5 h-5 text-primary" />
                                Add New Lead
                            </CardTitle>
                            <CardDescription>
                                Quickly add a new lead to your pipeline
                            </CardDescription>
                        </CardHeader>
                    </Link>
                </Card>

                <Card className="hover:shadow-lg transition-shadow cursor-pointer" asChild>
                    <Link href="/dashboard/property-manager">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Building2 className="w-5 h-5 text-primary" />
                                Manage Properties
                            </CardTitle>
                            <CardDescription>
                                View and manage your property listings
                            </CardDescription>
                        </CardHeader>
                    </Link>
                </Card>

                <Card className="hover:shadow-lg transition-shadow cursor-pointer" asChild>
                    <Link href="/dashboard/leads-center">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Activity className="w-5 h-5 text-primary" />
                                View All Leads
                            </CardTitle>
                            <CardDescription>
                                Access your complete leads database
                            </CardDescription>
                        </CardHeader>
                    </Link>
                </Card>
            </div>
        </div>
    )
}
