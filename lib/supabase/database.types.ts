/**
 * TypeScript Database Types for Supabase
 * Auto-generated types based on your database schema
 * 
 * To regenerate these types, run:
 * npx supabase gen types typescript --project-id YOUR_PROJECT_ID > lib/supabase/database.types.ts
 */

export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            tenants: {
                Row: {
                    id: string
                    name: string
                    slug: string
                    domain: string | null
                    logo_url: string | null
                    subscription_plan: string
                    subscription_status: string
                    max_users: number
                    max_properties: number
                    settings: Json
                    created_at: string
                    updated_at: string
                    deleted_at: string | null
                }
                Insert: {
                    id?: string
                    name: string
                    slug: string
                    domain?: string | null
                    logo_url?: string | null
                    subscription_plan?: string
                    subscription_status?: string
                    max_users?: number
                    max_properties?: number
                    settings?: Json
                    created_at?: string
                    updated_at?: string
                    deleted_at?: string | null
                }
                Update: {
                    id?: string
                    name?: string
                    slug?: string
                    domain?: string | null
                    logo_url?: string | null
                    subscription_plan?: string
                    subscription_status?: string
                    max_users?: number
                    max_properties?: number
                    settings?: Json
                    created_at?: string
                    updated_at?: string
                    deleted_at?: string | null
                }
            }
            users: {
                Row: {
                    id: string
                    tenant_id: string
                    email: string
                    full_name: string | null
                    avatar_url: string | null
                    role: string
                    phone: string | null
                    is_active: boolean
                    last_login_at: string | null
                    preferences: Json
                    created_at: string
                    updated_at: string
                    deleted_at: string | null
                }
                Insert: {
                    id: string
                    tenant_id: string
                    email: string
                    full_name?: string | null
                    avatar_url?: string | null
                    role?: string
                    phone?: string | null
                    is_active?: boolean
                    last_login_at?: string | null
                    preferences?: Json
                    created_at?: string
                    updated_at?: string
                    deleted_at?: string | null
                }
                Update: {
                    id?: string
                    tenant_id?: string
                    email?: string
                    full_name?: string | null
                    avatar_url?: string | null
                    role?: string
                    phone?: string | null
                    is_active?: boolean
                    last_login_at?: string | null
                    preferences?: Json
                    created_at?: string
                    updated_at?: string
                    deleted_at?: string | null
                }
            }
            properties: {
                Row: {
                    id: string
                    tenant_id: string
                    name: string
                    description: string | null
                    location: string | null
                    address: string | null
                    city: string | null
                    state: string | null
                    country: string | null
                    postal_code: string | null
                    type: string | null
                    status: string
                    price: number | null
                    currency: string
                    area: number | null
                    area_unit: string
                    bedrooms: number | null
                    bathrooms: number | null
                    floors: number | null
                    year_built: number | null
                    images: Json
                    amenities: Json
                    features: Json
                    assigned_to: string | null
                    created_by: string | null
                    created_at: string
                    updated_at: string
                    deleted_at: string | null
                }
                Insert: {
                    id?: string
                    tenant_id: string
                    name: string
                    description?: string | null
                    location?: string | null
                    address?: string | null
                    city?: string | null
                    state?: string | null
                    country?: string | null
                    postal_code?: string | null
                    type?: string | null
                    status?: string
                    price?: number | null
                    currency?: string
                    area?: number | null
                    area_unit?: string
                    bedrooms?: number | null
                    bathrooms?: number | null
                    floors?: number | null
                    year_built?: number | null
                    images?: Json
                    amenities?: Json
                    features?: Json
                    assigned_to?: string | null
                    created_by?: string | null
                    created_at?: string
                    updated_at?: string
                    deleted_at?: string | null
                }
                Update: {
                    id?: string
                    tenant_id?: string
                    name?: string
                    description?: string | null
                    location?: string | null
                    address?: string | null
                    city?: string | null
                    state?: string | null
                    country?: string | null
                    postal_code?: string | null
                    type?: string | null
                    status?: string
                    price?: number | null
                    currency?: string
                    area?: number | null
                    area_unit?: string
                    bedrooms?: number | null
                    bathrooms?: number | null
                    floors?: number | null
                    year_built?: number | null
                    images?: Json
                    amenities?: Json
                    features?: Json
                    assigned_to?: string | null
                    created_by?: string | null
                    created_at?: string
                    updated_at?: string
                    deleted_at?: string | null
                }
            }
            crm_settings: {
                Row: {
                    id: string
                    tenant_id: string
                    type: string
                    name: string
                    value: string | null
                    color: string | null
                    icon: string | null
                    description: string | null
                    sort_order: number
                    is_active: boolean
                    is_default: boolean
                    metadata: Json
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    tenant_id: string
                    type: string
                    name: string
                    value?: string | null
                    color?: string | null
                    icon?: string | null
                    description?: string | null
                    sort_order?: number
                    is_active?: boolean
                    is_default?: boolean
                    metadata?: Json
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    tenant_id?: string
                    type?: string
                    name?: string
                    value?: string | null
                    color?: string | null
                    icon?: string | null
                    description?: string | null
                    sort_order?: number
                    is_active?: boolean
                    is_default?: boolean
                    metadata?: Json
                    created_at?: string
                    updated_at?: string
                }
            }
            leads: {
                Row: {
                    id: string
                    tenant_id: string
                    name: string
                    email: string | null
                    phone: string | null
                    alternate_phone: string | null
                    company: string | null
                    job_title: string | null
                    status: string
                    source: string | null
                    priority: string
                    score: number
                    property_id: string | null
                    assigned_to: string | null
                    estimated_value: number | null
                    currency: string
                    notes: string | null
                    tags: Json
                    custom_fields: Json
                    last_contacted_at: string | null
                    next_follow_up_at: string | null
                    converted_at: string | null
                    created_by: string | null
                    created_at: string
                    updated_at: string
                    deleted_at: string | null
                }
                Insert: {
                    id?: string
                    tenant_id: string
                    name: string
                    email?: string | null
                    phone?: string | null
                    alternate_phone?: string | null
                    company?: string | null
                    job_title?: string | null
                    status?: string
                    source?: string | null
                    priority?: string
                    score?: number
                    property_id?: string | null
                    assigned_to?: string | null
                    estimated_value?: number | null
                    currency?: string
                    notes?: string | null
                    tags?: Json
                    custom_fields?: Json
                    last_contacted_at?: string | null
                    next_follow_up_at?: string | null
                    converted_at?: string | null
                    created_by?: string | null
                    created_at?: string
                    updated_at?: string
                    deleted_at?: string | null
                }
                Update: {
                    id?: string
                    tenant_id?: string
                    name?: string
                    email?: string | null
                    phone?: string | null
                    alternate_phone?: string | null
                    company?: string | null
                    job_title?: string | null
                    status?: string
                    source?: string | null
                    priority?: string
                    score?: number
                    property_id?: string | null
                    assigned_to?: string | null
                    estimated_value?: number | null
                    currency?: string
                    notes?: string | null
                    tags?: Json
                    custom_fields?: Json
                    last_contacted_at?: string | null
                    next_follow_up_at?: string | null
                    converted_at?: string | null
                    created_by?: string | null
                    created_at?: string
                    updated_at?: string
                    deleted_at?: string | null
                }
            }
            activities: {
                Row: {
                    id: string
                    tenant_id: string
                    lead_id: string | null
                    property_id: string | null
                    type: string
                    subject: string | null
                    description: string | null
                    outcome: string | null
                    scheduled_at: string | null
                    completed_at: string | null
                    duration_minutes: number | null
                    assigned_to: string | null
                    created_by: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    tenant_id: string
                    lead_id?: string | null
                    property_id?: string | null
                    type: string
                    subject?: string | null
                    description?: string | null
                    outcome?: string | null
                    scheduled_at?: string | null
                    completed_at?: string | null
                    duration_minutes?: number | null
                    assigned_to?: string | null
                    created_by?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    tenant_id?: string
                    lead_id?: string | null
                    property_id?: string | null
                    type?: string
                    subject?: string | null
                    description?: string | null
                    outcome?: string | null
                    scheduled_at?: string | null
                    completed_at?: string | null
                    duration_minutes?: number | null
                    assigned_to?: string | null
                    created_by?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            deals: {
                Row: {
                    id: string
                    tenant_id: string
                    lead_id: string | null
                    property_id: string | null
                    title: string
                    description: string | null
                    stage: string
                    value: number
                    currency: string
                    probability: number
                    expected_close_date: string | null
                    actual_close_date: string | null
                    assigned_to: string | null
                    created_by: string | null
                    created_at: string
                    updated_at: string
                    deleted_at: string | null
                }
                Insert: {
                    id?: string
                    tenant_id: string
                    lead_id?: string | null
                    property_id?: string | null
                    title: string
                    description?: string | null
                    stage?: string
                    value: number
                    currency?: string
                    probability?: number
                    expected_close_date?: string | null
                    actual_close_date?: string | null
                    assigned_to?: string | null
                    created_by?: string | null
                    created_at?: string
                    updated_at?: string
                    deleted_at?: string | null
                }
                Update: {
                    id?: string
                    tenant_id?: string
                    lead_id?: string | null
                    property_id?: string | null
                    title?: string
                    description?: string | null
                    stage?: string
                    value?: number
                    currency?: string
                    probability?: number
                    expected_close_date?: string | null
                    actual_close_date?: string | null
                    assigned_to?: string | null
                    created_by?: string | null
                    created_at?: string
                    updated_at?: string
                    deleted_at?: string | null
                }
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            [_ in never]: never
        }
        Enums: {
            [_ in never]: never
        }
    }
}
