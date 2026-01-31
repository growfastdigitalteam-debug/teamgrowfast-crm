"use client"

import React, { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { createBrowserClient } from '@supabase/ssr'
import { toast } from "sonner"

// ============================================
// TYPES
// ============================================
export interface Company {
    id: number
    name: string
    adminEmail: string
    password: string // Only kept for UI compatibility, not used for auth
    status: "Active" | "Blocked"
    createdAt: string
    tenantId?: string // Link to Supabase Tenant
}

export interface Lead {
    id: number
    db_id?: string // Supabase ID
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
    remarksHistory: any[]
    assignedAgent: string
    createdAt: string
    updatedAt: string
}

export interface SettingItem {
    id: number
    companyId: number
    name: string
    color: string
}

// Reuse existing interfaces
export type Category = SettingItem
export type Source = SettingItem
export type Team = SettingItem
export type ActivityType = SettingItem

export interface CRMUser {
    id: number
    companyId: number
    name: string
    email: string
    role: string
    status: "Active" | "Blocked"
}

// ============================================
// CONTEXT
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
    isLoading: boolean
    refreshData: () => Promise<void>
    addLead: (lead: Omit<Lead, "id" | "createdAt" | "updatedAt">) => Promise<boolean>
    updateLead: (id: number, updates: Partial<Lead>) => Promise<boolean>
    deleteLead: (id: number) => Promise<boolean>
}

const DataContext = createContext<DataContextType | undefined>(undefined)

