/**
 * Supabase Client Exports
 * Central export file for all Supabase utilities
 */

// Client-side exports
export { createClient as createBrowserClient, supabase } from './client'

// Server-side exports
export { createClient as createServerClient } from './server'

// Middleware exports
export { updateSession } from './middleware'

// Type exports
export type { Database } from './database.types'
