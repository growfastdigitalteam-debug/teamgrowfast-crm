/**
 * Utility functions for common operations
 */

import * as XLSX from 'xlsx'
import type { Lead } from '@/lib/types'

/**
 * Export leads to Excel file
 */
export function exportLeadsToExcel(leads: Lead[], filename = 'leads-export.xlsx') {
    const data = leads.map((lead) => ({
        Name: lead.fullName,
        Phone: lead.phone,
        'Alternate Phone': lead.alternatePhone || '',
        Email: lead.email || '',
        Location: lead.location || '',
        'Flat Config': lead.flatConfig || '',
        Source: lead.source || '',
        Category: lead.category || '',
        Status: lead.status,
        'Latest Notes': lead.notes || '',
        'Assigned To': lead.assignedTo || '',
        'Created Date': lead.createdAt,
        'Last Updated': lead.updatedAt,
    }))

    const worksheet = XLSX.utils.json_to_sheet(data)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Leads')

    // Auto-size columns
    const maxWidth = 30
    const colWidths = Object.keys(data[0] || {}).map((key) => ({
        wch: Math.min(
            maxWidth,
            Math.max(
                key.length,
                ...data.map((row: any) => String(row[key] || '').length)
            )
        ),
    }))
    worksheet['!cols'] = colWidths

    XLSX.writeFile(workbook, filename)
}

/**
 * Export leads to CSV file
 */
export function exportLeadsToCSV(leads: Lead[], filename = 'leads-export.csv') {
    const data = leads.map((lead) => ({
        Name: lead.fullName,
        Phone: lead.phone,
        'Alternate Phone': lead.alternatePhone || '',
        Email: lead.email || '',
        Location: lead.location || '',
        'Flat Config': lead.flatConfig || '',
        Source: lead.source || '',
        Category: lead.category || '',
        Status: lead.status,
        'Latest Notes': lead.notes || '',
        'Assigned To': lead.assignedTo || '',
        'Created Date': lead.createdAt,
        'Last Updated': lead.updatedAt,
    }))

    const worksheet = XLSX.utils.json_to_sheet(data)
    const csv = XLSX.utils.sheet_to_csv(worksheet)

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = filename
    link.click()
    URL.revokeObjectURL(link.href)
}

/**
 * Format date for display
 */
export function formatDate(date: string | Date, format: 'short' | 'long' = 'short'): string {
    const d = typeof date === 'string' ? new Date(date) : date

    if (format === 'short') {
        return d.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        })
    }

    return d.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    })
}

/**
 * Generate a random color
 */
export function generateRandomColor(): string {
    const colors = [
        '#ef4444', '#f59e0b', '#22c55e', '#3b82f6', '#8b5cf6',
        '#ec4899', '#06b6d4', '#10b981', '#f97316', '#6366f1',
    ]
    return colors[Math.floor(Math.random() * colors.length)]
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout | null = null

    return function executedFunction(...args: Parameters<T>) {
        const later = () => {
            timeout = null
            func(...args)
        }

        if (timeout) clearTimeout(timeout)
        timeout = setTimeout(later, wait)
    }
}

/**
 * Get initials from name
 */
export function getInitials(name: string): string {
    return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
}

/**
 * Check if color is light or dark (for text color)
 */
export function isLightColor(hexColor: string): boolean {
    const hex = hexColor.replace('#', '')
    const r = parseInt(hex.substring(0, 2), 16)
    const g = parseInt(hex.substring(2, 4), 16)
    const b = parseInt(hex.substring(4, 6), 16)
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
    return luminance > 0.5
}

/**
 * Format phone number
 */
export function formatPhoneNumber(phone: string): string {
    const cleaned = phone.replace(/\D/g, '')

    if (cleaned.length === 10) {
        return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`
    }

    return phone
}
