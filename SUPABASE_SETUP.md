# Supabase Setup Guide

This guide will help you set up and use Supabase in your multi-tenant CRM application.

## 📋 Prerequisites

1. A Supabase account (sign up at [supabase.com](https://supabase.com))
2. Node.js and npm installed
3. Your Next.js project set up

## 🚀 Quick Start

### 1. Create a Supabase Project

1. Go to [app.supabase.com](https://app.supabase.com)
2. Click "New Project"
3. Fill in your project details
4. Wait for the project to be created (takes ~2 minutes)

### 2. Get Your API Keys

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **Anon/Public Key** (starts with `eyJ...`)

### 3. Configure Environment Variables

1. Create a `.env.local` file in your project root:
   ```bash
   cp .env.local.example .env.local
   ```

2. Add your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   ```

### 4. Run the Database Schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Click "New Query"
3. Copy the entire contents of `supabase-schema.sql`
4. Paste it into the SQL Editor
5. Click "Run" to execute the schema

This will create all tables, indexes, RLS policies, and triggers.

### 5. Install Dependencies

```bash
npm install
```

This will install:
- `@supabase/supabase-js` - Supabase JavaScript client
- `@supabase/ssr` - Server-side rendering helpers for Next.js

## 📁 File Structure

```
lib/supabase/
├── client.ts          # Client-side Supabase client (for browser)
├── server.ts          # Server-side Supabase client (for Server Components)
├── middleware.ts      # Middleware client (for session refresh)
├── hooks.ts           # Custom React hooks for common operations
├── database.types.ts  # TypeScript types for your database
└── index.ts           # Central exports

middleware.ts          # Next.js middleware for auth
```

## 🔧 Usage Examples

### Client-Side Usage (Client Components)

```tsx
'use client'

import { supabase } from '@/lib/supabase/client'
import { useUser, useUserProfile } from '@/lib/supabase/hooks'

export function MyComponent() {
  const { user, loading } = useUser()
  const { profile } = useUserProfile()

  // Fetch data
  const fetchLeads = async () => {
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .eq('tenant_id', profile?.tenant_id)
    
    return data
  }

  return <div>...</div>
}
```

### Server-Side Usage (Server Components)

```tsx
import { createClient } from '@/lib/supabase/server'

export default async function Page() {
  const supabase = await createClient()
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  
  // Fetch data
  const { data: leads } = await supabase
    .from('leads')
    .select('*')
  
  return <div>...</div>
}
```

### Server Actions

```tsx
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createLead(formData: FormData) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  
  // Get user's tenant_id
  const { data: profile } = await supabase
    .from('users')
    .select('tenant_id')
    .eq('id', user.id)
    .single()
  
  // Insert lead
  const { data, error } = await supabase
    .from('leads')
    .insert({
      tenant_id: profile.tenant_id,
      name: formData.get('name'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      created_by: user.id,
    })
    .select()
    .single()
  
  if (error) throw error
  
  revalidatePath('/leads')
  return data
}
```

### Real-time Subscriptions

```tsx
'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'

export function LeadsList() {
  const [leads, setLeads] = useState([])
  
  useEffect(() => {
    // Subscribe to changes
    const channel = supabase
      .channel('leads_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'leads',
        },
        (payload) => {
          console.log('Change received!', payload)
          // Update your state accordingly
        }
      )
      .subscribe()
    
    return () => {
      supabase.removeChannel(channel)
    }
  }, [])
  
  return <div>...</div>
}
```

## 🔐 Authentication

### Sign Up

```tsx
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password123',
})
```

### Sign In

```tsx
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password123',
})
```

### Sign Out

```tsx
const { error } = await supabase.auth.signOut()
```

### OAuth (Google, GitHub, etc.)

```tsx
const { data, error } = await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: {
    redirectTo: `${window.location.origin}/auth/callback`,
  },
})
```

## 🛡️ Row Level Security (RLS)

All tables have RLS enabled. Users can only access data from their own tenant.

### Example: Querying with RLS

```tsx
// This automatically filters by tenant_id through RLS policies
const { data } = await supabase
  .from('leads')
  .select('*')

// RLS ensures users only see their tenant's data
```

## 🎣 Custom Hooks

### useUser()
Get the current authenticated user.

```tsx
const { user, loading } = useUser()
```

### useUserProfile()
Get the current user's profile from the `users` table.

```tsx
const { profile, loading } = useUserProfile()
// profile includes: tenant_id, role, email, etc.
```

### useTenant()
Get the current user's tenant information.

```tsx
const { tenant, loading } = useTenant()
```

### useRole()
Check if user has a specific role.

```tsx
const { hasRole, role } = useRole(['admin', 'super_admin'])
```

## 📊 Database Tables

- **tenants** - Organization/company data
- **users** - User profiles and roles
- **properties** - Property/project management
- **crm_settings** - Customizable CRM settings
- **leads** - Lead/contact management
- **activities** - Interaction tracking
- **deals** - Sales pipeline

## 🔄 Updating Database Types

When you make changes to your database schema, regenerate the TypeScript types:

```bash
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > lib/supabase/database.types.ts
```

Or use the Supabase CLI:

```bash
supabase login
supabase link --project-ref YOUR_PROJECT_ID
supabase db pull
npx supabase gen types typescript --local > lib/supabase/database.types.ts
```

## 🎯 Next Steps

1. ✅ Set up Supabase project
2. ✅ Run database schema
3. ✅ Configure environment variables
4. ✅ Install dependencies
5. 🔲 Create your first tenant
6. 🔲 Set up authentication
7. 🔲 Migrate dummy data to Supabase
8. 🔲 Update components to use Supabase

## 📚 Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Next.js Guide](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Realtime](https://supabase.com/docs/guides/realtime)

## 🐛 Troubleshooting

### "Invalid API key" error
- Check that your `.env.local` file exists and has the correct values
- Restart your dev server after adding environment variables

### RLS policy blocking queries
- Make sure you're authenticated (`supabase.auth.getUser()`)
- Verify the user exists in the `users` table with a valid `tenant_id`

### TypeScript errors
- Run `npm install` to ensure all dependencies are installed
- Restart your TypeScript server in VS Code

### Session not persisting
- Ensure middleware is set up correctly in `middleware.ts`
- Check that cookies are enabled in your browser
