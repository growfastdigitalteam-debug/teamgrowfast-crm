"use client"

import React, { createContext, useContext, useState, type ReactNode } from "react"
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
  MessageSquare,
  Building,
  Newspaper,
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
type UserRole = "admin" | "user" | null
type PageType =
  | "dashboard"
  | "categorys"
  | "leads-center"
  | "leads-assign"
  | "property-manager"
  | "user-list"
  | "how-to-use"
  | "settings"
  | "companies"

interface User {
  username: string
  role: UserRole
  displayName: string
  companyId?: number
  company?: string
}

interface Company {
  id: number
  name: string
  adminEmail: string
  password: string
  status: "Active" | "Blocked"
  createdAt: string
}

interface Remark {
  id: string
  text: string
  date: string
  author: string
}

interface Lead {
  id: number
  companyId: number
  fullName: string
  mobile: string
  whatsapp: string
  location: string
  flatConfig: string
  source: string
  category: string
  status: string
  remarks: string
  remarksHistory: Remark[]
  assignedAgent: string
  createdAt: string
}

interface Category {
  id: number
  companyId: number
  name: string
  color: string
}

interface Source {
  id: number
  companyId: number
  name: string
  color: string
}

interface Team {
  id: number
  companyId: number
  name: string
  color: string
}

interface ActivityType {
  id: number
  companyId: number
  name: string
  color: string
}

interface CRMUser {
  id: number
  companyId: number
  name: string
  email: string
  role: string
  status: "Active" | "Blocked"
}

interface Property {
  id: number
  name: string
  location: string
  configurations: string
  status: "Upcoming" | "Ongoing" | "Ready to Move" | "Sold Out"
}

// ============================================
// INITIAL DATA
// ============================================
const initialCompanies: Company[] = [
  { id: 1, name: "Sukoon Residency", adminEmail: "admin@sukoon.com", password: "sukoon123", status: "Active", createdAt: "2024-01-15" },
  { id: 2, name: "Test Builders", adminEmail: "admin@testbuilders.com", password: "testbuilders123", status: "Active", createdAt: "2024-02-20" },
  { id: 3, name: "Horizon Developers", adminEmail: "admin@horizon.com", password: "horizon123", status: "Blocked", createdAt: "2024-03-10" },
]

const initialCategories: Category[] = [
  { id: 1, companyId: 1, name: "Hot Lead", color: "#ef4444" },
  { id: 2, companyId: 1, name: "Warm Lead", color: "#f59e0b" },
  { id: 3, companyId: 1, name: "Cold Lead", color: "#3b82f6" },
  { id: 4, companyId: 1, name: "Converted", color: "#22c55e" },
  { id: 5, companyId: 2, name: "Investment", color: "#3b82f6" },
  { id: 6, companyId: 2, name: "Residential", color: "#22c55e" },
]

const initialSources: Source[] = [
  { id: 1, companyId: 1, name: "Facebook", color: "#1877f2" },
  { id: 2, companyId: 1, name: "Google Ads", color: "#ea4335" },
  { id: 3, companyId: 1, name: "WhatsApp", color: "#25d366" },
  { id: 4, companyId: 1, name: "Cold Calling", color: "#6366f1" },
  { id: 5, companyId: 1, name: "Walk-in", color: "#f59e0b" },
  { id: 6, companyId: 1, name: "Newspaper", color: "#64748b" },
  { id: 7, companyId: 2, name: "Referral", color: "#f59e0b" },
  { id: 8, companyId: 2, name: "Social Media", color: "#1877f2" },
]

const initialTeams: Team[] = [
  { id: 1, companyId: 1, name: "Sales Team A", color: "#8b5cf6" },
  { id: 2, companyId: 1, name: "Sales Team B", color: "#06b6d4" },
  { id: 3, companyId: 1, name: "Support Team", color: "#f97316" },
  { id: 4, companyId: 2, name: "Direct Sales", color: "#8b5cf6" },
]

const initialActivityTypes: ActivityType[] = [
  { id: 1, companyId: 1, name: "Interested", color: "#22c55e" },
  { id: 2, companyId: 1, name: "Visited Client", color: "#fbbf24" },
  { id: 3, companyId: 1, name: "Junk Lead", color: "#ef4444" },
  { id: 4, companyId: 1, name: "Flat Sold", color: "#3b82f6" },
  { id: 5, companyId: 1, name: "Not Interested", color: "#991b1b" },
  { id: 6, companyId: 1, name: "Need to Followup", color: "#ec4899" },
  { id: 7, companyId: 2, name: "Interested", color: "#22c55e" },
  { id: 8, companyId: 2, name: "Not Interested", color: "#ef4444" },
]

const initialLeads: Lead[] = [
  {
    id: 1,
    companyId: 1,
    fullName: "Faisal Ahmed",
    mobile: "9876543210",
    whatsapp: "9876543210",
    location: "Mumbai",
    flatConfig: "2BHK",
    source: "Facebook",
    category: "Hot Lead",
    status: "Interested",
    remarks: "Very interested in luxury plots.",
    remarksHistory: [
      { id: "101", text: "Very interested in luxury plots.", date: "2024-01-20T10:00:00Z", author: "John Smith" }
    ],
    assignedAgent: "John Smith",
    createdAt: "2024-01-20"
  },
  {
    id: 2,
    companyId: 2,
    fullName: "Rahul Kumar",
    mobile: "9988776655",
    whatsapp: "9988776655",
    location: "Delhi",
    flatConfig: "3BHK",
    source: "Referral",
    category: "Investment",
    status: "Interested",
    remarks: "Wants to invest in commercial.",
    remarksHistory: [
      { id: "102", text: "Wants to invest in commercial.", date: "2024-02-01T11:00:00Z", author: "Direct Sales" }
    ],
    assignedAgent: "",
    createdAt: "2024-02-01"
  }
]

