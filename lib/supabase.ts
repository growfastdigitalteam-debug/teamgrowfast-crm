/**
 * Main Supabase Client Export
 * Simplified import for the most common use case
 */

export { supabase, createClient as createBrowserClient } from './supabase/client'
export { createClient as createServerClient } from './supabase/server'
export { updateSession } from './supabase/middleware'
export * from './supabase/hooks'
export * from './supabase/queries'
export * from './supabase/auth'
export type { Database } from './supabase/database.types'
