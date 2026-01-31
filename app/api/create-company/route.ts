
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// Initialize Supabase Admin Client (Service Role)
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    }
)

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { name, email, password } = body

        if (!name || !email || !password) {
            return NextResponse.json({ error: 'Name, email, and password are required' }, { status: 400 })
        }

        // 1. Create a new Tenant ID (UUID)
        const tenantId = crypto.randomUUID()

        // 2. Create Auth User
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email: email,
            password: password,
            email_confirm: true,
            user_metadata: {
                full_name: name,
                tenant_id: tenantId,
                role: 'admin' // Company Admin
            }
        })

        if (authError) {
            return NextResponse.json({ error: authError.message }, { status: 400 })
        }

        if (!authData.user) {
            return NextResponse.json({ error: 'Failed to create user' }, { status: 500 })
        }

        // 3. Insert into public.users table (if trigger doesn't exist, we do it manually safely)
        // We try to update if exists (trigger might have created it) or insert
        const { error: dbError } = await supabaseAdmin
            .from('users')
            .upsert({
                id: authData.user.id,
                email: email,
                full_name: name,
                role: 'admin',
                tenant_id: tenantId,
                created_at: new Date().toISOString()
            })

        if (dbError) {
            console.error("DB Error:", dbError)
            // Don't fail hard if auth succeeded, but warn
        }

        // 4. Insert Default Settings (Categories, Sources, etc.)
        const defaultSettings = [
            // Categories
            { name: 'Hot Lead', type: 'category', color: '#ef4444' },
            { name: 'Warm Lead', type: 'category', color: '#f97316' },
            { name: 'Cold Lead', type: 'category', color: '#3b82f6' },
            { name: 'Converted', type: 'category', color: '#10b981' },
            // Sources
            { name: 'Facebook', type: 'source', color: '#1877f2' },
            { name: 'Google', type: 'source', color: '#ea4335' },
            { name: 'Referral', type: 'source', color: '#8b5cf6' },
            { name: 'Direct', type: 'source', color: '#64748b' },
            // Statuses
            { name: 'New', type: 'status', color: '#3b82f6' },
            { name: 'Interested', type: 'status', color: '#f59e0b' },
            { name: 'Follow Up', type: 'status', color: '#8b5cf6' },
            { name: 'Booked', type: 'status', color: '#10b981' },
            { name: 'Not Interested', type: 'status', color: '#64748b' },
            // Teams
            { name: 'Sales Team A', type: 'team', color: '#ec4899' }
        ]

        const settingsPayload = defaultSettings.map(s => ({
            ...s,
            tenant_id: tenantId
        }))

        await supabaseAdmin.from('crm_settings').insert(settingsPayload)

        return NextResponse.json({ success: true, message: 'Company created successfully', company: { name, email, tenantId } })

    } catch (error: any) {
        console.error("Server Error:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