const initialUsers: CRMUser[] = [
  { id: 1, companyId: 1, name: "John Smith", email: "john@sukoon.com", role: "Sales Agent", status: "Active" },
  { id: 2, companyId: 1, name: "Sarah Johnson", email: "sarah@sukoon.com", role: "Team Lead", status: "Active" },
  { id: 3, companyId: 2, name: "Michael Test", email: "michael@test.com", role: "Manager", status: "Active" },
]



// ============================================
// DATA CONTEXT
// ============================================
interface DataContextType {
  companies: Company[]
  setCompanies: React.Dispatch<React.SetStateAction<Company[]>>
  leads: Lead[]
  setLeads: React.Dispatch<React.SetStateAction<Lead[]>>
  categories: Category[]
  setCategories: React.Dispatch<React.SetStateAction<Category[]>>
  sources: Source[]
  setSources: React.Dispatch<React.SetStateAction<Source[]>>
  teams: Team[]
  setTeams: React.Dispatch<React.SetStateAction<Team[]>>
  activityTypes: ActivityType[]
  setActivityTypes: React.Dispatch<React.SetStateAction<ActivityType[]>>
  users: CRMUser[]
  setUsers: React.Dispatch<React.SetStateAction<CRMUser[]>>
}

const DataContext = createContext<DataContextType | undefined>(undefined)

function DataProvider({ children }: { children: ReactNode }) {
  const [companies, setCompanies] = useState<Company[]>(initialCompanies)
  const [leads, setLeads] = useState<Lead[]>(initialLeads)
  const [categories, setCategories] = useState<Category[]>(initialCategories)
  const [sources, setSources] = useState<Source[]>(initialSources)
  const [teams, setTeams] = useState<Team[]>(initialTeams)
  const [activityTypes, setActivityTypes] = useState<ActivityType[]>(initialActivityTypes)
  const [users, setUsers] = useState<CRMUser[]>(initialUsers)

  return (
    <DataContext.Provider value={{
      companies, setCompanies,
      leads, setLeads,
      categories, setCategories,
      sources, setSources,
      teams, setTeams,
      activityTypes, setActivityTypes,
      users, setUsers,
    }}>
      {children}
    </DataContext.Provider>
  )
}

function useData() {
  const context = useContext(DataContext)
  if (!context) {
    throw new Error("useData must be used within a DataProvider")
  }
  return context
}

// ============================================
// MENU ITEMS
// ============================================
const menuItems = [
  { id: "dashboard" as const, label: "Dashboard", icon: LayoutDashboard },
  { id: "categorys" as const, label: "Categorys", icon: FolderTree },
  { id: "add-lead" as const, label: "Add New Leads", icon: UserPlus },
  { id: "leads-center" as const, label: "Leads Center", icon: Users },
  { id: "leads-assign" as const, label: "Leads Assign", icon: UserCheck },
  { id: "property-manager" as const, label: "Property Manager", icon: Building2 },
  { id: "user-list" as const, label: "User List", icon: UserCog },
  { id: "how-to-use" as const, label: "How to use", icon: HelpCircle },
]

const adminMenuItems = [
  { id: "companies" as const, label: "Companies", icon: Building2 },
]

// ============================================
// MAIN APP
// ============================================
export default function CRMApp() {
  return (
    <DataProvider>
      <CRMAppContent />
    </DataProvider>
  )
}

