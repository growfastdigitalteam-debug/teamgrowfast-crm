"use client"

import React, { createContext, useContext, useState, type ReactNode, useEffect } from "react"
import { createBrowserClient } from '@supabase/ssr'

import {
  LayoutDashboard,
  FolderTree,
  UserPlus,
  Users,
  UserCheck,
  Building2,
  UserCog,
  HelpCircle,
  Search,
  ChevronDown,
  Plus,
  Facebook,
  Globe,
  Phone,
  History,
  MessageSquare,
  MessageSquareQuote,
  Building,
  Newspaper,
  Instagram,
  Mail,
  Menu,
  X,
  LogOut,
  Settings,
  Lock,
  Eye,
  EyeOff,
  Pencil,
  Trash2,
  LogIn,
  Copy,
  RefreshCw,
  KeyRound,
  UserX,
  Download,
  Upload,
  Database,
  FileSpreadsheet,
  TrendingUp,
  Percent,
  BarChart3,
  Calendar,
  Filter,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

// ============================================
// TYPES
// ============================================
import {
  type Company,
  type Lead,
  type Category,
  type Source,
  type Team,
  type ActivityType,
  type CRMUser as UserDB,
  useData
} from "@/lib/supabase-provider"

type UserRole = "admin" | "user" | "superadmin" | null

interface User {
  username: string
  role: UserRole
  displayName: string
  companyId?: number
  company?: string
}

type PageType =
  | "dashboard"
  | "categories"
  | "leads-center"
  | "leads-assign"
  | "user-list"
  | "settings"
  | "how-to-use"
  | "companies"


// ============================================

// ============================================
// MENU ITEMS
// ============================================
const menuItems = [
  { id: "dashboard" as const, label: "Dashboard", icon: LayoutDashboard },
  { id: "categories" as const, label: "Categories", icon: FolderTree },
  { id: "add-lead" as const, label: "Add New Leads", icon: UserPlus },
  { id: "leads-center" as const, label: "Leads Center", icon: Users },
  { id: "leads-assign" as const, label: "Assignments", icon: UserCheck },
  { id: "user-list" as const, label: "Team Management", icon: UserCog },
  { id: "how-to-use" as const, label: "Support Guide", icon: HelpCircle },
]

const adminMenuItems = [
  { id: "companies" as const, label: "Companies", icon: Building2 },
]

// ============================================
// MAIN APP
// ============================================
export default function CRMApp() {
  return (

    <SupabaseDataProvider>
      <CRMAppContent />
    </SupabaseDataProvider>

  )
}

function CRMAppContent() {
  const [user, setUser] = useState<User | null>(null)
  const { companies } = useData()
  const [isLoading, setIsLoading] = useState(true)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        // Determine role and tenant from profile
        const { data: profile } = await supabase
          .from('users')
          .select('role, full_name, tenant_id')
          .eq('id', session.user.id)
          .maybeSingle()

        if (profile) {
          // Fetch real tenant name
          const { data: tenant } = await supabase
            .from('tenants')
            .select('name')
            .eq('id', profile.tenant_id)
            .maybeSingle()

          setUser({
            username: session.user.email!,
            role: profile.role,
            displayName: profile.full_name || "User",
            company: tenant?.name || "GrowFast",
            companyId: 1 // Stable internal ID
          })
        } else if (session.user.email === "admin@admin.com") {
          // Fallback for Admin
          setUser({ username: "admin", role: "superadmin", displayName: "Super Admin" })
        }
      }
      setIsLoading(false)
    }
    checkSession()
  }, [])

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>
  }

  if (!user) {
    return <LoginPage onLogin={handleLogin} companies={companies} />
  }

  if (user.role === "superadmin" || user.username === "admin@admin.com") {
    return <SuperAdminDashboard user={user} onLogout={handleLogout} />
  }

  return <CRMUserDashboard user={user} onLogout={handleLogout} />
}

// ============================================
// LOGIN PAGE
// ============================================
function LoginPage({ onLogin, companies }: { onLogin: (user: User) => void; companies: Company[] }) {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )

      const { data, error } = await supabase.auth.signInWithPassword({
        email: username,
        password: password
      })

      if (error) {
        throw error
      }

      if (data.user) {
        // Fetch profile
        const { data: profile } = await supabase
          .from('users')
          .select('role, full_name, tenant_id')
          .eq('id', data.user.id)
          .maybeSingle()

        // Fetch tenant name
        let tenantName = "GrowFast"
        if (profile?.tenant_id) {
          const { data: tenant } = await supabase
            .from('tenants')
            .select('name')
            .eq('id', profile.tenant_id)
            .maybeSingle()
          if (tenant) tenantName = tenant.name
        }

        onLogin({
          username: data.user.email!,
          role: (profile?.role as any) || "user",
          displayName: profile?.full_name || "User",
          company: tenantName,
          companyId: 1
        })
      }
    } catch (err: any) {
      setError(err.message || "Login failed")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none" />

      <div className="w-full max-w-lg z-10">
        <div className="text-center mb-10 animate-in fade-in slide-in-from-top-4 duration-1000">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl">
              <img src="/logo-icon.png" alt="Logo Icon" className="w-24 h-24 object-contain" />
            </div>
          </div>
          <h1 className="text-5xl font-black tracking-tight flex items-center justify-center gap-2">
            <span className="text-white">GrowFast</span>
            <span className="text-[#00AEEF]">Digital</span>
          </h1>
          <p className="text-slate-400 mt-3 text-lg">Next-Gen CRM Dashboard</p>
        </div>

        <Card className="border-white/10 bg-white/5 backdrop-blur-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-700">
          <div className="h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-cyan-500" />
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-2xl text-white font-bold">Sign In</CardTitle>
            <CardDescription className="text-slate-400">Enter your credentials to access your workspace</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-slate-200">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <Input
                    id="username"
                    placeholder="name@company.com"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="h-12 pl-10 bg-white/5 border-white/10 text-white placeholder:text-slate-600 focus:ring-blue-500/50"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" title="Password" className="text-slate-200">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-12 pl-10 pr-10 bg-white/5 border-white/10 text-white placeholder:text-slate-600 focus:ring-blue-500/50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-4 rounded-xl text-center animate-in shake-in duration-500">
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full h-12 text-lg font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/20 transition-all hover:scale-[1.02] active:scale-[0.98]" disabled={isLoading}>
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Authenticating...
                  </div>
                ) : (
                  "Sign In to Dashboard"
                )}
              </Button>
            </form>
          </CardContent>
          <div className="p-6 bg-white/5 border-t border-white/5 flex items-center justify-between text-xs text-slate-500">
            <span>&copy; 2026 GrowFast Digital</span>
            <div className="flex gap-4">
              <a href="#" className="hover:text-slate-300">Privacy Policy</a>
              <a href="#" className="hover:text-slate-300">Terms of Service</a>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

