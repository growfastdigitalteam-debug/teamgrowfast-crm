/**
 * Lead validation schemas using Zod
 */

import { z } from 'zod'

export const leadSchema = z.object({
    fullName: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name too long'),
    phone: z.string().min(10, 'Phone must be at least 10 digits').max(15, 'Phone too long'),
    alternatePhone: z.string().max(15, 'Phone too long').optional(),
    email: z.string().email('Invalid email').optional().or(z.literal('')),
    location: z.string().max(200, 'Location too long').optional(),
    flatConfig: z.string().max(100, 'Config too long').optional(),
    source: z.string().optional(),
    category: z.string().optional(),
    status: z.string().optional(),
    notes: z.string().max(1000, 'Notes too long').optional(),
})

export const leadUpdateSchema = leadSchema.partial()

export const leadsImportSchema = z.array(leadSchema)

export const leadAssignSchema = z.object({
    leadIds: z.array(z.string()).min(1, 'Select at least one lead'),
    assignedTo: z.string().min(1, 'Select an agent'),
})

export const leadBulkUpdateSchema = z.object({
    leadIds: z.array(z.string()).min(1, 'Select at least one lead'),
    status: z.string().optional(),
    category: z.string().optional(),
    source: z.string().optional(),
})

export type LeadInput = z.infer<typeof leadSchema>
export type LeadUpdateInput = z.infer<typeof leadUpdateSchema>
export type LeadAssignInput = z.infer<typeof leadAssignSchema>
export type LeadBulkUpdateInput = z.infer<typeof leadBulkUpdateSchema>