function CRMAppContent() {
  const [user, setUser] = useState<User | null>(null)
  const { companies } = useData()

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser)
  }

  const handleLogout = () => {
    setUser(null)
  }

  if (!user) {
    return <LoginPage onLogin={handleLogin} companies={companies} />
  }

  if (user.role === "admin") {
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    setTimeout(() => {
      // Super Admin
      if (username === "admin" && password === "admin123") {
        onLogin({ username: "admin", role: "admin", displayName: "Super Admin" })
        setIsLoading(false)
        return
      }

      // Hardcoded test user
      if (username === "test" && password === "test123") {
        onLogin({ username: "test", role: "user", displayName: "Test User", company: "Sukoon Residency", companyId: 1 })
        setIsLoading(false)
        return
      }

      // Check dynamically created companies
      const matchedCompany = companies.find(
        (c) => c.adminEmail === username && c.password === password && c.status === "Active"
      )

      if (matchedCompany) {
        onLogin({
          username: matchedCompany.adminEmail,
          role: "user",
          displayName: matchedCompany.name,
          company: matchedCompany.name,
          companyId: matchedCompany.id,
        })
        setIsLoading(false)
        return
      }

      setError("Invalid credentials")
      setIsLoading(false)
    }, 500)
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="border-border shadow-lg">
          <CardHeader className="text-center pb-2">
            <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center mx-auto mb-4">
              <Building2 className="w-8 h-8 text-primary-foreground" />
            </div>
            <CardTitle className="text-2xl font-bold">CRM TeamGrowFast</CardTitle>
            <CardDescription>Sign in to your account to continue</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-11 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg text-center">
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full h-11" disabled={isLoading}>
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            <div className="mt-6 p-4 bg-muted/50 rounded-lg">
              <p className="text-xs text-muted-foreground mb-2 font-medium">Demo Credentials:</p>
              <div className="text-xs text-muted-foreground space-y-1">
                <p>Admin: <span className="font-mono">admin / admin123</span></p>
                <p>User: <span className="font-mono">test / test123</span></p>
              </div>
            </div>
          </CardContent>
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
    <div className="flex h-screen bg-background">
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setMobileMenuOpen(false)} />
      )}

      <aside className={cn(
        "fixed lg:static inset-y-0 left-0 z-50 w-64 bg-sidebar border-r border-sidebar-border flex flex-col transition-transform duration-300",
        mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className="h-16 flex items-center justify-between px-6 border-b border-sidebar-border">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Building2 className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg text-sidebar-foreground">Super Admin</span>
          </div>
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMobileMenuOpen(false)}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {adminMenuItems.map((item) => {
            const isActive = activePage === item.id
            const Icon = item.icon
            return (
              <button
                key={item.id}
                onClick={() => { setActivePage(item.id); setMobileMenuOpen(false) }}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                  isActive ? "bg-sidebar-primary text-sidebar-primary-foreground" : "hover:bg-sidebar-accent text-sidebar-foreground"
                )}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </button>
            )
          })}
          <button
            onClick={() => { setActivePage("settings"); setMobileMenuOpen(false) }}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
              activePage === "settings" ? "bg-sidebar-primary text-sidebar-primary-foreground" : "hover:bg-sidebar-accent text-sidebar-foreground"
            )}
          >
            <Settings className="w-5 h-5" />
            Settings
          </button>
        </nav>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-card border-b border-border flex items-center justify-between px-4 lg:px-6 shrink-0">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMobileMenuOpen(true)}>
              <Menu className="w-5 h-5" />
            </Button>
            <h1 className="text-lg font-semibold text-foreground">Super Admin Panel</h1>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2">
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="bg-primary text-primary-foreground text-sm">SA</AvatarFallback>
                </Avatar>
                <span className="hidden sm:inline font-medium">{user.displayName}</span>
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setActivePage("settings")}>
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onLogout} className="text-destructive">
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        <main className="flex-1 p-4 lg:p-6 overflow-y-auto">
          {activePage === "companies" && (
            <CompaniesView addCompanyOpen={addCompanyOpen} setAddCompanyOpen={setAddCompanyOpen} />
          )}
          {activePage === "settings" && <SettingsView />}
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
  const { companies, setCompanies, setCategories, setSources, setActivityTypes, setTeams } = useData()
  const [newCompanyName, setNewCompanyName] = useState("")
  const [newCompanyEmail, setNewCompanyEmail] = useState("")
  const [newCompanyPassword, setNewCompanyPassword] = useState("")
  const [viewDetailsCompany, setViewDetailsCompany] = useState<Company | null>(null)
  const [showCompanyPassword, setShowCompanyPassword] = useState(false)
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const [editCompany, setEditCompany] = useState<Company | null>(null)

  const generateSecurePassword = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%"
    let password = ""
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setNewCompanyPassword(password)
  }

  const handleAddCompany = () => {
    if (newCompanyName && newCompanyEmail && newCompanyPassword) {
      const newCompanyId = Math.max(...companies.map(c => c.id), 0) + 1
      const newCompany: Company = {
        id: newCompanyId,
        name: newCompanyName,
        adminEmail: newCompanyEmail,
        password: newCompanyPassword,
        status: "Active",
        createdAt: new Date().toISOString().split("T")[0],
      }

      // 1. Add the company
      setCompanies([...companies, newCompany])

      const timestamp = Date.now()

      // 2. Add default Categories
      const defaultCategories: Category[] = [
        { id: timestamp + 1, companyId: newCompanyId, name: "Hot Lead", color: "#ef4444" },
        { id: timestamp + 2, companyId: newCompanyId, name: "Warm Lead", color: "#f59e0b" },
        { id: timestamp + 3, companyId: newCompanyId, name: "Cold Lead", color: "#3b82f6" },
        { id: timestamp + 4, companyId: newCompanyId, name: "Converted", color: "#22c55e" },
      ]
      setCategories(prev => [...prev, ...defaultCategories])

      // 3. Add default Sources
      const defaultSources: Source[] = [
        { id: timestamp + 5, companyId: newCompanyId, name: "Facebook", color: "#1877f2" },
        { id: timestamp + 6, companyId: newCompanyId, name: "Google Ads", color: "#ea4335" },
        { id: timestamp + 7, companyId: newCompanyId, name: "WhatsApp", color: "#25d366" },
        { id: timestamp + 8, companyId: newCompanyId, name: "Cold Calling", color: "#6366f1" },
        { id: timestamp + 9, companyId: newCompanyId, name: "Walk-in", color: "#f59e0b" },
        { id: timestamp + 10, companyId: newCompanyId, name: "Newspaper", color: "#64748b" },
      ]
      setSources(prev => [...prev, ...defaultSources])

      // 4. Add default Activity Types (Lead Status)
      const defaultActivityTypes: ActivityType[] = [
        { id: timestamp + 11, companyId: newCompanyId, name: "Interested", color: "#22c55e" },
        { id: timestamp + 12, companyId: newCompanyId, name: "Visited Client", color: "#fbbf24" },
        { id: timestamp + 13, companyId: newCompanyId, name: "Junk Lead", color: "#ef4444" },
        { id: timestamp + 14, companyId: newCompanyId, name: "Flat Sold", color: "#3b82f6" },
        { id: timestamp + 15, companyId: newCompanyId, name: "Not Interested", color: "#991b1b" },
        { id: timestamp + 16, companyId: newCompanyId, name: "Need to Followup", color: "#ec4899" },
      ]
      setActivityTypes(prev => [...prev, ...defaultActivityTypes])

      // 5. Add default Teams
      const defaultTeams: Team[] = [
        { id: timestamp + 17, companyId: newCompanyId, name: "Sales Team A", color: "#8b5cf6" },
        { id: timestamp + 18, companyId: newCompanyId, name: "Sales Team B", color: "#06b6d4" },
        { id: timestamp + 19, companyId: newCompanyId, name: "Support Team", color: "#f97316" },
      ]
      setTeams(prev => [...prev, ...defaultTeams])

      setNewCompanyName("")
      setNewCompanyEmail("")
      setNewCompanyPassword("")
      setAddCompanyOpen(false)
    }
  }

  const handleResetPassword = (companyId: number) => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%"
    let newPass = ""
    for (let i = 0; i < 12; i++) {
      newPass += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setCompanies(companies.map(c => c.id === companyId ? { ...c, password: newPass } : c))
    if (viewDetailsCompany?.id === companyId) {
      setViewDetailsCompany({ ...viewDetailsCompany, password: newPass })
    }
  }

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text)
    setCopiedField(field)
    setTimeout(() => setCopiedField(null), 2000)
  }

  const handleDeleteCompany = (id: number) => {
    const confirmation = window.prompt("SECURITY CHECK: Type 'delete' to confirm deletion of this company.")
    if (confirmation === "delete") {
      setCompanies(companies.filter((c) => c.id !== id))
    } else {
      alert("Deletion cancelled. You must type 'delete' exactly.")
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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Registered Companies</h1>
          <p className="text-muted-foreground">Manage all tenant companies</p>
        </div>
        <Dialog open={addCompanyOpen} onOpenChange={setAddCompanyOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Add New Company
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Company</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name</Label>
                <Input id="companyName" placeholder="Enter company name" value={newCompanyName} onChange={(e) => setNewCompanyName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="companyEmail">Admin Email</Label>
                <Input id="companyEmail" type="email" placeholder="Enter admin email" value={newCompanyEmail} onChange={(e) => setNewCompanyEmail(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="companyPassword">Password</Label>
                <div className="flex gap-2">
                  <Input id="companyPassword" type="text" placeholder="Enter password" value={newCompanyPassword} onChange={(e) => setNewCompanyPassword(e.target.value)} className="flex-1" />
                  <Button type="button" variant="outline" onClick={generateSecurePassword} className="gap-2 shrink-0 bg-transparent">
                    <KeyRound className="w-4 h-4" />
                    Generate
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">Click Generate to create a secure password</p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setAddCompanyOpen(false)}>Cancel</Button>
              <Button onClick={handleAddCompany} disabled={!newCompanyName || !newCompanyEmail || !newCompanyPassword}>Add Company</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Company Name</TableHead>
                <TableHead>Admin Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {companies.map((company) => (
                <TableRow key={company.id}>
                  <TableCell className="font-medium">{company.name}</TableCell>
                  <TableCell>{company.adminEmail}</TableCell>
                  <TableCell>
                    <Badge
                      variant={company.status === "Active" ? "default" : "destructive"}
                      className={cn(company.status === "Active" ? "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20" : "")}
                    >
                      {company.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{company.createdAt}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="sm" onClick={() => setViewDetailsCompany(company)} title="View Details">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => setEditCompany(company)} title="Edit">
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleToggleStatus(company.id)} title={company.status === "Active" ? "Block" : "Activate"}>
                        <LogIn className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteCompany(company.id)} className="text-destructive hover:text-destructive" title="Delete">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* View Details Modal */}
      <Dialog open={!!viewDetailsCompany} onOpenChange={(open) => !open && setViewDetailsCompany(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Company Access Details</DialogTitle>
          </DialogHeader>
          {viewDetailsCompany && (
            <div className="space-y-4 py-4">
              <div className="space-y-3">
                <div className="space-y-1">
                  <Label className="text-muted-foreground text-xs uppercase tracking-wide">Company Name</Label>
                  <p className="font-semibold text-foreground">{viewDetailsCompany.name}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-muted-foreground text-xs uppercase tracking-wide">Login URL</Label>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 bg-muted px-3 py-2 rounded text-sm font-mono break-all">
                      {typeof window !== "undefined" ? window.location.origin : "https://crm.teamgrowfast.com"}
                    </code>
                    <Button variant="ghost" size="sm" onClick={() => copyToClipboard(typeof window !== "undefined" ? window.location.origin : "https://crm.teamgrowfast.com", "url")} title="Copy URL">
                      {copiedField === "url" ? <span className="text-emerald-500 text-xs">Copied!</span> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-muted-foreground text-xs uppercase tracking-wide">Admin Email (Username)</Label>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 bg-muted px-3 py-2 rounded text-sm font-mono">{viewDetailsCompany.adminEmail}</code>
                    <Button variant="ghost" size="sm" onClick={() => copyToClipboard(viewDetailsCompany.adminEmail, "email")} title="Copy Email">
                      {copiedField === "email" ? <span className="text-emerald-500 text-xs">Copied!</span> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-muted-foreground text-xs uppercase tracking-wide">Password</Label>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 bg-muted px-3 py-2 rounded text-sm font-mono">
                      {showCompanyPassword ? viewDetailsCompany.password : "••••••••••••"}
                    </code>
                    <Button variant="ghost" size="sm" onClick={() => setShowCompanyPassword(!showCompanyPassword)} title={showCompanyPassword ? "Hide Password" : "Show Password"}>
                      {showCompanyPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => copyToClipboard(viewDetailsCompany.password, "password")} title="Copy Password">
                      {copiedField === "password" ? <span className="text-emerald-500 text-xs">Copied!</span> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-muted-foreground text-xs uppercase tracking-wide">Status</Label>
                  <div>
                    <Badge variant={viewDetailsCompany.status === "Active" ? "default" : "destructive"} className={cn(viewDetailsCompany.status === "Active" ? "bg-emerald-500/10 text-emerald-600" : "")}>
                      {viewDetailsCompany.status}
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="border-t border-border pt-4">
                <Button variant="outline" onClick={() => handleResetPassword(viewDetailsCompany.id)} className="gap-2 w-full">
                  <RefreshCw className="w-4 h-4" />
                  Reset Password
                </Button>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewDetailsCompany(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Company Modal */}
      <Dialog open={!!editCompany} onOpenChange={(open) => !open && setEditCompany(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Company</DialogTitle>
          </DialogHeader>
          {editCompany && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Company Name</Label>
                <Input value={editCompany.name} onChange={(e) => setEditCompany({ ...editCompany, name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Admin Email</Label>
                <Input value={editCompany.adminEmail} onChange={(e) => setEditCompany({ ...editCompany, adminEmail: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Password</Label>
                <Input value={editCompany.password} onChange={(e) => setEditCompany({ ...editCompany, password: e.target.value })} />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditCompany(null)}>Cancel</Button>
            <Button onClick={handleEditSave}>Save Changes</Button>
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
    <div className="flex h-screen bg-background">
      {mobileMenuOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setMobileMenuOpen(false)} />}

      <aside className={cn(
        "fixed lg:static inset-y-0 left-0 z-50 w-64 bg-sidebar border-r border-sidebar-border flex flex-col transition-transform duration-300",
        mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className="h-16 flex items-center justify-between px-6 border-b border-sidebar-border">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Building2 className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg text-sidebar-foreground">CRM TeamGrowFast</span>
          </div>
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMobileMenuOpen(false)}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = activePage === item.id
            const Icon = item.icon

            if (item.id === "add-lead") {
              return (
                <button
                  key={item.id}
                  onClick={() => setAddLeadOpen(true)}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors hover:bg-sidebar-accent text-sidebar-foreground"
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                </button>
              )
            }

            return (
              <button
                key={item.id}
                onClick={() => handleMenuClick(item.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                  isActive ? "bg-sidebar-primary text-sidebar-primary-foreground" : "hover:bg-sidebar-accent text-sidebar-foreground"
                )}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </button>
            )
          })}
        </nav>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-card border-b border-border flex items-center justify-between px-4 lg:px-6 shrink-0">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMobileMenuOpen(true)}>
              <Menu className="w-5 h-5" />
            </Button>
            <div className="hidden sm:block">
              <p className="text-lg font-semibold text-foreground">
                Welcome, {user.displayName}
                {user.company && <span className="text-muted-foreground font-normal"> ({user.company})</span>}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search..." className="pl-10 w-48 lg:w-64 bg-background" />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                      {user.displayName.split(" ").map(n => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden sm:inline font-medium">{user.displayName}</span>
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setActivePage("settings")}>
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onLogout} className="text-destructive">
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-6 overflow-y-auto">
          {activePage === "dashboard" && <DashboardView companyId={user.companyId || 1} onStatusClick={handleStatusClick} />}
          {activePage === "categorys" && <CategorysView companyId={user.companyId || 1} />}
          {activePage === "settings" && <SettingsView companyId={user.companyId || 1} />}
          {activePage === "leads-center" && <LeadsCenterView companyId={user.companyId || 1} userName={user.displayName} initialStatus={leadStatusFilter} />}
          {activePage === "leads-assign" && <LeadsAssignView companyId={user.companyId || 1} />}
          {activePage === "user-list" && <UserListView companyId={user.companyId || 1} />}
          {activePage === "property-manager" && <PlaceholderView title="Property Manager" />}
          {activePage === "how-to-use" && <HowToUseView />}
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
  const { leads, sources, activityTypes } = useData()

  // Filter data by Company ID
  const companyLeads = leads.filter(l => l.companyId === companyId)
  const companySources = sources.filter(s => s.companyId === companyId)
  const companyActivityTypes = activityTypes.filter(at => at.companyId === companyId)

  // Calculate counts for each activity type plus total leads
  const activityStats = [
    ...companyActivityTypes.map(at => ({
      title: at.name,
      count: companyLeads.filter(l => l.status === at.name).length,
      color: at.color,
    })),
    { title: "Total Leads", count: companyLeads.length, color: "#94a3b8" },
  ]

  // Helper to determine if text should be light or dark based on background
  const getTextColor = (hexColor: string) => {
    const hex = hexColor.replace("#", "")
    const r = parseInt(hex.substring(0, 2), 16)
    const g = parseInt(hex.substring(2, 4), 16)
    const b = parseInt(hex.substring(4, 6), 16)
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
    return luminance > 0.5 ? "text-gray-900" : "text-white"
  }

  // Calculate lead counts by source
  const sourceIcons: Record<string, React.ElementType> = {
    "Facebook": Facebook,
    "Google Ads": Globe,
    "Cold Calling": Phone,
    "WhatsApp": MessageSquare,
    "Walk-in": Building,
    "Newspaper": Newspaper,
  }

  const sourceColors: Record<string, string> = {
    "Facebook": "bg-blue-600",
    "Google Ads": "bg-red-500",
    "Cold Calling": "bg-green-600",
    "WhatsApp": "bg-emerald-500",
    "Walk-in": "bg-amber-500",
    "Newspaper": "bg-slate-600",
  }

  const leadSources = companySources.map(s => ({
    name: s.name,
    icon: sourceIcons[s.name] || Globe,
    count: companyLeads.filter(l => l.source === s.name).length,
    color: sourceColors[s.name] || "bg-slate-500",
  }))

  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-xl font-semibold text-foreground mb-4">Activity Types</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {activityStats.map((stat) => (
            <div
              key={stat.title}
              onClick={() => onStatusClick && onStatusClick(stat.title === "Total Leads" ? "" : stat.title)}
              className="rounded-xl p-5 transition-transform hover:scale-105 cursor-pointer"
              style={{ backgroundColor: stat.color }}
            >
              <p className={cn("text-sm font-medium opacity-90", getTextColor(stat.color))}>{stat.title}</p>
              <p className={cn("text-4xl font-bold mt-2", getTextColor(stat.color))}>{stat.count.toLocaleString()}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-foreground mb-4">Lead Sources</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {leadSources.map((source) => {
            const Icon = source.icon
            return (
              <div key={source.name} className="bg-card rounded-xl p-5 border border-border hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className={cn("w-12 h-12 rounded-lg flex items-center justify-center", source.color)}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-card-foreground">{source.name}</p>
                    <p className="text-2xl font-bold text-card-foreground">{source.count.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </section>
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
  const { leads, setLeads, categories, sources, activityTypes } = useData()
  const [fullName, setFullName] = useState("")
  const [mobile, setMobile] = useState("")
  const [whatsapp, setWhatsapp] = useState("")
  const [location, setLocation] = useState("")
  const [flatConfig, setFlatConfig] = useState("")
  const [source, setSource] = useState("")
  const [category, setCategory] = useState("")
  const [status, setStatus] = useState("")
  const [remarks, setRemarks] = useState("")

  const handleSubmit = () => {
    if (fullName && mobile) {
      const newLead: Lead = {
        id: Math.max(...leads.map(l => l.id), 0) + 1,
        companyId: companyId,
        fullName,
        mobile,
        whatsapp,
        location,
        flatConfig,
        source,
        category,
        status: status || "Interested",
        remarks, // Latest remark
        remarksHistory: remarks ? [{
          id: Date.now().toString(),
          text: remarks,
          date: new Date().toISOString(),
          author: userName
        }] : [],
        assignedAgent: "",
        createdAt: new Date().toISOString().split("T")[0],
      }
      setLeads([...leads, newLead])
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Add New Lead</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name *</Label>
            <Input id="fullName" placeholder="Enter full name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="mobile">Mobile Number *</Label>
            <Input id="mobile" placeholder="Enter mobile number" type="tel" value={mobile} onChange={(e) => setMobile(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="whatsapp">WhatsApp Number</Label>
            <Input id="whatsapp" placeholder="Enter WhatsApp number" type="tel" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input id="location" placeholder="Enter location" value={location} onChange={(e) => setLocation(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="flatConfig">Flat Configuration</Label>
            <Select value={flatConfig} onValueChange={setFlatConfig}>
              <SelectTrigger>
                <SelectValue placeholder="Select configuration" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1 BHK">1 BHK</SelectItem>
                <SelectItem value="2 BHK">2 BHK</SelectItem>
                <SelectItem value="3 BHK">3 BHK</SelectItem>
                <SelectItem value="4 BHK">4 BHK</SelectItem>
                <SelectItem value="Penthouse">Penthouse</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="source">Leads Source</Label>
            <Select value={source} onValueChange={setSource}>
              <SelectTrigger>
                <SelectValue placeholder="Select source" />
              </SelectTrigger>
              <SelectContent>
                {sources.map((s) => (
                  <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Leads Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Lead Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {activityTypes.map((at) => (
                  <SelectItem key={at.id} value={at.name}>{at.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="remarks">Remarks</Label>
            <Textarea id="remarks" placeholder="Enter any additional remarks..." className="min-h-24" value={remarks} onChange={(e) => setRemarks(e.target.value)} />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={!fullName || !mobile}>Submit Form</Button>
        </DialogFooter>
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
  const { leads, setLeads, categories, sources, activityTypes } = useData()
  const [editLead, setEditLead] = useState<Lead | null>(null)
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
  })

  const companyCategories = categories.filter(c => c.companyId === companyId)
  const companySources = sources.filter(s => s.companyId === companyId)
  const companyActivityTypes = activityTypes.filter(at => at.companyId === companyId)

  const handleDeleteLead = (id: number) => {
    const confirmation = window.prompt("SECURITY CHECK: Type 'delete' to confirm deletion.")
    if (confirmation === "delete") {
      setLeads(leads.filter(l => l.id !== id))
    } else {
      alert("Deletion cancelled. You must type 'delete' exactly.")
    }
  }

  const handleEditSave = () => {
    if (editLead) {
      let updatedLead = { ...editLead }

      if (newRemark.trim()) {
        const remarkObj: Remark = {
          id: Date.now().toString(),
          text: newRemark.trim(),
          date: new Date().toISOString(),
          author: userName
        }
        updatedLead.remarksHistory = [remarkObj, ...(updatedLead.remarksHistory || [])]
        updatedLead.remarks = newRemark.trim() // Update current remark for list display
      }

      setLeads(leads.map(l => l.id === editLead.id ? updatedLead : l))
      setEditLead(null)
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

      <Card>
        <CardContent className="p-0">
          {companyLeads.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <UserX className="w-12 h-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No leads yet. Add your first lead!</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Mobile</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Recent Remark</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {companyLeads.map((lead) => (
                  <TableRow key={lead.id}>
                    <TableCell className="font-medium">{lead.fullName}</TableCell>
                    <TableCell>{lead.mobile}</TableCell>
                    <TableCell>{lead.source || "-"}</TableCell>
                    <TableCell>{lead.category || "-"}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{lead.status}</Badge>
                    </TableCell>
                    <TableCell>{lead.createdAt}</TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {lead.remarks || "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="sm" onClick={() => setEditLead(lead)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteLead(lead.id)} className="text-destructive hover:text-destructive">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit Lead Modal */}
      <Dialog open={!!editLead} onOpenChange={(open) => !open && setEditLead(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Lead</DialogTitle>
          </DialogHeader>
          {editLead && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input value={editLead.fullName} onChange={(e) => setEditLead({ ...editLead, fullName: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Mobile</Label>
                <Input value={editLead.mobile} onChange={(e) => setEditLead({ ...editLead, mobile: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Source</Label>
                <Select value={editLead.source} onValueChange={(v) => setEditLead({ ...editLead, source: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {companySources.map((s) => <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={editLead.category} onValueChange={(v) => setEditLead({ ...editLead, category: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {companyCategories.map((c) => <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={editLead.status} onValueChange={(v) => setEditLead({ ...editLead, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {companyActivityTypes.map((at) => <SelectItem key={at.id} value={at.name}>{at.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Location</Label>
                <Input value={editLead.location} onChange={(e) => setEditLead({ ...editLead, location: e.target.value })} />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label>Add New Remark</Label>
                <Textarea
                  placeholder="Type new remark here..."
                  value={newRemark}
                  onChange={(e) => setNewRemark(e.target.value)}
                />
              </div>

              {editLead.remarksHistory && editLead.remarksHistory.length > 0 && (
                <div className="space-y-3 sm:col-span-2 mt-4">
                  <Label className="text-lg font-semibold">Remarks History</Label>
                  <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                    {editLead.remarksHistory.map((remark) => (
                      <div key={remark.id} className="p-3 bg-muted rounded-lg border border-border">
                        <div className="flex justify-between items-start mb-1">
                          <span className="font-bold text-sm text-primary">{remark.author}</span>
                          <span className="text-xs text-muted-foreground">{new Date(remark.date).toLocaleString()}</span>
                        </div>
                        <p className="text-sm whitespace-pre-wrap">{remark.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditLead(null)}>Cancel</Button>
            <Button onClick={handleEditSave}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ============================================
// LEADS ASSIGN VIEW
// ============================================
// ============================================
// LEADS ASSIGN VIEW
// ============================================
function LeadsAssignView({ companyId }: { companyId: number }) {
  const { leads, setLeads, users } = useData()

  const handleAssign = (leadId: number, agentName: string) => {
    setLeads(leads.map(l => l.id === leadId ? { ...l, assignedAgent: agentName } : l))
  }

  const companyLeads = leads.filter(l => l.companyId === companyId)
  const companyUsers = users.filter(u => u.companyId === companyId)
  const unassignedLeads = companyLeads.filter(l => !l.assignedAgent)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Leads Assign</h1>
        <p className="text-muted-foreground">Assign leads to your team members</p>
      </div>

      <Card>
        <CardContent className="p-0">
          {companyLeads.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <UserX className="w-12 h-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No leads to assign</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Lead Name</TableHead>
                  <TableHead>Mobile</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {companyLeads.map((lead) => (
                  <TableRow key={lead.id}>
                    <TableCell className="font-medium">{lead.fullName}</TableCell>
                    <TableCell>{lead.mobile}</TableCell>
                    <TableCell><Badge variant="outline">{lead.status}</Badge></TableCell>
                    <TableCell>{lead.assignedAgent || <span className="text-muted-foreground">Unassigned</span>}</TableCell>
                    <TableCell className="text-right">
                      <Select value={lead.assignedAgent} onValueChange={(v) => handleAssign(lead.id, v)}>
                        <SelectTrigger className="w-40">
                          <SelectValue placeholder="Assign to..." />
                        </SelectTrigger>
                        <SelectContent>
                          {companyUsers.filter(u => u.status === "Active").map((u) => (
                            <SelectItem key={u.id} value={u.name}>{u.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {unassignedLeads.length > 0 && (
        <p className="text-sm text-muted-foreground">{unassignedLeads.length} lead(s) unassigned</p>
      )}
    </div>
  )
}

// ============================================
// USER LIST VIEW
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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">User List</h1>
          <p className="text-muted-foreground">Manage your team members</p>
        </div>
        <Dialog open={addUserOpen} onOpenChange={setAddUserOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="w-4 h-4" />Add User</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add New User</DialogTitle></DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input value={newUserName} onChange={(e) => setNewUserName(e.target.value)} placeholder="Enter name" />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input value={newUserEmail} onChange={(e) => setNewUserEmail(e.target.value)} placeholder="Enter email" type="email" />
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <Select value={newUserRole} onValueChange={setNewUserRole}>
                  <SelectTrigger><SelectValue placeholder="Select role" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Sales Agent">Sales Agent</SelectItem>
                    <SelectItem value="Team Lead">Team Lead</SelectItem>
                    <SelectItem value="Manager">Manager</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setAddUserOpen(false)}>Cancel</Button>
              <Button onClick={handleAddUser} disabled={!newUserName || !newUserEmail || !newUserRole}>Add User</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {companyUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell>
                    <Badge variant={user.status === "Active" ? "default" : "destructive"} className={cn(user.status === "Active" ? "bg-emerald-500/10 text-emerald-600" : "")}>
                      {user.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="sm" onClick={() => setEditUser(user)}><Pencil className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="sm" onClick={() => handleToggleStatus(user.id)}>
                        <LogIn className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteUser(user.id)} className="text-destructive hover:text-destructive">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit User Modal */}
      <Dialog open={!!editUser} onOpenChange={(open) => !open && setEditUser(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit User</DialogTitle></DialogHeader>
          {editUser && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input value={editUser.name} onChange={(e) => setEditUser({ ...editUser, name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input value={editUser.email} onChange={(e) => setEditUser({ ...editUser, email: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <Select value={editUser.role} onValueChange={(v) => setEditUser({ ...editUser, role: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Sales Agent">Sales Agent</SelectItem>
                    <SelectItem value="Team Lead">Team Lead</SelectItem>
                    <SelectItem value="Manager">Manager</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditUser(null)}>Cancel</Button>
            <Button onClick={handleEditSave}>Save Changes</Button>
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
// CATEGORYS VIEW (WITH STATE)
// ============================================
function CategorysView({ companyId }: { companyId: number }) {
  const { categories, setCategories, sources, setSources, teams, setTeams, activityTypes, setActivityTypes } = useData()

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Settings</h1>

      <Tabs defaultValue="activity-types" className="w-full">
        <TabsList className="bg-muted">
          <TabsTrigger value="activity-types">Activity Types</TabsTrigger>
          <TabsTrigger value="source">Lead Source</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
          <TabsTrigger value="category">Category</TabsTrigger>
        </TabsList>

        <TabsContent value="activity-types" className="mt-4">
          <CategoryTable
            companyId={companyId}
            data={activityTypes}
            setData={setActivityTypes}
            title="Activity Type"
            description="These statuses control the Dashboard tiles. Adding, editing or deleting items here will update the Dashboard cards."
          />
        </TabsContent>

        <TabsContent value="source" className="mt-4">
          <CategoryTable
            companyId={companyId}
            data={sources}
            setData={setSources}
            title="Lead Source"
            description="Lead sources appear in the Add Lead dropdown and Dashboard statistics."
          />
        </TabsContent>

        <TabsContent value="team" className="mt-4">
          <CategoryTable
            companyId={companyId}
            data={teams}
            setData={setTeams}
            title="Team"
            description="Teams are used for organizing agents and lead assignments."
          />
        </TabsContent>

        <TabsContent value="category" className="mt-4">
          <CategoryTable
            companyId={companyId}
            data={categories}
            setData={setCategories}
            title="Category"
            description="General lead segments for categorizing your leads."
          />
        </TabsContent>
      </Tabs>
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
  const [newItemColor, setNewItemColor] = useState("#000000")
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
      setNewItemColor("#000000")
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
    <div className="bg-card rounded-xl border border-border">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-card-foreground">{title} List</h3>
          {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
        </div>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1"><Plus className="w-4 h-4" />Add</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add New {title}</DialogTitle></DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" placeholder={`Enter ${title.toLowerCase()} name`} value={newItemName} onChange={(e) => setNewItemName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="color">Color (Hex)</Label>
                <div className="flex gap-2">
                  <Input id="color" placeholder="#000000" value={newItemColor} onChange={(e) => setNewItemColor(e.target.value)} className="flex-1" />
                  <input type="color" value={newItemColor} onChange={(e) => setNewItemColor(e.target.value)} className="w-10 h-10 rounded border border-border cursor-pointer" />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
              <Button onClick={handleAdd} disabled={!newItemName}>Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-16">SN</TableHead>
            <TableHead>Name</TableHead>
            <TableHead className="w-24">Color</TableHead>
            <TableHead className="w-32 text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {companyData.map((item, index) => (
            <TableRow key={item.id}>
              <TableCell className="font-medium">{index + 1}</TableCell>
              <TableCell>{item.name}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full border border-border" style={{ backgroundColor: item.color }} />
                  <span className="text-xs text-muted-foreground">{item.color}</span>
                </div>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-1">
                  <Button variant="ghost" size="sm" onClick={() => setEditItem(item)}><Pencil className="w-4 h-4" /></Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(item.id)} className="text-destructive hover:text-destructive"><Trash2 className="w-4 h-4" /></Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Edit Modal */}
      <Dialog open={!!editItem} onOpenChange={(open) => !open && setEditItem(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit {title}</DialogTitle></DialogHeader>
          {editItem && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input value={editItem.name} onChange={(e) => setEditItem({ ...editItem, name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Color</Label>
                <div className="flex gap-2">
                  <Input value={editItem.color} onChange={(e) => setEditItem({ ...editItem, color: e.target.value })} className="flex-1" />
                  <input type="color" value={editItem.color} onChange={(e) => setEditItem({ ...editItem, color: e.target.value })} className="w-10 h-10 rounded border border-border cursor-pointer" />
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditItem(null)}>Cancel</Button>
            <Button onClick={handleEditSave}>Save Changes</Button>
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
    { title: "Manage Categories", description: "Go to 'Categorys' to create and customize lead categories, sources, and team assignments." },
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