export function SupabaseDataProvider({ children }: { children: ReactNode }) {
    // Local state (mirrors DB for UI speed)
    const [companies, setCompanies] = useState<Company[]>([])
    const [leads, setLeads] = useState<Lead[]>([])
    const [categories, setCategories] = useState<Category[]>([])
    const [sources, setSources] = useState<Source[]>([])
    const [teams, setTeams] = useState<Team[]>([])
    const [activityTypes, setActivityTypes] = useState<ActivityType[]>([])
    const [users, setUsers] = useState<CRMUser[]>([])
    const [isLoading, setIsLoading] = useState(true)

    // Supabase Client
    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // Fetch Data on Load
    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            setIsLoading(true)

            // 1. Get Current User & Tenant
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                setIsLoading(false)
                return
            }

            // 2. Get Public User Profile (for Tenant ID)
            const { data: publicUser } = await supabase
                .from('users')
                .select('tenant_id, role')
                .eq('id', user.id)
                .maybeSingle()

            if (!publicUser) return

            const tenantId = publicUser.tenant_id

            // 3. Fetch Settings (Categories, Sources, etc)
            const { data: settings } = await supabase
                .from('crm_settings')
                .select('*')
                .eq('tenant_id', tenantId)

            // Transform Settings
            const cats: Category[] = []
            const srcs: Source[] = []
            const stats: ActivityType[] = []
            const tms: Team[] = []

            settings?.forEach((s, index) => {
                const item = { id: index + 1, companyId: 1, name: s.name, color: s.color || '#cccccc' }
                if (s.type === 'category') cats.push(item)
                if (s.type === 'source') srcs.push(item)
                if (s.type === 'status') stats.push(item)
                if (s.type === 'team') tms.push(item)
            })

            setCategories(cats)
            setSources(srcs)
            setActivityTypes(stats)
            setTeams(tms)

            // 4. Fetch Leads
            const { data: dbLeads } = await supabase
                .from('leads')
                .select('*')
                .eq('tenant_id', tenantId)
                .order('created_at', { ascending: false })

            // Transform Leads
            const mappedLeads: Lead[] = dbLeads?.map((l, index) => ({
                id: index + 1, // UI needs number ID
                db_id: l.id,   // Keep real UUID
                companyId: 1,
                fullName: l.name,
                mobile: l.phone || "",
                whatsapp: l.alternate_phone || "",
                location: l.custom_fields?.location || "",
                flatConfig: l.custom_fields?.flatConfig || "",
                source: l.source || "",
                category: l.category || "",
                status: l.status || "New",
                remarks: l.notes || "",
                remarksHistory: l.custom_fields?.remarksHistory || [],
                assignedAgent: "Admin", // TODO: Fix assignment
                createdAt: l.created_at,
                updatedAt: l.updated_at
            })) || []

            setLeads(mappedLeads)

            // 5. Mock Companies/Users for UI compatibility
            // 5. Fetch Companies logic
            if (publicUser.role === 'superadmin' || user.email === 'admin@admin.com') {
                const { data: dbCompanies } = await supabase
                    .from('users')
                    .select('*')
                    .eq('role', 'admin') // Fetch all company admins

                if (dbCompanies) {
                    const mappedCompanies: Company[] = dbCompanies.map((u, index) => ({
                        id: u.id.length > 8 ? index + 1 : Number(u.id), // Handle UUID vs Number
                        name: u.full_name || "Unknown Company",
                        adminEmail: u.email || "",
                        password: "Encrypted", // Cannot decrypt Supabase passwords
                        status: "Active",
                        createdAt: u.created_at ? u.created_at.split("T")[0] : new Date().toISOString().split("T")[0],
                        tenantId: u.tenant_id
                    }))
                    setCompanies(mappedCompanies)
                }
            } else {
                // For normal user, set their own company
                setCompanies([{
                    id: 1,
                    name: "My Company",
                    adminEmail: user.email!,
                    password: "",
                    status: "Active",
                    createdAt: "2024-01-01",
                    tenantId
                }])
            }

            // Mock Users list (local only for now as requested leads focus)
            setUsers([{
                id: 1,
                companyId: 1,
                name: "Admin",
                email: user.email!,
                role: "Admin",
                status: "Active"
            }])

        } catch (error) {
            console.error("Data Load Error:", error)
            toast.error("Failed to load data")
        } finally {
            setIsLoading(false)
        }
    }

    // ==========================
    // CRUD OPERATIONS
    // ==========================

    const addLead = async (leadData: Omit<Lead, "id" | "createdAt" | "updatedAt">) => {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return false

            const { data: publicUser } = await supabase
                .from('users')
                .select('tenant_id')
                .eq('id', user.id)
                .single()

            if (!publicUser) return false

            // Insert into Supabase
            const { data, error } = await supabase
                .from('leads')
                .insert({
                    tenant_id: publicUser.tenant_id,
                    name: leadData.fullName,
                    phone: leadData.mobile,
                    alternate_phone: leadData.whatsapp,
                    source: leadData.source,
                    category: leadData.category,
                    status: leadData.status,
                    notes: leadData.remarks,
                    custom_fields: {
                        location: leadData.location,
                        flatConfig: leadData.flatConfig,
                        remarksHistory: leadData.remarksHistory
                    },
                    created_by: user.id
                })
                .select()
                .single()

            if (error) throw error

            toast.success("Lead Saved to Database! ☁️")
            await fetchData() // Refresh all data
            return true

        } catch (err: any) {
            console.error(err)
            toast.error("Save Failed: " + err.message)
            return false
        }
    }

    const updateLead = async (id: number, updates: Partial<Lead>) => {
        try {
            // Find UUID mapping
            const localLead = leads.find(l => l.id === id)
            if (!localLead?.db_id) return false

            const updatePayload: any = {}
            if (updates.fullName) updatePayload.name = updates.fullName
            if (updates.mobile) updatePayload.phone = updates.mobile
            if (updates.whatsapp) updatePayload.alternate_phone = updates.whatsapp
            if (updates.source) updatePayload.source = updates.source
            if (updates.category) updatePayload.category = updates.category
            if (updates.status) updatePayload.status = updates.status
            if (updates.remarks) updatePayload.notes = updates.remarks

            // Handle custom fields merge
            // We reconstruct the custom_fields object from local state + updates
            const newCustomFields = {
                location: updates.location !== undefined ? updates.location : localLead.location,
                flatConfig: updates.flatConfig !== undefined ? updates.flatConfig : localLead.flatConfig,
                remarksHistory: updates.remarksHistory !== undefined ? updates.remarksHistory : localLead.remarksHistory
            }

            // Only update custom_fields if any component of it changed or is part of updates
            if (updates.location || updates.flatConfig || updates.remarksHistory) {
                updatePayload.custom_fields = newCustomFields
            }

            const { error } = await supabase
                .from('leads')
                .update(updatePayload)
                .eq('id', localLead.db_id)

            if (error) throw error

            toast.success("Lead Updated! ⚡")
            await fetchData() // Refresh all data
            return true
        } catch (err) {
            console.error(err)
            toast.error("Update Failed")
            return false
        }
    }

    const deleteLead = async (id: number) => {
        try {
            const localLead = leads.find(l => l.id === id)
            if (!localLead?.db_id) return false

            const { error } = await supabase
                .from('leads')
                .delete()
                .eq('id', localLead.db_id)

            if (error) throw error

            toast.success("Lead Deleted 🗑️")
            await fetchData()
            return true
        } catch (err) {
            toast.error("Delete Failed")
            return false
        }
    }

    return (
        <DataContext.Provider value={{
            companies, setCompanies,
            leads, setLeads,
            categories, setCategories,
            sources, setSources,
            teams, setTeams,
            activityTypes, setActivityTypes,
            users, setUsers,
            isLoading,
            refreshData: fetchData,
            addLead,
            updateLead,
            deleteLead
        }}>
            {children}
        </DataContext.Provider>
    )
}

export function useData() {
    const context = useContext(DataContext)
    if (!context) {
        throw new Error("useData must be used within a SupabaseDataProvider")
    }
    return context
}
