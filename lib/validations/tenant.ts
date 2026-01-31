/**
 * Tenant validation schemas using Zod
 */

import { z } from 'zod'

export const tenantSchema = z.object({
    name: z.string().min(2, 'Company name must be at least 2 characters').max(100, 'Name too long'),
    adminEmail: z.string().email('Invalid email address'),
    adminPassword: z.string().min(8, 'Password must be at least 8 characters'),
})

export const tenantUpdateSchema = z.object({
    name: z.string().min(2, 'Company name must be at least 2 characters').max(100, 'Name too long').optional(),
    status: z.enum(['active', 'blocked']).optional(),
})

export type TenantInput = z.infer<typeof tenantSchema>
export type TenantUpdateInput = z.infer<typeof tenantUpdateSchema>