// ============================================
// SUPER ADMIN DASHBOARD
// ============================================
function SuperAdminDashboard({ user, onLogout }: { user: User; onLogout: () => void }) {
  const [activePage, setActivePage] = useState<PageType>("companies")
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [addCompanyOpen, setAddCompanyOpen] = useState(false)

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-40 lg:hidden transition-all duration-500" onClick={() => setMobileMenuOpen(false)} />
      )}

      <aside className={cn(
        "fixed lg:static inset-y-0 left-0 z-50 w-80 bg-slate-900/50 backdrop-blur-3xl border-r border-slate-800/50 flex flex-col transition-all duration-500 ease-in-out shadow-2xl",
        mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className="h-24 flex items-center px-10 gap-5 border-b border-slate-800/50 relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="p-3 bg-blue-600/10 rounded-2xl border border-blue-500/20 shadow-inner">
            <img src="/logo-icon.png" alt="Logo Icon" className="w-10 h-10 object-contain drop-shadow-2xl" />
          </div>
          <div className="flex flex-col">
            <div className="text-xl font-black tracking-tight leading-none">
              <span className="text-white">Elite</span>
              <span className="text-blue-500">System</span>
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mt-1">Super Gateway</span>
          </div>
          <Button variant="ghost" size="icon" className="ml-auto lg:hidden text-slate-400 hover:text-white" onClick={() => setMobileMenuOpen(false)}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <nav className="flex-1 p-8 space-y-3 overflow-y-auto scrollbar-hide">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-6 px-4 opacity-50 underline underline-offset-8">Global Control</p>
          {adminMenuItems.map((item) => {
            const isActive = activePage === item.id
            const Icon = item.icon
            return (
              <button
                key={item.id}
                onClick={() => { setActivePage(item.id); setMobileMenuOpen(false) }}
                className={cn(
                  "w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-sm font-bold transition-all duration-300 relative group",
                  isActive
                    ? "bg-blue-600 text-white shadow-xl shadow-blue-600/20"
                    : "hover:bg-slate-800/50 text-slate-400 hover:text-white"
                )}
              >
                <Icon className={cn("w-5 h-5 transition-transform duration-300", isActive ? "scale-110" : "group-hover:translate-x-1")} />
                {item.label}
                {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
              </button>
            )
          })}

          <div className="pt-6 mt-6 border-t border-slate-800/50">
            <button
              onClick={() => { setActivePage("settings"); setMobileMenuOpen(false) }}
              className={cn(
                "w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-sm font-bold transition-all duration-300 group",
                activePage === "settings"
                  ? "bg-slate-800 text-white shadow-lg"
                  : "hover:bg-slate-800/50 text-slate-400 hover:text-white"
              )}
            >
              <Settings className="w-5 h-5 transition-transform group-hover:rotate-45" />
              Intelligence Settings
            </button>
          </div>
        </nav>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 bg-slate-950/20 backdrop-blur-sm relative">
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/5 via-transparent to-indigo-600/5 pointer-events-none" />

        <header className="h-24 bg-slate-900/40 backdrop-blur-3xl border-b border-slate-800/50 flex items-center justify-between px-10 shrink-0 relative z-20">
          <div className="flex items-center gap-6">
            <Button variant="ghost" size="icon" className="lg:hidden text-slate-400" onClick={() => setMobileMenuOpen(true)}>
              <Menu className="w-6 h-6" />
            </Button>
            <div>
              <h1 className="text-2xl font-black text-white tracking-tight uppercase">System Command</h1>
              <p className="text-[10px] font-black tracking-[0.3em] text-slate-500 uppercase mt-0.5">Global Administrative Gateway</p>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-14 px-5 rounded-2xl bg-slate-800/40 border border-slate-700/50 flex items-center gap-4 hover:bg-slate-800/60 transition-all group">
                <Avatar className="w-9 h-9 border-2 border-slate-700/50 group-hover:border-blue-500/50 transition-colors">
                  <AvatarFallback className="bg-blue-600 text-white text-xs font-black">SA</AvatarFallback>
                </Avatar>
                <div className="text-left hidden sm:block">
                  <p className="text-xs font-black text-white leading-none uppercase tracking-wide">{user.displayName}</p>
                  <p className="text-[9px] font-black text-slate-500 uppercase mt-1 tracking-tighter">Chief Administrator</p>
                </div>
                <ChevronDown className="w-4 h-4 text-slate-500 group-hover:text-blue-500 transition-colors" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 bg-slate-900/95 backdrop-blur-2xl border-slate-800 rounded-2xl shadow-2xl p-2">
              <DropdownMenuItem onClick={() => setActivePage("settings")} className="rounded-xl px-4 py-3 text-sm font-bold text-slate-300 focus:bg-blue-600 focus:text-white transition-all">
                <Settings className="w-4 h-4 mr-3" />
                System Protocols
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-slate-800 my-2" />
              <DropdownMenuItem onClick={onLogout} className="rounded-xl px-4 py-3 text-sm font-bold text-rose-500 focus:bg-rose-600 focus:text-white transition-all">
                <LogOut className="w-4 h-4 mr-3" />
                Terminate Session
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        <main className="flex-1 p-10 lg:p-12 overflow-y-auto scrollbar-hide relative z-10">
          <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-6 duration-700">
            {activePage === "companies" && (
              <CompaniesView addCompanyOpen={addCompanyOpen} setAddCompanyOpen={setAddCompanyOpen} />
            )}
            {activePage === "settings" && <SettingsView />}
          </div>
        </main>
      </div>
    </div>
  )
}

// ============================================
// COMPANIES VIEW (SUPER ADMIN)
// ============================================
function CompaniesView({
  addCompanyOpen,
  setAddCompanyOpen,
}: {
  addCompanyOpen: boolean
  setAddCompanyOpen: (open: boolean) => void
}) {
  const { companies, setCompanies } = useData()
  const [newCompanyName, setNewCompanyName] = useState("")
  const [newCompanyEmail, setNewCompanyEmail] = useState("")
  const [newCompanyPassword, setNewCompanyPassword] = useState("")
  const [viewDetailsCompany, setViewDetailsCompany] = useState<Company | null>(null)
  const [editCompany, setEditCompany] = useState<Company | null>(null)

  const generateSecurePassword = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%"
    let password = ""
    for (let i = 0; i < 16; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setNewCompanyPassword(password)
  }

  const handleAddCompany = async () => {
    if (newCompanyName && newCompanyEmail && newCompanyPassword) {
      try {
        const response = await fetch('/api/create-company', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: newCompanyName,
            email: newCompanyEmail,
            password: newCompanyPassword
          })
        })

        const result = await response.json()

        if (response.ok) {
          alert(`CRITICAL: SECURE TRANSMISSION\n\nEntity Provisioned: ${newCompanyName}\nAccess Email: ${newCompanyEmail}\nAccess Key: ${newCompanyPassword}\n\nEncryption protocols verified.`)

          setNewCompanyName("")
          setNewCompanyEmail("")
          setNewCompanyPassword("")
          setAddCompanyOpen(false)
        } else {
          alert("CORE EXCEPTION: " + result.error)
        }
      } catch (err: any) {
        alert("TRANSMISSION FAILURE: " + err.message)
      }
    }
  }

  const handleDeleteCompany = (id: number) => {
    const confirmation = window.prompt("SECURITY OVERRIDE: Type 'purge' to incinerate this company data.")
    if (confirmation === "purge") {
      setCompanies(companies.filter((c) => c.id !== id))
    } else {
      alert("Override aborted. Safeguards maintained.")
    }
  }

  const handleToggleStatus = (id: number) => {
    setCompanies(companies.map((c) => c.id === id ? { ...c, status: c.status === "Active" ? "Blocked" : "Active" } : c))
  }

  const handleEditSave = () => {
    if (editCompany) {
      setCompanies(companies.map(c => c.id === editCompany.id ? editCompany : c))
      setEditCompany(null)
    }
  }

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div>
          <h2 className="text-4xl font-black text-white tracking-tight uppercase">Corporate Entities</h2>
          <p className="text-slate-500 font-medium mt-2">Oversee and manage high-tier organizational gateways</p>
        </div>
        <Dialog open={addCompanyOpen} onOpenChange={setAddCompanyOpen}>
          <DialogTrigger asChild>
            <Button className="h-16 px-10 rounded-2xl bg-blue-600 text-white font-black shadow-2xl shadow-blue-600/30 hover:scale-[1.02] active:scale-95 transition-all">
              <Plus className="w-6 h-6 mr-3" />
              Provision New Entity
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md bg-slate-900/90 backdrop-blur-3xl border-slate-800 rounded-[2.5rem] p-10 shadow-[0_0_100px_rgba(37,99,235,0.1)]">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black text-white tracking-tight">Provision Intel Entity</DialogTitle>
            </DialogHeader>
            <div className="space-y-6 py-8">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Entity Denomination</Label>
                <Input value={newCompanyName} onChange={(e) => setNewCompanyName(e.target.value)} placeholder="Nexus Corporation" className="h-14 rounded-2xl bg-slate-950/50 border-slate-800 focus:border-blue-500/50 transition-all font-bold text-white" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Master Access Email</Label>
                <Input value={newCompanyEmail} onChange={(e) => setNewCompanyEmail(e.target.value)} placeholder="admin@nexus.com" className="h-14 rounded-2xl bg-slate-950/50 border-slate-800 focus:border-blue-500/50 transition-all font-bold text-white" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Initial Access Key</Label>
                <div className="flex gap-2">
                  <Input value={newCompanyPassword} onChange={(e) => setNewCompanyPassword(e.target.value)} placeholder="••••••••••••" type="text" className="h-14 rounded-2xl bg-slate-950/50 border-slate-800 focus:border-blue-500/50 transition-all font-mono font-bold text-blue-400" />
                  <Button variant="ghost" size="icon" onClick={generateSecurePassword} className="h-14 w-14 rounded-2xl bg-slate-800/50 hover:bg-slate-800 text-blue-500 transition-all">
                    <History className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </div>
            <DialogFooter className="gap-3">
              <Button variant="ghost" onClick={() => setAddCompanyOpen(false)} className="h-14 px-8 rounded-xl font-black text-slate-400 hover:text-white transition-all uppercase tracking-widest text-[10px]">Abort</Button>
              <Button onClick={handleAddCompany} disabled={!newCompanyName || !newCompanyEmail || !newCompanyPassword} className="h-14 px-10 rounded-xl bg-white text-slate-950 font-black shadow-xl hover:bg-blue-50 transition-all uppercase tracking-widest text-[10px]">Verify & Release</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {companies.map((company) => (
          <div key={company.id} className="group bg-slate-900/40 backdrop-blur-3xl rounded-[2.5rem] p-10 border border-slate-800/50 shadow-xl hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] hover:border-blue-500/30 transition-all duration-500 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 blur-[80px] -mr-16 -mt-16 group-hover:bg-blue-600/10 transition-all duration-700" />

            <div className="flex items-start justify-between mb-8 relative z-10">
              <div className="w-20 h-20 rounded-3xl bg-slate-950 flex items-center justify-center border border-slate-800 shadow-inner group-hover:scale-110 transition-transform duration-500">
                <Building2 className="w-10 h-10 text-blue-500" />
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="icon" onClick={() => setEditCompany(company)} className="w-10 h-10 rounded-xl bg-slate-800/50 text-slate-500 hover:text-blue-500 transition-all">
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleDeleteCompany(company.id)} className="w-10 h-10 rounded-xl bg-slate-800/50 text-slate-500 hover:text-rose-500 transition-all">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2 relative z-10">
              <h3 className="text-2xl font-black text-white tracking-tight uppercase group-hover:text-blue-400 transition-colors">{company.name}</h3>
              <p className="text-sm font-semibold text-slate-500 tracking-wide">{company.adminEmail}</p>
            </div>

            <div className="mt-8 flex items-center justify-between border-t border-slate-800/50 pt-8 relative z-10">
              <div className="flex flex-col">
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">Authorization Status</span>
                <button
                  onClick={() => handleToggleStatus(company.id)}
                  className={cn(
                    "px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all w-fit",
                    company.status === "Active"
                      ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 hover:bg-emerald-500 hover:text-white"
                      : "bg-rose-500/10 text-rose-500 border border-rose-500/20 hover:bg-rose-500 hover:text-white"
                  )}
                >
                  {company.status}
                </button>
              </div>

              <Button
                variant="ghost"
                onClick={() => setViewDetailsCompany(company)}
                className="h-10 px-5 rounded-xl bg-blue-600/5 text-blue-500 hover:bg-blue-600 hover:text-white font-black text-[9px] uppercase tracking-[0.2em] transition-all"
              >
                Inspect Gateway
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Company Modal */}
      <Dialog open={!!editCompany} onOpenChange={(open) => !open && setEditCompany(null)}>
        <DialogContent className="max-w-md bg-slate-900/90 backdrop-blur-3xl border-slate-800 rounded-[2.5rem] p-10 shadow-2xl">
          <DialogHeader><DialogTitle className="text-2xl font-black text-white tracking-tight uppercase">Update Entity Profile</DialogTitle></DialogHeader>
          {editCompany && (
            <div className="space-y-6 py-8">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Entity Denomination</Label>
                <Input value={editCompany.name} onChange={(e) => setEditCompany({ ...editCompany, name: e.target.value })} className="h-14 rounded-2xl bg-slate-950/50 border-slate-800 font-bold text-white" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Master Access Email</Label>
                <Input value={editCompany.adminEmail} onChange={(e) => setEditCompany({ ...editCompany, adminEmail: e.target.value })} className="h-14 rounded-2xl bg-slate-950/50 border-slate-800 font-bold text-white" />
              </div>
            </div>
          )}
          <DialogFooter className="gap-3">
            <Button variant="ghost" onClick={() => setEditCompany(null)} className="h-14 px-8 rounded-xl font-black text-slate-400 uppercase tracking-widest text-[10px]">Abort</Button>
            <Button onClick={handleEditSave} className="h-14 px-10 rounded-xl bg-white text-slate-950 font-black uppercase tracking-widest text-[10px]">Synchronize</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}



