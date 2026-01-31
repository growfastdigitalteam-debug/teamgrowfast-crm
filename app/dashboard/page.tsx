/**
 * Temporary Dashboard Page
 * TODO: Migrate components from old page.tsx to separate files
 */

'use client'

import { useAuthContext } from '@/lib/providers/auth-provider'
import { useLeads } from '@/lib/api/leads'
import { useCategories, useSources, useStatuses } from '@/lib/api/settings'
import { LoadingSpinner } from '@/components/loading-spinner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LogOut, Users, TrendingUp, FolderTree, Settings } from 'lucide-react'
import { useToast } from '@/lib/hooks/use-toast-notification'
import { useRouter } from 'next/navigation'
import { ROUTES } from '@/lib/constants'

export default function DashboardPage() {
    const { user, logout } = useAuthContext()
    const toast = useToast()
    const router = useRouter()

    const { data: leads, isLoading: leadsLoading } = useLeads(user?.tenantId)
    const { data: categories, isLoading: categoriesLoading } = useCategories(user?.tenantId)
    const { data: sources, isLoading: sourcesLoading } = useSources(user?.tenantId)
    const { data: statuses, isLoading: statusesLoading } = useStatuses(user?.tenantId)

    const handleLogout = async () => {
        const result = await logout()
        if (result.success) {
            toast.success('Logged out successfully')
            router.push(ROUTES.LOGIN)
        }
    }

    const isLoading = leadsLoading || categoriesLoading || sourcesLoading || statusesLoading

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="border-b border-border bg-card">
                <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">
                            Welcome, {user?.displayName || user?.email}!
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            {user?.tenantName && `${user.tenantName} • `}
                            {user?.role === 'admin' ? 'Super Admin' : 'User'}
                        </p>
                    </div>
                    <Button variant="outline" onClick={handleLogout} className="gap-2">
                        <LogOut className="w-4 h-4" />
                        Sign Out
                    </Button>
                </div>
            </header>

            {/* Main Content */}
            <main className="container mx-auto px-4 py-8">
                <div className="grid gap-6">
                    {/* Migration Notice */}
                    <Card className="border-yellow-500/50 bg-yellow-50 dark:bg-yellow-950/20">
                        <CardHeader>
                            <CardTitle className="text-yellow-800 dark:text-yellow-200">
                                🚧 Dashboard Under Construction
                            </CardTitle>
                            <CardDescription className="text-yellow-700 dark:text-yellow-300">
                                Your CRM has been successfully refactored! The old dashboard is being migrated to the new architecture.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="text-sm text-yellow-700 dark:text-yellow-300 space-y-2">
                            <p><strong>✅ What's Working:</strong></p>
                            <ul className="list-disc list-inside space-y-1 ml-2">
                                <li>Authentication (Supabase-only, secure)</li>
                                <li>React Query data fetching with caching</li>
                                <li>Toast notifications (no more alerts!)</li>
                                <li>Error boundaries</li>
                                <li>Loading states</li>
                                <li>Form validation with Zod</li>
                                <li>Export functionality (Excel/CSV)</li>
                            </ul>
                            <p className="mt-4"><strong>📋 TODO:</strong></p>
                            <ul className="list-disc list-inside space-y-1 ml-2">
                                <li>Migrate dashboard cards from old page.tsx</li>
                                <li>Create separate lead components</li>
                                <li>Build settings pages</li>
                                <li>Add pagination</li>
                                <li>Implement bulk operations UI</li>
                            </ul>
                            <p className="mt-4">
                                <strong>📖 Check the IMPLEMENTATION_GUIDE.md for detailed migration instructions!</strong>
                            </p>
                        </CardContent>
                    </Card>

                    {/* Quick Stats */}
                    {isLoading ? (
                        <LoadingSpinner size="lg" text="Loading dashboard data..." />
                    ) : (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
                                    <Users className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{leads?.length || 0}</div>
                                    <p className="text-xs text-muted-foreground">
                                        Across all categories
                                    </p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Categories</CardTitle>
                                    <FolderTree className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{categories?.length || 0}</div>
                                    <p className="text-xs text-muted-foreground">
                                        Lead categories configured
                                    </p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Sources</CardTitle>
                                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{sources?.length || 0}</div>
                                    <p className="text-xs text-muted-foreground">
                                        Lead sources active
                                    </p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Statuses</CardTitle>
                                    <Settings className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{statuses?.length || 0}</div>
                                    <p className="text-xs text-muted-foreground">
                                        Status types available
                                    </p>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {/* Data Preview */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Leads</CardTitle>
                            <CardDescription>Your latest leads from Supabase</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {isLoading ? (
                                <LoadingSpinner text="Loading leads..." />
                            ) : leads && leads.length > 0 ? (
                                <div className="space-y-2">
                                    {leads.slice(0, 5).map((lead) => (
                                        <div
                                            key={lead.id}
                                            className="flex items-center justify-between p-3 border border-border rounded-lg"
                                        >
                                            <div>
                                                <p className="font-medium">{lead.fullName}</p>
                                                <p className="text-sm text-muted-foreground">{lead.phone}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-medium">{lead.status}</p>
                                                <p className="text-xs text-muted-foreground">{lead.source}</p>
                                            </div>
                                        </div>
                                    ))}
                                    {leads.length > 5 && (
                                        <p className="text-sm text-muted-foreground text-center pt-2">
                                            + {leads.length - 5} more leads
                                        </p>
                                    )}
                                </div>
                            ) : (
                                <p className="text-muted-foreground text-center py-8">
                                    No leads found. Start by adding your first lead!
                                </p>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    )
}
