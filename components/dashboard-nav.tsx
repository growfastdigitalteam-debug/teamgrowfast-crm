/**
 * Dashboard Navigation Component
 * Sidebar navigation with responsive mobile menu
 */

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
    LayoutDashboard,
    Users,
    Building2,
    UserPlus,
    Settings,
    LogOut,
    Menu,
    X,
    ChevronDown,
    FolderTree,
    UserCheck,
    HelpCircle,
    Activity,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useUserProfile } from '@/lib/supabase/hooks'
import { supabase } from '@/lib/supabase/client'
import { toast } from 'sonner'

const menuItems = [
    {
        id: 'dashboard',
        label: 'Dashboard',
        icon: LayoutDashboard,
        href: '/dashboard',
    },
    {
        id: 'categorys',
        label: 'Categorys', // Matches screenshot spelling
        icon: FolderTree,
        href: '/dashboard/categorys',
    },
    {
        id: 'add-lead',
        label: 'Add New Leads',
        icon: UserPlus,
        href: '/dashboard/add-lead',
    },
    {
        id: 'leads-center',
        label: 'Leads Center',
        icon: Users,
        href: '/dashboard/leads-center',
    },
    {
        id: 'new-leads',
        label: 'New Leads', // From screenshot
        icon: Activity,
        href: '/dashboard/new-leads',
    },
    {
        id: 'leads-assign',
        label: 'Leads Assign',
        icon: UserCheck,
        href: '/dashboard/leads-assign',
    },
    {
        id: 'property-manager',
        label: 'Property Manager',
        icon: Building2,
        href: '/dashboard/property-manager',
    },
    {
        id: 'user-list',
        label: 'User List', // Your Admin Panel
        icon: Users,
        href: '/dashboard/user-list',
    },
    {
        id: 'how-to-use',
        label: 'How to use',
        icon: HelpCircle,
        href: '/dashboard/how-to-use',
    },
]

export function DashboardNav() {
    const pathname = usePathname()
    const router = useRouter()
    const { profile, loading } = useUserProfile()
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

    const handleLogout = async () => {
        try {
            await supabase.auth.signOut()
            toast.success('Logged out successfully')
            router.push('/auth/login')
            router.refresh()
        } catch (error) {
            console.error('Logout error:', error)
            toast.error('Failed to logout')
        }
    }

    const getInitials = (name: string | null | undefined) => {
        if (!name) return 'U'
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2)
    }

    return (
        <>
            {/* Mobile Menu Overlay */}
            {mobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={cn(
                    'fixed lg:static inset-y-0 left-0 z-50 w-64 bg-sidebar border-r border-sidebar-border flex flex-col transition-transform duration-300',
                    mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
                )}
            >
                {/* Header */}
                <div className="h-16 flex items-center justify-between px-6 border-b border-sidebar-border">
                    <Link href="/dashboard" className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                            <Building2 className="w-5 h-5 text-primary-foreground" />
                        </div>
                        <span className="font-bold text-lg text-sidebar-foreground">
                            TeamGrowFast
                        </span>
                    </Link>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="lg:hidden"
                        onClick={() => setMobileMenuOpen(false)}
                    >
                        <X className="w-5 h-5" />
                    </Button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    {menuItems.map((item) => {
                        const isActive = pathname === item.href
                        const Icon = item.icon
                        return (
                            <Link
                                key={item.id}
                                href={item.href}
                                onClick={() => setMobileMenuOpen(false)}
                                className={cn(
                                    'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                                    isActive
                                        ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                                        : 'hover:bg-sidebar-accent text-sidebar-foreground'
                                )}
                            >
                                <Icon className="w-5 h-5" />
                                {item.label}
                            </Link>
                        )
                    })}
                </nav>

                {/* User Profile */}
                <div className="p-4 border-t border-sidebar-border">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                className="w-full justify-start gap-3 h-auto py-3 px-3"
                            >
                                <Avatar className="w-9 h-9">
                                    <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                                        {getInitials(profile?.full_name)}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 text-left overflow-hidden">
                                    <p className="text-sm font-medium text-sidebar-foreground truncate">
                                        {profile?.full_name || 'User'}
                                    </p>
                                    <p className="text-xs text-muted-foreground truncate">
                                        {profile?.email || ''}
                                    </p>
                                </div>
                                <ChevronDown className="w-4 h-4 text-muted-foreground" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuItem asChild>
                                <Link href="/dashboard/settings" className="cursor-pointer">
                                    <Settings className="w-4 h-4 mr-2" />
                                    Settings
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onClick={handleLogout}
                                className="text-destructive cursor-pointer"
                            >
                                <LogOut className="w-4 h-4 mr-2" />
                                Sign Out
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </aside>

            {/* Mobile Header */}
            <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-card border-b border-border flex items-center justify-between px-4 z-30">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setMobileMenuOpen(true)}
                >
                    <Menu className="w-5 h-5" />
                </Button>
                <Link href="/dashboard" className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-primary-foreground" />
                    </div>
                    <span className="font-bold text-lg">TeamGrowFast</span>
                </Link>
                <div className="w-10" /> {/* Spacer for centering */}
            </header>
        </>
    )
}