// ============================================
// CRM USER DASHBOARD
// ============================================
function CRMUserDashboard({ user, onLogout }: { user: User; onLogout: () => void }) {
  const [activePage, setActivePage] = useState<PageType>("dashboard")
  const [addLeadOpen, setAddLeadOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [leadStatusFilter, setLeadStatusFilter] = useState("")

  const handleMenuClick = (id: string | "dashboard") => {
    setActivePage(id as PageType)
    setMobileMenuOpen(false)
    if (id !== "leads-center") setLeadStatusFilter("")
  }

  const handleStatusClick = (status: string) => {
    setLeadStatusFilter(status)
    setActivePage("leads-center")
  }

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-[#020617] overflow-hidden text-slate-900 dark:text-slate-100">
      {mobileMenuOpen && <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden transition-all duration-300" onClick={() => setMobileMenuOpen(false)} />}

      <aside className={cn(
        "fixed lg:static inset-y-0 left-0 z-50 w-72 bg-white/70 dark:bg-slate-900/80 backdrop-blur-xl border-r border-slate-200 dark:border-slate-800/50 flex flex-col transition-all duration-300 ease-in-out shadow-2xl lg:shadow-none",
        mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className="h-24 flex items-center px-8 gap-4 border-b border-slate-200 dark:border-slate-800/50 relative">
          <div className="p-2 bg-blue-600/10 dark:bg-blue-500/10 rounded-2xl border border-blue-500/20">
            <img src="/logo-icon.png" alt="Logo Icon" className="w-10 h-10 object-contain drop-shadow-md" />
          </div>
          <div className="flex flex-col">
            <div className="text-xl font-black tracking-tight leading-none group cursor-default">
              <span className="text-slate-900 dark:text-white">GrowFast</span>
              <span className="text-[#00AEEF] block mt-0.5 text-sm uppercase tracking-widest font-bold">Digital</span>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="ml-auto lg:hidden rounded-full hover:bg-slate-100 dark:hover:bg-slate-800" onClick={() => setMobileMenuOpen(false)}>
            <X className="w-5 h-5" />
          </Button>
          <div className="absolute bottom-0 left-8 right-8 h-[1px] bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />
        </div>

        <nav className="flex-1 p-6 space-y-2 overflow-y-auto scrollbar-hide">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 mb-4 px-4 opacity-70">Main Menu</p>
          {menuItems.map((item) => {
            const isActive = activePage === item.id
            const Icon = item.icon

            if (item.id === "add-lead") {
              return (
                <button
                  key={item.id}
                  onClick={() => setAddLeadOpen(true)}
                  className="w-full flex items-center gap-3 px-4 py-4 rounded-2xl text-sm font-semibold transition-all duration-200 bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 active:scale-[0.98] mt-6"
                >
                  <Plus className="w-5 h-5" />
                  {item.label}
                </button>
              )
            }

            return (
              <button
                key={item.id}
                onClick={() => handleMenuClick(item.id)}
                className={cn(
                  "w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-sm font-medium transition-all duration-200 group relative",
                  isActive
                    ? "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 shadow-sm"
                    : "hover:bg-slate-100 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                )}
              >
                <div className={cn(
                  "w-1.5 h-1.5 rounded-full absolute left-0 transition-all duration-300 opacity-0",
                  isActive ? "opacity-100 translate-x-1.5 bg-blue-600" : ""
                )} />
                <Icon className={cn("w-5 h-5 transition-transform duration-300", isActive ? "scale-110" : "group-hover:translate-x-0.5")} />
                {item.label}
                {isActive && <div className="ml-auto w-1 h-5 bg-blue-600 rounded-full" />}
              </button>
            )
          })}
        </nav>

        {/* Persistent Conversion Widget in Sidebar */}
        <div className="p-6">
          <SidebarConversionWidget companyId={user.companyId || 1} />
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 relative">
        <header className="h-20 bg-white/50 dark:bg-[#020617]/50 backdrop-blur-md border-b border-slate-200 dark:border-slate-800/50 flex items-center justify-between px-6 lg:px-10 shrink-0 z-30">
          <div className="flex items-center gap-6">
            <Button variant="ghost" size="icon" className="lg:hidden rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800" onClick={() => setMobileMenuOpen(true)}>
              <Menu className="w-6 h-6" />
            </Button>
            <div className="hidden sm:block">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Dashboard Overview
                <span className="hidden lg:inline text-sm font-normal text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-800">
                  {user.company || "GrowFast Digital"}
                </span>
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative hidden md:block group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
              <Input
                placeholder="Find leads, agents..."
                className="pl-12 w-64 lg:w-80 bg-slate-100/50 dark:bg-slate-800/50 border-transparent hover:bg-slate-100 dark:hover:bg-slate-800 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-500/20 transition-all rounded-2xl h-11"
              />
            </div>

            <div className="h-8 w-[1px] bg-slate-200 dark:bg-slate-800 mx-2 hidden sm:block" />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="flex items-center gap-3 pl-2 pr-1 py-1 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800/50 cursor-pointer transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-800 group">
                  <div className="text-right hidden xl:block">
                    <p className="text-sm font-bold leading-tight group-hover:text-blue-600 transition-colors">{user.displayName}</p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{user.role || "Team Member"}</p>
                  </div>
                  <Avatar className="w-10 h-10 border-2 border-white dark:border-slate-900 shadow-md ring-2 ring-blue-500/10">
                    <AvatarFallback className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white text-sm font-bold">
                      {user.displayName.split(" ").map(n => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 p-2 rounded-2xl border-slate-200 dark:border-slate-800 shadow-xl">
                <div className="px-2 py-3 mb-2 bg-slate-50 dark:bg-slate-800/50 rounded-xl lg:hidden">
                  <p className="text-sm font-bold">{user.displayName}</p>
                  <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">{user.role}</p>
                </div>
                <DropdownMenuItem onClick={() => setActivePage("settings")} className="rounded-xl py-2.5 focus:bg-blue-50 dark:focus:bg-blue-500/10 focus:text-blue-600">
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onLogout} className="text-red-500 rounded-xl py-2.5 focus:bg-red-50 dark:focus:bg-red-500/10 focus:text-red-600">
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="flex-1 p-6 lg:p-10 overflow-y-auto bg-transparent relative">
          <div className="absolute top-0 right-0 w-[30%] h-[30%] bg-blue-500/5 blur-[100px] pointer-events-none -z-10" />
          <div className="absolute bottom-0 left-0 w-[30%] h-[30%] bg-indigo-500/5 blur-[100px] pointer-events-none -z-10" />

          <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
            {activePage === "dashboard" && <DashboardView companyId={user.companyId || 1} onStatusClick={handleStatusClick} />}
            {activePage === "categories" && <CategoriesView companyId={user.companyId || 1} />}
            {activePage === "settings" && <SettingsView companyId={user.companyId || 1} />}
            {activePage === "leads-center" && <LeadsCenterView companyId={user.companyId || 1} userName={user.displayName} initialStatus={leadStatusFilter} />}
            {activePage === "leads-assign" && <LeadsAssignView companyId={user.companyId || 1} />}
            {activePage === "user-list" && <UserListView companyId={user.companyId || 1} />}
            {activePage === "how-to-use" && <HowToUseView />}
          </div>
        </main>
      </div>

      {/* Add Lead Modal */}
      <AddLeadModal open={addLeadOpen} onOpenChange={setAddLeadOpen} companyId={user.companyId || 1} userName={user.displayName} />
    </div>
  )
}

// ============================================
// DASHBOARD VIEW (DYNAMIC COUNTS)
// ============================================
function DashboardView({ companyId, onStatusClick }: { companyId: number; onStatusClick?: (status: string) => void }) {
  const { leads, sources, activityTypes, categories, users } = useData()
  const [dateFilter, setDateFilter] = useState("all")
  const [sourceFilter, setSourceFilter] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [userFilter, setUserFilter] = useState("all")

  const isWithinDateRange = (createdAt: string, range: string) => {
    if (range === "all") return true
    const todayStr = new Date().toISOString().split("T")[0]
    if (range === "today") return createdAt === todayStr
    const date = new Date(createdAt)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    if (range === "7d") return diffDays <= 7
    if (range === "30d") return diffDays <= 30
    return true
  }

  const companyLeads = leads.filter(l => {
    const isCompany = l.companyId === companyId
    const isSourceMatch = sourceFilter === "all" || l.source === sourceFilter
    const isCategoryMatch = categoryFilter === "all" || l.category === categoryFilter
    const isUserMatch = userFilter === "all" || l.assignedAgent === userFilter
    const isDateMatch = isWithinDateRange(l.createdAt, dateFilter)
    return isCompany && isSourceMatch && isCategoryMatch && isUserMatch && isDateMatch
  })

  const companySources = sources.filter(s => s.companyId === companyId)
  const companyActivityTypes = activityTypes.filter(at => at.companyId === companyId)
  const companyUsers = users.filter(u => u.companyId === companyId)

  const activityStats = [
    ...companyActivityTypes.map(at => ({
      title: at.name,
      count: companyLeads.filter(l => l.status === at.name).length,
      color: at.color,
    })),
    { title: "Total Portfolio", count: companyLeads.length, color: "#1e293b" },
  ]

  const getTextColor = (hexColor: string) => {
    const hex = hexColor.replace("#", "")
    const r = parseInt(hex.substring(0, 2), 16)
    const g = parseInt(hex.substring(2, 4), 16)
    const b = parseInt(hex.substring(4, 6), 16)
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
    return luminance > 0.5 ? "text-slate-900" : "text-white"
  }

  const sourceIcons: Record<string, React.ElementType> = {
    "Facebook": Facebook, "Google Ads": Globe, "Instagram": Instagram, "Website": Globe,
    "Cold Calling": Phone, "WhatsApp": MessageSquare, "Walk-in": Building, "Referral": UserX, "Newspaper": Newspaper,
  }

  const leadSources = companySources.map(s => ({
    name: s.name,
    icon: sourceIcons[s.name] || Globe,
    count: companyLeads.filter(l => l.source === s.name).length,
  }))

  const categoryStats = categories.filter(c => c.companyId === companyId).map(c => ({
    title: c.name,
    count: companyLeads.filter(l => l.category === c.name).length,
    color: c.color,
  }))

  return (
    <div className="space-y-12 pb-20">
      <div className="flex flex-wrap items-center gap-4 bg-white/40 dark:bg-slate-900/40 backdrop-blur-2xl p-6 rounded-[2.5rem] border border-white/20 dark:border-slate-800 shadow-2xl">
        <div className="flex items-center gap-3 mr-6 px-2">
          <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30">
            <Filter className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Intelligence</p>
            <p className="text-xs font-bold text-slate-900 dark:text-white">Refinement Engine</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-4">
          <Select value={dateFilter} onValueChange={setDateFilter}>
            <SelectTrigger className="w-48 h-12 bg-white/50 dark:bg-slate-800/50 border-transparent rounded-2xl text-xs font-bold shadow-sm focus:ring-2 focus:ring-blue-500/20 px-6">
              <Calendar className="w-4 h-4 mr-3 text-blue-500" />
              <SelectValue placeholder="Chronology" />
            </SelectTrigger>
            <SelectContent className="rounded-2xl border-slate-200 dark:border-slate-800">
              <SelectItem value="all" className="rounded-xl">All Echoes</SelectItem>
              <SelectItem value="today" className="rounded-xl">Current Cycle</SelectItem>
              <SelectItem value="7d" className="rounded-xl">7 Day Window</SelectItem>
              <SelectItem value="30d" className="rounded-xl">30 Day Window</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sourceFilter} onValueChange={setSourceFilter}>
            <SelectTrigger className="w-48 h-12 bg-white/50 dark:bg-slate-800/50 border-transparent rounded-2xl text-xs font-bold shadow-sm px-6">
              <SelectValue placeholder="Origin Source" />
            </SelectTrigger>
            <SelectContent className="rounded-2xl border-slate-200 dark:border-slate-800 font-bold">
              <SelectItem value="all" className="rounded-xl">Global Sources</SelectItem>
              {companySources.map(s => <SelectItem key={s.id} value={s.name} className="rounded-xl">{s.name}</SelectItem>)}
            </SelectContent>
          </Select>

          {(dateFilter !== "all" || sourceFilter !== "all" || categoryFilter !== "all" || userFilter !== "all") && (
            <Button
              variant="ghost"
              onClick={() => { setDateFilter("all"); setSourceFilter("all"); setCategoryFilter("all"); setUserFilter("all"); }}
              className="h-12 px-8 text-rose-500 hover:text-white hover:bg-rose-500 font-black text-[10px] uppercase tracking-widest rounded-2xl transition-all"
            >
              Reset Filters
            </Button>
          )}
        </div>
      </div>

      <section>
        <div className="flex items-center justify-between mb-8 px-2">
          <div>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase">Activity Matrix</h2>
            <p className="text-slate-500 font-medium text-sm mt-1">Real-time synchronized pipeline intelligence</p>
          </div>
          <Badge className="rounded-xl px-4 py-2 bg-blue-600/10 text-blue-600 border-none font-black uppercase tracking-widest text-[10px]">Active Node</Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {activityStats.map((stat, idx) => (
            <div
              key={stat.title}
              onClick={() => onStatusClick && onStatusClick(stat.title === "Total Portfolio" ? "" : stat.title)}
              className="group relative rounded-[2.5rem] p-10 transition-all duration-500 hover:-translate-y-2 active:scale-95 cursor-pointer overflow-hidden shadow-2xl"
              style={{ backgroundColor: stat.color }}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-[60px] -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />

              <div className="relative z-10 flex flex-col h-full">
                <div className="flex items-center justify-between mb-6">
                  <p className={cn("text-[10px] font-black uppercase tracking-[0.3em] opacity-60", getTextColor(stat.color))}>{stat.title}</p>
                  <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center bg-white/10 backdrop-blur-md", getTextColor(stat.color))}>
                    <TrendingUp className="w-4 h-4" />
                  </div>
                </div>
                <p className={cn("text-6xl font-black tracking-tighter", getTextColor(stat.color))}>{stat.count.toLocaleString()}</p>
                <div className={cn("mt-auto pt-8 flex items-center gap-3 text-[10px] font-black uppercase tracking-widest opacity-60", getTextColor(stat.color))}>
                  <div className="w-full h-1 bg-current opacity-20 rounded-full" />
                  <span>Inspect</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
        <section className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-2xl rounded-[3rem] p-10 border border-white/20 dark:border-slate-800 shadow-2xl">
          <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-8 tracking-tight uppercase flex items-center gap-4">
            <div className="w-2 h-8 bg-blue-600 rounded-full" />
            Lead Classifications
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {categoryStats.map((stat) => (
              <div key={stat.title} className="group bg-white dark:bg-slate-950 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 hover:border-blue-500/30 transition-all shadow-sm">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 group-hover:bg-blue-600 transition-colors">
                    <div className="w-4 h-4 rounded-full group-hover:bg-white" style={{ backgroundColor: stat.color }} />
                  </div>
                  <p className="text-sm font-black text-slate-500 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-all uppercase tracking-widest leading-none">{stat.title}</p>
                </div>
                <p className="text-4xl font-black text-slate-900 dark:text-white font-mono">{stat.count.toLocaleString()}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-2xl rounded-[3rem] p-10 border border-white/20 dark:border-slate-800 shadow-2xl flex flex-col">
          <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-8 tracking-tight uppercase flex items-center gap-4">
            <div className="w-2 h-8 bg-cyan-500 rounded-full" />
            Lead Generation Network
          </h2>
          <div className="space-y-6 flex-1">
            {leadSources.slice(0, 5).map((source) => {
              const Icon = source.icon
              const totalLeads = companyLeads.length
              const percentage = totalLeads > 0 ? (source.count / totalLeads) * 100 : 0
              return (
                <div key={source.name} className="space-y-3 group">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-slate-900 text-white shadow-xl group-hover:rotate-6 transition-transform">
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-sm font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest">{source.name}</span>
                    </div>
                    <div className="text-right flex items-baseline gap-2">
                      <span className="text-lg font-black font-mono text-slate-900 dark:text-white">{source.count}</span>
                      <span className="text-[10px] text-slate-400 font-bold uppercase">{percentage.toFixed(0)}%</span>
                    </div>
                  </div>
                  <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-[2px]">
                    <div className="h-full bg-blue-600 rounded-full shadow-lg transition-all duration-1000" style={{ width: `${percentage}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      </div>
    </div>
  )
}

function SidebarConversionWidget({ companyId }: { companyId: number }) {
  const { leads } = useData()
  const companyLeads = leads.filter(l => l.companyId === companyId)

  const bookedCount = companyLeads.filter(l => l.status === "Booked").length
  const totalLeads = companyLeads.length
  const conversionValue = totalLeads > 0 ? (bookedCount / totalLeads) * 100 : 0
  const conversionRate = conversionValue.toFixed(2)

  const getConversionColor = (val: number) => {
    if (val === 0) return "text-muted-foreground"
    if (val < 5) return "text-rose-500"
    if (val < 15) return "text-amber-500"
    return "text-emerald-500"
  }

  const getConversionBg = (val: number) => {
    if (val === 0) return "bg-sidebar-accent/30"
    if (val < 5) return "bg-rose-500/5 border-rose-500/10"
    if (val < 15) return "bg-amber-500/5 border-amber-500/10"
    return "bg-emerald-500/5 border-emerald-500/10"
  }

  return (
    <div className="px-2 mt-auto shrink-0">
      <div className={cn("rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-lg transition-all hover:bg-white dark:hover:bg-slate-800/80 group flex flex-col gap-4 relative overflow-hidden bg-white/40 dark:bg-slate-900/40 backdrop-blur-md", getConversionBg(conversionValue))}>
        {/* Dynamic Sparkle/Light Effect */}
        <div className={cn("absolute -top-10 -right-10 w-24 h-24 blur-3xl opacity-20 bg-current rounded-full", getConversionColor(conversionValue))} />

        <div className="flex items-center justify-between relative z-10">
          <div className={cn("p-2 rounded-xl bg-white dark:bg-slate-900 border shadow-sm", getConversionBg(conversionValue))}>
            <TrendingUp className={cn("w-5 h-5", getConversionColor(conversionValue))} />
          </div>
          <Badge variant="outline" className="text-[10px] font-black uppercase tracking-widest bg-white/80 dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 h-6 shadow-sm px-2">
            Efficiency
          </Badge>
        </div>

        <div className="relative z-10">
          <div className="flex items-baseline gap-1">
            <span className={cn("text-4xl font-black tracking-tighter drop-shadow-sm", getConversionColor(conversionValue))}>
              {conversionRate}%
            </span>
          </div>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-1 opacity-70">Overall Conversion</p>

          <div className="mt-5 space-y-2.5">
            <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800/50 rounded-full overflow-hidden shadow-inner p-[1px]">
              <div
                className={cn("h-full rounded-full transition-all duration-1000 shadow-lg",
                  conversionValue < 5 ? "bg-rose-500 shadow-rose-500/50" : conversionValue < 15 ? "bg-amber-500 shadow-amber-500/50" : "bg-emerald-500 shadow-emerald-500/50"
                )}
                style={{ width: `${Math.min(conversionValue, 100)}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-[9px] text-slate-500 dark:text-slate-400 font-black uppercase tracking-tighter opacity-80">
              <span className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                {bookedCount} Booked
              </span>
              <span>{totalLeads} Total Leads</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ============================================
// ADD LEAD MODAL
// ============================================
// ============================================
// ADD LEAD MODAL
// ============================================
function AddLeadModal({ open, onOpenChange, companyId, userName }: { open: boolean; onOpenChange: (open: boolean) => void; companyId: number; userName: string }) {
  const { leads, categories, sources, activityTypes, addLead, bulkAddLeads } = useData()
  const [fullName, setFullName] = useState("")
  const [mobile, setMobile] = useState("")
  const [whatsapp, setWhatsapp] = useState("")
  const [location, setLocation] = useState("")
  const [flatConfig, setFlatConfig] = useState("")
  const [source, setSource] = useState("")
  const [category, setCategory] = useState("")
  const [status, setStatus] = useState("")
  const [remarks, setRemarks] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (fullName && mobile) {
      setIsSubmitting(true)
      const success = await addLead({
        companyId: companyId,
        fullName,
        mobile,
        whatsapp,
        location,
        flatConfig,
        source,
        category: status === "Booked" ? "Converted" : category,
        status: status || "Interested",
        remarks, // Latest remark
        remarksHistory: remarks ? [{
          id: Date.now().toString(),
          text: remarks,
          date: new Date().toISOString(),
          author: userName
        }] : [],
        assignedAgent: "",
      })

      setIsSubmitting(false)
      if (success) {
        // Reset form
        setFullName("")
        setMobile("")
        setWhatsapp("")
        setLocation("")
        setFlatConfig("")
        setSource("")
        setCategory("")
        setStatus("")
        setRemarks("")
        onOpenChange(false)
      }
    }
  }


  const handleBulkUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string
        const lines = text.split("\n")
        const headers = lines[0].split(",").map(h => h.trim())

        const newLeads: Omit<Lead, "id" | "createdAt" | "updatedAt">[] = []

        for (let i = 1; i < lines.length; i++) {
          if (!lines[i].trim()) continue
          const values = lines[i].split(",").map(v => v.trim())
          const leadData: any = {}
          headers.forEach((header, index) => {
            leadData[header] = values[index]
          })

          if (leadData["Full Name"] && leadData["Mobile"]) {
            newLeads.push({
              companyId: companyId,
              fullName: leadData["Full Name"],
              mobile: leadData["Mobile"],
              whatsapp: leadData["WhatsApp"] || "",
              location: leadData["Location"] || "",
              flatConfig: leadData["Flat Config"] || "",
              source: leadData["Source"] || "",
              category: leadData["Status"] === "Booked" ? "Converted" : (leadData["Category"] || ""),
              status: leadData["Status"] || "Interested",
              remarks: leadData["Remarks"] || "",
              remarksHistory: leadData["Remarks"] ? [{
                id: Date.now().toString() + i,
                text: leadData["Remarks"],
                date: new Date().toISOString(),
                author: userName
              }] : [],
              assignedAgent: "",
            })
          }
        }

        if (newLeads.length > 0) {
          setIsSubmitting(true)
          const success = await bulkAddLeads(newLeads)
          setIsSubmitting(false)
          if (success) onOpenChange(false)
        } else {
          toast.error("No valid leads found in the file.")
        }
      } catch (err) {
        toast.error("Failed to parse the file. Please check the template.")
      }
    }
    reader.readAsText(file)
    e.target.value = ""
  }

  const downloadTemplate = () => {
    const headers = ["Full Name", "Mobile", "WhatsApp", "Location", "Flat Config", "Source", "Category", "Status", "Remarks"]
    const csvContent = headers.join(",") + "\n" +
      "John Doe,9876543210,9876543210,Mumbai,2 BHK,Facebook,Hot Lead,Interested,Follow up tomorrow"

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", "leads_template.csv")
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[95vh] w-[calc(100%-2rem)] md:w-full overflow-y-auto p-0 border-none bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl overflow-hidden">
        <div className="h-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 w-full" />
        <div className="p-6 md:p-10">
          <DialogHeader className="mb-8">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-600/10 rounded-2xl border border-blue-500/20">
                <UserPlus className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <DialogTitle className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Add New Leads</DialogTitle>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mt-1">Scale your business with new opportunities</p>
              </div>
            </div>
          </DialogHeader>

          <Tabs defaultValue="single" className="w-full">
            <TabsList className="grid w-80 grid-cols-2 p-1 bg-slate-100 dark:bg-slate-800/50 rounded-2xl mb-8">
              <TabsTrigger value="single" className="rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:shadow-sm transition-all font-bold text-xs py-2">Single Entry</TabsTrigger>
              <TabsTrigger value="bulk" className="rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:shadow-sm transition-all font-bold text-xs py-2">Bulk Upload</TabsTrigger>
            </TabsList>

            <TabsContent value="single" className="mt-0 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Full Name *</Label>
                  <div className="relative group">
                    <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                    <Input id="fullName" placeholder="Rahul Sharma" value={fullName} onChange={(e) => setFullName(e.target.value)} className="h-12 pl-12 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border-transparent focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-blue-500/20 transition-all font-medium" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mobile" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Mobile Number *</Label>
                  <div className="relative group">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                    <Input id="mobile" placeholder="+91 98XXX XXXXX" type="tel" value={mobile} onChange={(e) => setMobile(e.target.value)} className="h-12 pl-12 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border-transparent focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-blue-500/20 transition-all font-medium" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="whatsapp" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">WhatsApp Number</Label>
                  <div className="relative group">
                    <MessageSquare className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                    <Input id="whatsapp" placeholder="Optional" type="tel" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} className="h-12 pl-12 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border-transparent focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-blue-500/20 transition-all font-medium" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Location</Label>
                  <div className="relative group">
                    <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                    <Input id="location" placeholder="City / Area" value={location} onChange={(e) => setLocation(e.target.value)} className="h-12 pl-12 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border-transparent focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-blue-500/20 transition-all font-medium" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="flatConfig" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Configuration</Label>
                  <Select value={flatConfig} onValueChange={setFlatConfig}>
                    <SelectTrigger className="h-12 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border-transparent focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-blue-500/20 transition-all font-medium">
                      <SelectValue placeholder="Select space" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-slate-200 dark:border-slate-800 shadow-xl">
                      <SelectItem value="1 BHK" className="rounded-xl my-0.5">1 BHK</SelectItem>
                      <SelectItem value="2 BHK" className="rounded-xl my-0.5">2 BHK</SelectItem>
                      <SelectItem value="3 BHK" className="rounded-xl my-0.5">3 BHK</SelectItem>
                      <SelectItem value="4 BHK" className="rounded-xl my-0.5">4 BHK</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="source" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Source</Label>
                  <Select value={source} onValueChange={setSource}>
                    <SelectTrigger className="h-12 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border-transparent focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-blue-500/20 transition-all font-medium">
                      <SelectValue placeholder="Tracking source" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-slate-200 dark:border-slate-800 shadow-xl">
                      {sources.map((s) => (
                        <SelectItem key={s.id} value={s.name} className="rounded-xl my-0.5">{s.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Initial Status</Label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger className="h-12 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border-transparent focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-blue-500/20 transition-all font-medium">
                      <SelectValue placeholder="Interested" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-slate-200 dark:border-slate-800 shadow-xl">
                      {activityTypes.map((a) => (
                        <SelectItem key={a.id} value={a.name} className="rounded-xl my-0.5">{a.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Project Category</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className="h-12 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border-transparent focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-blue-500/20 transition-all font-medium">
                      <SelectValue placeholder="Hot / Warm / Cold" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-slate-200 dark:border-slate-800 shadow-xl">
                      {categories.map((c) => (
                        <SelectItem key={c.id} value={c.name} className="rounded-xl my-0.5">{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 md:col-span-2 mt-2">
                  <Label htmlFor="remarks" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Initial Discovery Remarks</Label>
                  <Textarea
                    id="remarks"
                    placeholder="Enter first interaction details, preferences, and timeline..."
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    className="min-h-[120px] rounded-3xl bg-slate-50 dark:bg-slate-800/50 border-transparent focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-blue-500/20 transition-all font-medium p-6 resize-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-4 mt-10">
                <Button variant="ghost" onClick={() => onOpenChange(false)} className="h-14 px-8 rounded-2xl font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">Cancel</Button>
                <Button
                  onClick={handleSubmit}
                  disabled={!fullName || !mobile || isSubmitting}
                  className="h-14 px-12 rounded-2xl font-black bg-blue-600 hover:bg-blue-500 text-white shadow-xl shadow-blue-500/25 transition-all active:scale-[0.98] disabled:opacity-50"
                >
                  {isSubmitting ? "Saving..." : "Create Lead"}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="bulk" className="mt-0 animate-in fade-in slide-in-from-left-4 duration-500">
              <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[3rem] py-16 px-8 text-center bg-slate-50/30 dark:bg-slate-800/10 transition-all hover:bg-slate-50/50 dark:hover:bg-slate-800/20 group relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-3xl rounded-full" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-500/5 blur-3xl rounded-full" />

                <div className="w-24 h-24 bg-white dark:bg-slate-900 rounded-[2rem] flex items-center justify-center mb-6 shadow-2xl border border-slate-100 dark:border-slate-800 group-hover:scale-110 transition-transform duration-500">
                  <FileSpreadsheet className="w-10 h-10 text-blue-600" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white">Import Intelligence</h3>
                <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-sm font-medium leading-relaxed">
                  Bulk import leads from your marketing campaigns. Supports CSV and Excel formats.
                </p>

                <div className="mt-12 flex flex-col sm:flex-row gap-4 w-full justify-center px-4 relative z-10">
                  <Button variant="outline" onClick={downloadTemplate} className="h-14 rounded-2xl border-slate-200 dark:border-slate-800 font-bold bg-white dark:bg-slate-900 shadow-sm hover:shadow-md transition-all px-8">
                    <Download className="w-5 h-5 mr-3 text-blue-600" />
                    Download Schema
                  </Button>

                  <div className="relative">
                    <Input
                      type="file"
                      accept=".csv"
                      onChange={handleBulkUpload}
                      disabled={isSubmitting}
                      className="absolute inset-0 opacity-0 cursor-pointer h-14 w-full z-10"
                    />
                    <Button className="h-14 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black px-10 shadow-xl transition-all hover:scale-[1.02] active:scale-100 disabled:opacity-50">
                      <Upload className="w-5 h-5 mr-3" />
                      {isSubmitting ? "Uploading..." : "Import Data"}
                    </Button>
                  </div>
                </div>

                <div className="mt-10 flex items-center gap-6 text-[10px] text-slate-400 font-black uppercase tracking-widest opacity-60">
                  <span className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-blue-500" /> Auto-detection</span>
                  <span className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-blue-500" /> Real-time Sync</span>
                  <span className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-blue-500" /> Data Isolation</span>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ============================================
// LEADS CENTER VIEW
// ============================================
function LeadsCenterView({
  companyId,
  userName,
  initialStatus = ""
}: {
  companyId: number;
  userName: string;
  initialStatus?: string
}) {
  const { leads, categories, sources, activityTypes, deleteLead, updateLead } = useData()
  const [editLead, setEditLead] = useState<Lead | null>(null)
  const [followupLead, setFollowupLead] = useState<Lead | null>(null)
  const [newRemark, setNewRemark] = useState("")
  const [statusFilter, setStatusFilter] = useState(initialStatus)
  const [searchQuery, setSearchQuery] = useState("")

  // Filter data by company and internal filters
  const companyLeads = leads.filter(l => {
    const isCompany = l.companyId === companyId
    const matchesStatus = statusFilter ? l.status === statusFilter : true
    const matchesSearch = searchQuery
      ? l.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.mobile.includes(searchQuery)
      : true
    return isCompany && matchesStatus && matchesSearch
  }).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())

  const companyCategories = categories.filter(c => c.companyId === companyId)
  const companySources = sources.filter(s => s.companyId === companyId)
  const companyActivityTypes = activityTypes.filter(at => at.companyId === companyId)

  const handleDeleteLead = async (id: number) => {
    const confirmation = window.prompt("SECURITY CHECK: Type 'delete' to confirm deletion.")
    if (confirmation === "delete") {
      await deleteLead(id)
    } else {
      alert("Deletion cancelled. You must type 'delete' exactly.")
    }
  }

  const handleEditSave = async () => {
    if (editLead) {
      const updates: any = { ...editLead }

      if (newRemark.trim()) {
        const remarkObj: Remark = {
          id: Date.now().toString(),
          text: newRemark.trim(),
          date: new Date().toISOString(),
          author: userName
        }
        updates.remarksHistory = [remarkObj, ...(editLead.remarksHistory || [])]
        updates.remarks = newRemark.trim() // Update current remark for list display
      }

      // Enforce: Booked -> Converted
      if (updates.status === "Booked") {
        updates.category = "Converted"
      }

      updates.updatedAt = new Date().toISOString()

      await updateLead(editLead.id, updates)
      setEditLead(null)
      setNewRemark("")
    }
  }

  const handleFollowupSave = async () => {
    if (followupLead) {
      const updates: any = { ...followupLead }

      if (newRemark.trim()) {
        const remarkObj: Remark = {
          id: Date.now().toString(),
          text: newRemark.trim(),
          date: new Date().toISOString(),
          author: userName
        }
        updates.remarksHistory = [remarkObj, ...(followupLead.remarksHistory || [])]
        updates.remarks = newRemark.trim()
      }

      // Enforce: Booked -> Converted
      if (updates.status === "Booked") {
        updates.category = "Converted"
      }

      updates.updatedAt = new Date().toISOString()

      await updateLead(followupLead.id, updates)
      setFollowupLead(null)
      setNewRemark("")
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Leads Center</h1>
        <p className="text-muted-foreground">Manage all your leads</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-end sm:items-center justify-between bg-card p-4 rounded-xl border border-border">
        <div className="flex flex-1 flex-col sm:flex-row gap-4 w-full">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or mobile..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">All Statuses</SelectItem>
              {companyActivityTypes.map((at) => (
                <SelectItem key={at.id} value={at.name}>{at.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {(statusFilter || searchQuery) && (
          <Button variant="ghost" size="sm" onClick={() => { setStatusFilter(""); setSearchQuery(""); }} className="text-muted-foreground">
            Clear Filters
          </Button>
        )}
      </div>

      <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden transition-all duration-500">
        {!companyLeads.length ? (
          <div className="flex flex-col items-center justify-center py-32 px-10 text-center">
            <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-[2.5rem] flex items-center justify-center mb-8 border border-slate-200 dark:border-slate-700/50 shadow-inner">
              <UserX className="w-10 h-10 text-slate-400" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">No Leads Discovered</h3>
            <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-sm font-medium leading-relaxed">Your pipeline is currently empty. Start adding new leads to see them here.</p>
            <Button onClick={() => (window as any).dispatchAddLead()} className="mt-8 h-12 px-8 rounded-2xl bg-blue-600 hover:bg-blue-500 font-bold shadow-lg shadow-blue-500/20">
              Create First Lead
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto scrollbar-hide">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-100 dark:border-slate-800 hover:bg-transparent px-6">
                  <TableHead className="py-6 px-8 text-[11px] font-black uppercase tracking-widest text-slate-400">Client Identity</TableHead>
                  <TableHead className="py-6 text-[11px] font-black uppercase tracking-widest text-slate-400">Contact Path</TableHead>
                  <TableHead className="py-6 text-[11px] font-black uppercase tracking-widest text-slate-400">Origin / Source</TableHead>
                  <TableHead className="py-6 hidden md:table-cell text-[11px] font-black uppercase tracking-widest text-slate-400">Classification</TableHead>
                  <TableHead className="py-6 text-[11px] font-black uppercase tracking-widest text-slate-400">Current Phase</TableHead>
                  <TableHead className="py-6 hidden lg:table-cell text-[11px] font-black uppercase tracking-widest text-slate-400">Latent Remark</TableHead>
                  <TableHead className="py-6 text-right px-8 text-[11px] font-black uppercase tracking-widest text-slate-400">Control</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {companyLeads.map((lead) => (
                  <TableRow key={lead.id} className="group border-slate-100 dark:border-slate-800 hover:bg-blue-50/30 dark:hover:bg-blue-500/5 transition-colors cursor-default px-6">
                    <TableCell className="py-5 px-8">
                      <div className="flex flex-col">
                        <span className="text-base font-black text-slate-900 dark:text-white tracking-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{lead.fullName}</span>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">{new Date(lead.createdAt).toLocaleDateString()}</span>
                      </div>
                    </TableCell>
                    <TableCell className="py-5">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-300">
                          <Phone className="w-3 h-3 opacity-50" />
                          {lead.mobile}
                        </div>
                        {lead.whatsapp && (
                          <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-500">
                            <MessageSquare className="w-3 h-3" />
                            Active WhatsApp
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="py-5">
                      <Badge variant="outline" className="h-7 px-3 rounded-full border-slate-200 dark:border-slate-800 font-bold text-[10px] uppercase bg-white dark:bg-slate-900 shadow-sm">
                        {lead.source || "None"}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-5 hidden md:table-cell">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-2 h-2 rounded-full shadow-sm shadow-current"
                          style={{ backgroundColor: categories.find(c => c.name === lead.category)?.color || "#cbd5e1" }}
                        />
                        <span className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">{lead.category || "General"}</span>
                      </div>
                    </TableCell>
                    <TableCell className="py-5">
                      <div className={cn(
                        "inline-flex items-center px-4 py-1.5 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-sm",
                        lead.status === "Booked" ? "bg-emerald-500 text-white shadow-emerald-500/20" :
                          lead.status === "Not Interested" ? "bg-rose-500 text-white shadow-rose-500/20" :
                            "bg-blue-600 text-white shadow-blue-500/20"
                      )}>
                        {lead.status}
                      </div>
                    </TableCell>
                    <TableCell className="py-5 hidden lg:table-cell max-w-[240px]">
                      <div className="flex flex-col gap-1">
                        <p className="text-xs text-slate-600 dark:text-slate-400 font-medium line-clamp-2 italic leading-relaxed">
                          "{lead.remarks || "No interaction recorded yet."}"
                        </p>
                        <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest">{new Date(lead.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} Update</span>
                      </div>
                    </TableCell>
                    <TableCell className="py-5 text-right px-8">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setFollowupLead(lead)}
                          className="w-10 h-10 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-500/10 hover:text-blue-600 text-slate-400 transition-all border border-transparent hover:border-blue-500/20"
                        >
                          <History className="w-4.5 h-4.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setEditLead(lead)}
                          className="w-10 h-10 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80 text-slate-400 transition-all"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteLead(lead.id)}
                          className="w-10 h-10 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-500/10 hover:text-rose-600 text-slate-400 transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Edit Lead Modal */}
      <Dialog open={!!editLead} onOpenChange={(open) => !open && setEditLead(null)}>
        <DialogContent className="max-w-2xl max-h-[95vh] w-[calc(100%-2rem)] md:w-full overflow-y-auto p-0 border-none bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 w-full" />
          <div className="p-6 md:p-10">
            <DialogHeader className="mb-8">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-600/10 rounded-2xl border border-blue-500/20">
                  <Pencil className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <DialogTitle className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Refine Lead Details</DialogTitle>
                  <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mt-1">Keep your database accurate and up to date</p>
                </div>
              </div>
            </DialogHeader>

            {editLead && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Full Identity</Label>
                  <Input value={editLead.fullName} onChange={(e) => setEditLead({ ...editLead, fullName: e.target.value })} className="h-12 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border-transparent focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-blue-500/20 transition-all font-medium py-6" />
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Contact Path</Label>
                  <Input value={editLead.mobile} onChange={(e) => setEditLead({ ...editLead, mobile: e.target.value })} className="h-12 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border-transparent focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-blue-500/20 transition-all font-medium py-6" />
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Origin Source</Label>
                  <Select value={editLead.source} onValueChange={(v) => setEditLead({ ...editLead, source: v })}>
                    <SelectTrigger className="h-12 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border-transparent focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-blue-500/20 transition-all font-medium py-6">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-slate-200 dark:border-slate-800 shadow-xl">
                      {companySources.map((s) => <SelectItem key={s.id} value={s.name} className="rounded-xl my-0.5">{s.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Current Classification</Label>
                  <Select
                    value={editLead.status === "Booked" ? "Converted" : editLead.category}
                    onValueChange={(v) => setEditLead({ ...editLead, category: v })}
                    disabled={editLead.status === "Booked"}
                  >
                    <SelectTrigger className="h-12 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border-transparent focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-blue-500/20 transition-all font-medium py-6">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-slate-200 dark:border-slate-800 shadow-xl">
                      {companyCategories.map((c) => <SelectItem key={c.id} value={c.name} className="rounded-xl my-0.5">{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Sales Progression</Label>
                  <Select value={editLead.status} onValueChange={(v) => setEditLead({ ...editLead, status: v })}>
                    <SelectTrigger className="h-12 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border-transparent focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-blue-500/20 transition-all font-medium py-6">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-slate-200 dark:border-slate-800 shadow-xl">
                      {companyActivityTypes.map((at) => <SelectItem key={at.id} value={at.name} className="rounded-xl my-0.5">{at.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  {editLead.status === "Booked" && (
                    <p className="text-[10px] text-emerald-600 font-bold mt-1.5 px-1 uppercase tracking-widest flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Force-synced to "Converted"</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Geographic Interest</Label>
                  <Input value={editLead.location} onChange={(e) => setEditLead({ ...editLead, location: e.target.value })} className="h-12 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border-transparent focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-blue-500/20 transition-all font-medium py-6" />
                </div>

                <div className="space-y-2 md:col-span-2 mt-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Append Knowledge / Remarks</Label>
                  <Textarea
                    placeholder="Capture new insights from latest interaction..."
                    value={newRemark}
                    onChange={(e) => setNewRemark(e.target.value)}
                    className="min-h-[120px] rounded-3xl bg-slate-50 dark:bg-slate-800/50 border-transparent focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-blue-500/20 transition-all font-medium p-6 resize-none"
                  />
                </div>
              </div>
            )}

            <div className="flex justify-end gap-4 mt-10">
              <Button variant="ghost" onClick={() => setEditLead(null)} className="h-14 px-8 rounded-2xl font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">Cancel</Button>
              <Button
                onClick={handleEditSave}
                className="h-14 px-12 rounded-2xl font-black bg-blue-600 hover:bg-blue-500 text-white shadow-xl shadow-blue-500/25 transition-all active:scale-[0.98]"
              >
                Apply Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Premium Followup & Remark History Box */}
      <Dialog open={!!followupLead} onOpenChange={(open) => !open && setFollowupLead(null)}>
        <DialogContent className="max-w-5xl max-h-[95vh] w-[calc(100%-2rem)] md:w-full overflow-hidden flex flex-col p-0 border-none bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl rounded-[3rem] shadow-2xl">
          {followupLead && (
            <div className="flex flex-col h-full overflow-hidden">
              {/* Unified Professional Header */}
              <div className="p-8 md:p-10 bg-slate-50/50 dark:bg-slate-800/30 border-b border-slate-200 dark:border-slate-800 relative">
                <div className="absolute top-0 right-0 w-64 h-full bg-blue-500/5 blur-3xl rounded-full" />
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 rounded-[1.5rem] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl flex items-center justify-center">
                      <History className="w-8 h-8 text-blue-600" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{followupLead.fullName}</h2>
                      <div className="flex items-center gap-3 mt-1">
                        <Badge className="bg-blue-600/10 text-blue-600 border-none rounded-lg px-2 py-0.5 text-[10px] font-black uppercase tracking-widest">{followupLead.status}</Badge>
                        <span className="text-xs font-bold text-slate-400 border-l border-slate-300 dark:border-slate-700 pl-3 flex items-center gap-2">
                          <Phone className="w-3 h-3" />
                          {followupLead.mobile}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button variant="outline" className="h-12 rounded-2xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 font-bold px-6 shadow-sm">
                      <Mail className="w-4 h-4 mr-2" /> Email
                    </Button>
                    <Button className="h-12 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black px-6 shadow-lg shadow-emerald-500/20">
                      <MessageSquare className="w-4 h-4 mr-2" /> WhatsApp
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
                {/* Narrative Timeline */}
                <div className="flex-1 overflow-y-auto p-8 md:p-10 space-y-10 scrollbar-hide">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em]">Interaction Narrative</h3>
                    <Badge variant="outline" className="rounded-full px-4 py-1 text-[10px] font-black uppercase text-slate-400 border-slate-200 dark:border-slate-800">{followupLead.remarksHistory?.length || 0} Events Recorded</Badge>
                  </div>

                  <div className="relative pl-8 space-y-10 before:absolute before:left-0 before:top-2 before:bottom-2 before:w-[2px] before:bg-gradient-to-b before:from-blue-600/50 before:via-slate-200 dark:before:via-slate-800 before:to-transparent">
                    {followupLead.remarksHistory?.length ? (
                      followupLead.remarksHistory.map((remark, idx) => (
                        <div key={remark.id} className="relative group">
                          <div className={cn(
                            "absolute -left-9.5 top-1.5 w-3 h-3 rounded-full border-[3px] border-white dark:border-slate-900 z-10 transition-all group-hover:scale-150 shadow-sm",
                            idx === 0 ? "bg-blue-600" : "bg-slate-300 dark:bg-slate-700"
                          )} />

                          <div className="flex flex-col gap-2">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">{remark.author}</span>
                              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{new Date(remark.date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</span>
                            </div>
                            <div className="bg-white dark:bg-slate-800/50 p-6 rounded-[1.5rem] border border-slate-100 dark:border-slate-800 shadow-sm group-hover:shadow-md transition-all group-hover:border-blue-500/20">
                              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">{remark.text}</p>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="py-20 flex flex-col items-center justify-center text-center opacity-40">
                        <Database className="w-12 h-12 text-slate-300 mb-4" />
                        <p className="text-sm font-bold uppercase tracking-widest">No Narrative History</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Command Center */}
                <div className="w-full md:w-[380px] bg-slate-50/50 dark:bg-slate-900/50 border-t md:border-t-0 md:border-l border-slate-200 dark:border-slate-800 p-8 md:p-10 flex flex-col gap-8 overflow-y-auto">
                  <div className="space-y-6">
                    <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">Command Center</h3>

                    <div className="space-y-2">
                      <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Evolve State</Label>
                      <Select
                        value={followupLead.status}
                        onValueChange={(v) => {
                          const updated = { ...followupLead, status: v };
                          if (v === "Booked") updated.category = "Converted";
                          setFollowupLead(updated);
                        }}
                      >
                        <SelectTrigger className="h-12 rounded-2xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm font-bold">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl border-slate-200 dark:border-slate-800">
                          {companyActivityTypes.map((at) => (
                            <SelectItem key={at.id} value={at.name} className="rounded-xl my-0.5">{at.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {followupLead.status === "Booked" && (
                        <div className="px-3 py-2 bg-emerald-500/10 rounded-xl flex items-center gap-2 mt-2">
                          <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                          <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest">Auto-Converting Category</p>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">New Interaction Log</Label>
                      <Textarea
                        placeholder="Type session insights here..."
                        className="min-h-[160px] rounded-3xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm p-6 resize-none font-medium leading-relaxed"
                        value={newRemark}
                        onChange={(e) => setNewRemark(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="mt-auto space-y-4 pt-10 border-t border-slate-200 dark:border-slate-800">
                    <Button
                      onClick={handleFollowupSave}
                      className="w-full h-14 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black shadow-xl shadow-blue-500/25 active:scale-[0.98] transition-all"
                    >
                      Sync Interaction
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => setFollowupLead(null)}
                      className="w-full h-14 rounded-2xl font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-all text-slate-500"
                    >
                      Dismiss
                    </Button>
                  </div>

                  <div className="mt-4 p-5 bg-gradient-to-br from-slate-900 to-slate-800 rounded-[1.5rem] shadow-xl text-white space-y-3 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 blur-2xl rounded-full" />
                    <p className="font-black uppercase tracking-[0.2em] text-[9px] text-blue-400 mb-4 opacity-80 underline underline-offset-4">Lead Intelligence Summary</p>
                    <div className="space-y-3">
                      <div className="flex flex-col">
                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Configuration</span>
                        <span className="text-xs font-bold">{followupLead.flatConfig || "Not Defined"}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Target Area</span>
                        <span className="text-xs font-bold truncate">{followupLead.location || "Not Defined"}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Market Source</span>
                        <span className="text-xs font-bold">{followupLead.source || "Organic Discovery"}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ============================================
// ASSIGNMENT VIEW
// ============================================
function LeadsAssignView({ companyId }: { companyId: number }) {
  const { leads, users, updateLead } = useData()

  const handleAssign = async (leadId: number, agentName: string) => {
    await updateLead(leadId, { assignedAgent: agentName, updatedAt: new Date().toISOString() })
  }

  const companyLeads = leads.filter(l => l.companyId === companyId).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
  const companyUsers = users.filter(u => u.companyId === companyId)

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight uppercase">Lead Assignment</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium mt-2">Distribute your pipeline intelligence among the elite team</p>
        </div>
        <div className="flex items-center gap-3 px-6 py-3 bg-blue-600/5 dark:bg-blue-500/5 rounded-2xl border border-blue-500/10">
          <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400">{companyLeads.length} Total Pipeline Entries</span>
        </div>
      </div>

      <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-slate-100 dark:border-slate-800 hover:bg-transparent px-6">
              <TableHead className="py-6 px-10 text-[11px] font-black uppercase tracking-widest text-slate-400">Prospect Identity</TableHead>
              <TableHead className="py-6 text-[11px] font-black uppercase tracking-widest text-slate-400">Contact</TableHead>
              <TableHead className="py-6 text-[11px] font-black uppercase tracking-widest text-slate-400">Phase</TableHead>
              <TableHead className="py-6 text-[11px] font-black uppercase tracking-widest text-slate-400">Assigned Asset</TableHead>
              <TableHead className="py-6 text-right px-10 text-[11px] font-black uppercase tracking-widest text-slate-400">Assignment Path</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {companyLeads.map((lead) => (
              <TableRow key={lead.id} className="group border-slate-100 dark:border-slate-800 hover:bg-blue-50/30 dark:hover:bg-blue-500/5 transition-all px-6">
                <TableCell className="py-5 px-10">
                  <span className="text-base font-black text-slate-900 dark:text-white tracking-tight">{lead.fullName}</span>
                </TableCell>
                <TableCell className="py-5">
                  <span className="text-sm font-semibold text-slate-500">{lead.mobile}</span>
                </TableCell>
                <TableCell className="py-5">
                  <Badge variant="outline" className="rounded-full px-3 py-0.5 text-[10px] font-black uppercase tracking-widest border-slate-200 dark:border-slate-800">{lead.status}</Badge>
                </TableCell>
                <TableCell className="py-5">
                  {lead.assignedAgent ? (
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-blue-600/10 flex items-center justify-center text-[10px] font-black text-blue-600 border border-blue-500/20">
                        {lead.assignedAgent[0]}
                      </div>
                      <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{lead.assignedAgent}</span>
                    </div>
                  ) : (
                    <span className="text-xs font-black uppercase tracking-widest text-slate-300 dark:text-slate-600 italic">Unassigned Velocity</span>
                  )}
                </TableCell>
                <TableCell className="py-5 text-right px-10">
                  <Select value={lead.assignedAgent} onValueChange={(v) => handleAssign(lead.id, v)}>
                    <SelectTrigger className="w-48 h-12 rounded-2xl bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 shadow-sm focus:ring-blue-500/20 font-bold transition-all">
                      <SelectValue placeholder="Dispatch to..." />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-slate-200 dark:border-slate-800 shadow-2xl">
                      {companyUsers.filter(u => u.status === "Active").map((u) => (
                        <SelectItem key={u.id} value={u.name} className="rounded-xl my-1 font-medium">{u.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

// ============================================
// TEAM MANAGEMENT VIEW
// ============================================
function UserListView({ companyId }: { companyId: number }) {
  const { users, setUsers } = useData()
  const [addUserOpen, setAddUserOpen] = useState(false)
  const [editUser, setEditUser] = useState<CRMUser | null>(null)
  const [newUserName, setNewUserName] = useState("")
  const [newUserEmail, setNewUserEmail] = useState("")
  const [newUserRole, setNewUserRole] = useState("")

  const companyUsers = users.filter(u => u.companyId === companyId)

  const handleAddUser = () => {
    if (newUserName && newUserEmail && newUserRole) {
      const newUser: CRMUser = {
        id: Math.max(...users.map(u => u.id), 0) + 1,
        companyId: companyId,
        name: newUserName,
        email: newUserEmail,
        role: newUserRole,
        status: "Active",
      }
      setUsers([...users, newUser])
      setNewUserName("")
      setNewUserEmail("")
      setNewUserRole("")
      setAddUserOpen(false)
    }
  }

  const handleDeleteUser = (id: number) => {
    const confirmation = window.prompt("SECURITY CHECK: Type 'delete' to confirm deletion.")
    if (confirmation === "delete") {
      setUsers(users.filter(u => u.id !== id))
    } else {
      alert("Deletion cancelled. You must type 'delete' exactly.")
    }
  }

  const handleToggleStatus = (id: number) => {
    setUsers(users.map(u => u.id === id ? { ...u, status: u.status === "Active" ? "Blocked" : "Active" } : u))
  }

  const handleEditSave = () => {
    if (editUser) {
      setUsers(users.map(u => u.id === editUser.id ? editUser : u))
      setEditUser(null)
    }
  }

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight uppercase">Team Intelligence</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium mt-2">Scale your operational capacity with elite personnel</p>
        </div>
        <Dialog open={addUserOpen} onOpenChange={setAddUserOpen}>
          <DialogTrigger asChild>
            <Button className="h-14 px-8 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black shadow-xl shadow-slate-900/10 dark:shadow-none hover:scale-[1.02] active:scale-95 transition-all">
              <Plus className="w-5 h-5 mr-3" />
              Recruit Member
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl border-white/20 dark:border-slate-800 rounded-[2.5rem] shadow-2xl p-8">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black tracking-tight">Recruit New Member</DialogTitle>
            </DialogHeader>
            <div className="space-y-5 py-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Full Name</Label>
                <Input value={newUserName} onChange={(e) => setNewUserName(e.target.value)} placeholder="Agent Identity" className="h-12 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border-transparent focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-blue-500/20 transition-all font-medium" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Email Protocol</Label>
                <Input value={newUserEmail} onChange={(e) => setNewUserEmail(e.target.value)} placeholder="agent@growfast.com" type="email" className="h-12 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border-transparent focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-blue-500/20 transition-all font-medium" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Operational Role</Label>
                <Select value={newUserRole} onValueChange={setNewUserRole}>
                  <SelectTrigger className="h-12 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border-transparent focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-blue-500/20 transition-all font-medium">
                    <SelectValue placeholder="Select Rank" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-slate-200 dark:border-slate-800 shadow-xl">
                    <SelectItem value="Sales Agent" className="rounded-xl my-1">Field Agent</SelectItem>
                    <SelectItem value="Team Lead" className="rounded-xl my-1">Operational Lead</SelectItem>
                    <SelectItem value="Manager" className="rounded-xl my-1">Strategic Manager</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter className="gap-3">
              <Button variant="ghost" onClick={() => setAddUserOpen(false)} className="h-12 px-6 rounded-xl font-bold">Abort</Button>
              <Button onClick={handleAddUser} disabled={!newUserName || !newUserEmail || !newUserRole} className="h-12 px-8 rounded-xl bg-blue-600 text-white font-black shadow-lg shadow-blue-500/20">Authorize Member</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {companyUsers.map((member) => (
          <div key={member.id} className="group bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-lg hover:shadow-2xl transition-all duration-300 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-600/5 blur-3xl rounded-full translate-x-12 -translate-y-12 group-hover:scale-150 transition-transform duration-500" />

            <div className="flex items-start justify-between mb-6 relative z-10">
              <Avatar className="w-16 h-16 border-2 border-white dark:border-slate-800 shadow-xl ring-4 ring-blue-500/5">
                <AvatarFallback className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white text-xl font-black">
                  {member.name.split(" ").map(n => n[0]).join("")}
                </AvatarFallback>
              </Avatar>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" onClick={() => setEditUser(member)} className="w-9 h-9 rounded-xl hover:bg-white dark:hover:bg-slate-800 shadow-sm border border-transparent hover:border-slate-200 transition-all">
                  <Pencil className="w-4 h-4 text-slate-400 group-hover:text-blue-500" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleDeleteUser(member.id)} className="w-9 h-9 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/30 text-slate-400 hover:text-rose-500 transition-all">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-1 relative z-10">
              <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">{member.name}</h3>
              <p className="text-sm font-semibold text-slate-500">{member.email}</p>
            </div>

            <div className="mt-6 flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-6 relative z-10">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Authorization</p>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{member.role}</span>
              </div>
              <button
                onClick={() => handleToggleStatus(member.id)}
                className={cn(
                  "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                  member.status === "Active"
                    ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 hover:bg-emerald-500 hover:text-white"
                    : "bg-rose-500/10 text-rose-600 border border-rose-500/20 hover:bg-rose-500 hover:text-white"
                )}
              >
                {member.status}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit User Modal */}
      <Dialog open={!!editUser} onOpenChange={(open) => !open && setEditUser(null)}>
        <DialogContent className="max-w-md bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl border-white/20 dark:border-slate-800 rounded-[2.5rem] p-8 shadow-2xl">
          <DialogHeader><DialogTitle className="text-2xl font-black tracking-tight">Modify Expert Profile</DialogTitle></DialogHeader>
          {editUser && (
            <div className="space-y-5 py-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Identify</Label>
                <Input value={editUser.name} onChange={(e) => setEditUser({ ...editUser, name: e.target.value })} className="h-12 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border-transparent font-medium" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Sync Protocol</Label>
                <Input value={editUser.email} onChange={(e) => setEditUser({ ...editUser, email: e.target.value })} className="h-12 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border-transparent font-medium" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Privilege Level</Label>
                <Select value={editUser.role} onValueChange={(v) => setEditUser({ ...editUser, role: v })}>
                  <SelectTrigger className="h-12 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border-transparent font-medium">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl">
                    <SelectItem value="Sales Agent" className="rounded-xl">Field Agent</SelectItem>
                    <SelectItem value="Team Lead" className="rounded-xl">Operational Lead</SelectItem>
                    <SelectItem value="Manager" className="rounded-xl">Strategic Manager</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter className="gap-3">
            <Button variant="ghost" onClick={() => setEditUser(null)} className="h-12 px-6 rounded-xl font-bold">Discard</Button>
            <Button onClick={handleEditSave} className="h-12 px-8 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black">Sync Profiler</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ============================================
// SETTINGS VIEW
// ============================================
function SettingsView({ companyId }: { companyId: number }) {
  const { leads, setLeads, categories, setCategories, sources, setSources, teams, setTeams, activityTypes, setActivityTypes, users, setUsers } = useData()
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [backupMessage, setBackupMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const handleUpdatePassword = (e: React.FormEvent) => {
    // ... same as before
    e.preventDefault()
    setMessage(null)
    if (!currentPassword || !newPassword || !confirmPassword) {
      setMessage({ type: "error", text: "All fields are required" })
      return
    }
    if (newPassword !== confirmPassword) {
      setMessage({ type: "error", text: "New passwords do not match" })
      return
    }
    if (newPassword.length < 6) {
      setMessage({ type: "error", text: "Password must be at least 6 characters" })
      return
    }
    setMessage({ type: "success", text: "Password updated successfully!" })
    setCurrentPassword("")
    setNewPassword("")
    setConfirmPassword("")
  }

  const handleBackup = () => {
    const backupData = {
      companyId,
      exportedAt: new Date().toISOString(),
      leads: leads.filter(l => l.companyId === companyId),
      categories: categories.filter(c => c.companyId === companyId),
      sources: sources.filter(s => s.companyId === companyId),
      teams: teams.filter(t => t.companyId === companyId),
      activityTypes: activityTypes.filter(at => at.companyId === companyId),
      users: users.filter(u => u.companyId === companyId),
    }

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `crm-backup-company-${companyId}-${new Date().toISOString().split("T")[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    setBackupMessage({ type: "success", text: "Backup created and download started!" })
  }

  const handleRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string)

        // Security Check: Ensure the data is for THIS company
        if (data.companyId !== companyId) {
          setBackupMessage({ type: "error", text: "Invalid Backup: This file belongs to another company." })
          return
        }

        // Confirmation before overwrite
        const confirm = window.prompt("WARNING: This will replace all your current data. Type 'restore' to confirm.")
        if (confirm !== "restore") {
          setBackupMessage({ type: "error", text: "Restore cancelled." })
          return
        }

        // Update all datasets, keeping other companies' data intact
        if (data.leads) setLeads(prev => [...prev.filter(l => l.companyId !== companyId), ...data.leads])
        if (data.categories) setCategories(prev => [...prev.filter(c => c.companyId !== companyId), ...data.categories])
        if (data.sources) setSources(prev => [...prev.filter(s => s.companyId !== companyId), ...data.sources])
        if (data.teams) setTeams(prev => [...prev.filter(t => t.companyId !== companyId), ...data.teams])
        if (data.activityTypes) setActivityTypes(prev => [...prev.filter(at => at.companyId !== companyId), ...data.activityTypes])
        if (data.users) setUsers(prev => [...prev.filter(u => u.companyId !== companyId), ...data.users])

        setBackupMessage({ type: "success", text: "Data restored successfully!" })
      } catch (err) {
        setBackupMessage({ type: "error", text: "Failed to parse backup file. Please use a valid JSON file." })
      }
    }
    reader.readAsText(file)
    // Reset input
    e.target.value = ""
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-foreground mb-6">Settings</h1>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Lock className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Security</CardTitle>
              <CardDescription>Update your password</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <div className="relative">
                <Input id="currentPassword" type={showCurrentPassword ? "text" : "password"} placeholder="Enter current password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="pr-10" />
                <button type="button" onClick={() => setShowCurrentPassword(!showCurrentPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <div className="relative">
                <Input id="newPassword" type={showNewPassword ? "text" : "password"} placeholder="Enter new password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="pr-10" />
                <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <div className="relative">
                <Input id="confirmPassword" type={showConfirmPassword ? "text" : "password"} placeholder="Confirm new password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="pr-10" />
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {message && (
              <div className={cn("text-sm p-3 rounded-lg", message.type === "success" ? "bg-emerald-500/10 text-emerald-600" : "bg-destructive/10 text-destructive")}>
                {message.text}
              </div>
            )}

            <Button type="submit" className="w-full sm:w-auto">Update Password</Button>
          </form>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Database className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Data Backup & Restore</CardTitle>
              <CardDescription>Securely manage your company data</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-dashed border-border bg-muted/30 flex flex-col items-center text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Download className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold">Backup Data</h4>
                <p className="text-xs text-muted-foreground">Download all your leads, users, and settings as a JSON file.</p>
              </div>
              <Button onClick={handleBackup} variant="outline" className="w-full gap-2 hover:bg-primary/5">
                <Download className="w-4 h-4" />
                Generate Backup
              </Button>
            </div>

            <div className="p-4 rounded-xl border border-dashed border-border bg-muted/30 flex flex-col items-center text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center">
                <Upload className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <h4 className="font-semibold">Restore Data</h4>
                <p className="text-xs text-muted-foreground">Import data from a previous backup file. This will replace current data.</p>
              </div>
              <div className="relative w-full">
                <input
                  type="file"
                  accept=".json"
                  onChange={handleRestore}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <Button variant="outline" className="w-full gap-2 hover:bg-emerald-500/5 text-emerald-600 border-emerald-500/20">
                  <Upload className="w-4 h-4" />
                  Upload & Restore
                </Button>
              </div>
            </div>
          </div>

          {backupMessage && (
            <div className={cn("text-sm p-3 rounded-lg flex items-center gap-2",
              backupMessage.type === "success" ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20" : "bg-destructive/10 text-destructive border border-destructive/20"
            )}>
              <Database className="w-4 h-4" />
              {backupMessage.text}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// ============================================
// WORKFLOW CONFIGURATION VIEW
// ============================================
function CategoriesView({ companyId }: { companyId: number }) {
  const { categories, setCategories, sources, setSources, teams, setTeams, activityTypes, setActivityTypes } = useData()

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight uppercase">Workflow Architecture</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium mt-2">Configure the core logic of your pipeline intelligence</p>
        </div>
      </div>

      <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl rounded-[2.5rem] border border-slate-200 dark:border-slate-800 p-2 shadow-2xl overflow-hidden">
        <Tabs defaultValue="activity-types" className="w-full">
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800">
            <TabsList className="bg-slate-100/50 dark:bg-slate-800/50 p-1.5 rounded-2xl h-auto gap-1">
              <TabsTrigger value="activity-types" className="rounded-xl px-6 py-2.5 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-lg font-bold text-xs uppercase tracking-widest transition-all">Phase States</TabsTrigger>
              <TabsTrigger value="source" className="rounded-xl px-6 py-2.5 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-lg font-bold text-xs uppercase tracking-widest transition-all">Intel Sources</TabsTrigger>
              <TabsTrigger value="team" className="rounded-xl px-6 py-2.5 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-lg font-bold text-xs uppercase tracking-widest transition-all">Team Divisions</TabsTrigger>
              <TabsTrigger value="category" className="rounded-xl px-6 py-2.5 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-lg font-bold text-xs uppercase tracking-widest transition-all">Segments</TabsTrigger>
            </TabsList>
          </div>

          <div className="p-8">
            <TabsContent value="activity-types" className="mt-0 focus-visible:ring-0">
              <CategoryTable
                companyId={companyId}
                data={activityTypes}
                setData={setActivityTypes}
                title="Phase State"
                description="These statuses control the primary dashboard intelligence tiles and lead pipeline progression."
              />
            </TabsContent>

            <TabsContent value="source" className="mt-0 focus-visible:ring-0">
              <CategoryTable
                companyId={companyId}
                data={sources}
                setData={setSources}
                title="Intel Source"
                description="Identify the origin of your leads to optimize marketing acquisition spend."
              />
            </TabsContent>

            <TabsContent value="team" className="mt-0 focus-visible:ring-0">
              <CategoryTable
                companyId={companyId}
                data={teams}
                setData={setTeams}
                title="Team Division"
                description="Organize your workforce into specialized units for enhanced efficiency."
              />
            </TabsContent>

            <TabsContent value="category" className="mt-0 focus-visible:ring-0">
              <CategoryTable
                companyId={companyId}
                data={categories}
                setData={setCategories}
                title="User Segment"
                description="General lead classifications used for high-level pipeline reporting."
              />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  )
}

function CategoryTable({
  companyId,
  data,
  setData,
  title,
  description,
}: {
  companyId: number
  data: Array<{ id: number; companyId: number; name: string; color: string }>
  setData: React.Dispatch<React.SetStateAction<Array<{ id: number; companyId: number; name: string; color: string }>>>
  title: string
  description?: string
}) {
  const [addOpen, setAddOpen] = useState(false)
  const [newItemName, setNewItemName] = useState("")
  const [newItemColor, setNewItemColor] = useState("#3b82f6")
  const [editItem, setEditItem] = useState<{ id: number; companyId: number; name: string; color: string } | null>(null)

  const companyData = data.filter(d => d.companyId === companyId)

  const handleAdd = () => {
    if (newItemName) {
      const newItem = {
        id: Math.max(...data.map(d => d.id), 0) + 1,
        companyId: companyId,
        name: newItemName,
        color: newItemColor,
      }
      setData([...data, newItem])
      setNewItemName("")
      setAddOpen(false)
    }
  }

  const handleDelete = (id: number) => {
    const confirmation = window.prompt("SECURITY CHECK: Type 'delete' to confirm deletion.")
    if (confirmation === "delete") {
      setData(data.filter(d => d.id !== id))
    } else {
      alert("Deletion cancelled. You must type 'delete' exactly.")
    }
  }

  const handleEditSave = () => {
    if (editItem) {
      setData(data.map(d => d.id === editItem.id ? editItem : d))
      setEditItem(null)
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="max-w-xl">
          <h3 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">{title} Configuration</h3>
          {description && <p className="text-sm font-medium text-slate-500 mt-2">{description}</p>}
        </div>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button className="h-12 px-6 rounded-xl bg-blue-600 text-white font-black shadow-lg shadow-blue-500/20 hover:scale-[1.02] active:scale-95 transition-all">
              <Plus className="w-5 h-5 mr-2" />
              Forging Logic
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl border-white/20 dark:border-slate-800 rounded-[2.5rem] shadow-2xl p-8">
            <DialogHeader><DialogTitle className="text-2xl font-black tracking-tight">Create New {title}</DialogTitle></DialogHeader>
            <div className="space-y-5 py-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Label Designation</Label>
                <Input placeholder={`Identify this ${title.toLowerCase()}`} value={newItemName} onChange={(e) => setNewItemName(e.target.value)} className="h-12 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border-transparent font-medium" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Visual Index (Color)</Label>
                <div className="flex gap-2 p-2 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-transparent shadow-inner">
                  {["#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#6366f1", "#ec4899", "#14b8a6"].map((color) => (
                    <button
                      key={color}
                      onClick={() => setNewItemColor(color)}
                      className={cn(
                        "w-8 h-8 rounded-full transition-all shadow-md active:scale-90",
                        newItemColor === color ? "ring-4 ring-offset-2 ring-blue-500/50 scale-110" : "scale-100"
                      )}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                  <Input type="color" value={newItemColor} onChange={(e) => setNewItemColor(e.target.value)} className="w-10 h-8 p-0 border-none bg-transparent cursor-pointer ml-auto" />
                </div>
              </div>
            </div>
            <DialogFooter className="gap-3">
              <Button variant="ghost" onClick={() => setAddOpen(false)} className="h-12 px-6 rounded-xl font-bold">Abort</Button>
              <Button onClick={handleAdd} disabled={!newItemName} className="h-12 px-8 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black">Authorize</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {companyData.map((item, index) => (
          <div key={item.id} className="group bg-white dark:bg-slate-800/50 rounded-3xl p-6 border border-slate-100 dark:border-slate-800/80 shadow-sm hover:shadow-xl hover:border-blue-500/30 transition-all flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg transform group-hover:rotate-12 transition-transform" style={{ backgroundColor: item.color }}>
                <span className="text-white text-[10px] font-black uppercase tracking-tighter opacity-80">{index + 1}</span>
              </div>
              <div>
                <h4 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">{item.name}</h4>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{item.color}</p>
              </div>
            </div>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
              <Button variant="ghost" size="icon" className="w-9 h-9 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-300 hover:text-blue-500" onClick={() => setEditItem(item)}>
                <Pencil className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" className="w-9 h-9 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/30 text-slate-300 hover:text-rose-500" onClick={() => handleDelete(item.id)}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      <Dialog open={!!editItem} onOpenChange={(open) => !open && setEditItem(null)}>
        <DialogContent className="max-w-md bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl border-white/20 dark:border-slate-800 rounded-[2.5rem] shadow-2xl p-8">
          <DialogHeader><DialogTitle className="text-2xl font-black tracking-tight">Modify {title}</DialogTitle></DialogHeader>
          {editItem && (
            <div className="space-y-5 py-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Update Label</Label>
                <Input value={editItem.name} onChange={(e) => setEditItem({ ...editItem, name: e.target.value })} className="h-12 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border-transparent font-medium" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Spectral Index (Color)</Label>
                <div className="flex gap-2 p-2 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                  <Input value={editItem.color} onChange={(e) => setEditItem({ ...editItem, color: e.target.value })} className="h-10 border-transparent bg-transparent font-bold flex-1" />
                  <input type="color" value={editItem.color} onChange={(e) => setEditItem({ ...editItem, color: e.target.value })} className="w-10 h-10 rounded-xl border-none cursor-pointer" />
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="gap-3">
            <Button variant="ghost" onClick={() => setEditItem(null)} className="h-12 px-6 rounded-xl font-bold">Discard</Button>
            <Button onClick={handleEditSave} className="h-12 px-8 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black">Sync Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ============================================
// PLACEHOLDER & HOW TO USE
// ============================================
function PlaceholderView({ title }: { title: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-[calc(100vh-12rem)]">
      <div className="bg-card rounded-xl border border-border p-8 text-center max-w-md">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
          <LayoutDashboard className="w-8 h-8 text-muted-foreground" />
        </div>
        <h2 className="text-xl font-semibold text-card-foreground mb-2">{title}</h2>
        <p className="text-muted-foreground">This section is under development. Check back soon for updates!</p>
      </div>
    </div>
  )
}

function HowToUseView() {
  const steps = [
    { title: "Add New Leads", description: "Click on 'Add New Leads' in the sidebar to open the lead form and enter prospect information." },
    { title: "Manage Categories", description: "Go to 'Categories' to create and customize lead categories, sources, and team assignments." },
    { title: "Track Lead Status", description: "Use the Dashboard to monitor lead activity types and conversion metrics at a glance." },
    { title: "Assign Leads", description: "Navigate to 'Leads Assign' to distribute leads among your sales team members." },
  ]

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-foreground mb-6">How to Use CRM TeamGrowFast</h1>

      <div className="space-y-4">
        {steps.map((step, index) => (
          <div key={step.title} className="bg-card rounded-xl border border-border p-5">
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold shrink-0">
                {index + 1}
              </div>
              <div>
                <h3 className="font-semibold text-card-foreground mb-1">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
