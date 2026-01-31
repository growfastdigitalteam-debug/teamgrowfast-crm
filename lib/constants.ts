/**
 * Application-wide constants
 */

export const APP_NAME = 'GrowFastDigital CRM'
export const APP_SHORT_NAME = 'GrowFast'
export const APP_COLOR = '#00AEEF'

export const ROUTES = {
    HOME: '/',
    LOGIN: '/auth/login',
    DASHBOARD: '/dashboard',
    LEADS: '/dashboard/leads',
    LEADS_ASSIGN: '/dashboard/leads/assign',
    CATEGORIES: '/dashboard/categories',
    USERS: '/dashboard/users',
    SETTINGS: '/dashboard/settings',
    COMPANIES: '/admin/companies',
} as const

export const PAGINATION = {
    DEFAULT_PAGE_SIZE: 50,
    PAGE_SIZE_OPTIONS: [25, 50, 100, 200],
} as const

export const LEAD_STATUS = {
    INTERESTED: 'Interested',
    SITE_VISIT_SCHEDULED: 'Site Visit Scheduled',
    SITE_VISIT_COMPLETED: 'Site Visit Completed',
    BOOKED: 'Booked',
    JUNK: 'Junk Lead',
    NOT_INTERESTED: 'Not Interested',
    CALL_BACK: 'Call Back',
    NOT_RESPONDING: 'Not Responding',
} as const

export const COLORS = {
    SUCCESS: '#22c55e',
    WARNING: '#f59e0b',
    ERROR: '#ef4444',
    INFO: '#3b82f6',
    PRIMARY: '#8b5cf6',
} as const

export const DATE_FORMATS = {
    DISPLAY: 'MMM dd, yyyy',
    DISPLAY_WITH_TIME: 'MMM dd, yyyy HH:mm',
    ISO: 'yyyy-MM-dd',
} as const
