/**
 * Leads Center Page
 * Comprehensive leads management with search, filters, and CRUD operations
 */

'use client'

import { useEffect, useState } from 'react'
import {
    Plus,
    Pencil,
    Trash2,
    Search,
    Filter,
    Download,
    Users,
    Phone,
    Mail,
    MapPin,
    X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { supabase } from '@/lib/supabase/client'
import { useUserProfile } from '@/lib/supabase/hooks'
import { toast } from 'sonner'

interface Lead {
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
    tags: any
    custom_fields: any
    last_contacted_at: string | null
    next_follow_up_at: string | null
    converted_at: string | null
    created_by: string | null
    created_at: string
    updated_at: string
    deleted_at: string | null
}

type LeadFormData = {
    name: string
    email: string
    phone: string
    company: string
    status: string
    source: string
    priority: string
    notes: string
}

const LEAD_STATUSES = [
    { value: 'new', label: 'New', color: 'bg-blue-500/10 text-blue-600' },
    { value: 'contacted', label: 'Contacted', color: 'bg-amber-500/10 text-amber-600' },
    { value: 'qualified', label: 'Qualified', color: 'bg-purple-500/10 text-purple-600' },
    { value: 'proposal', label: 'Proposal', color: 'bg-indigo-500/10 text-indigo-600' },
    { value: 'negotiation', label: 'Negotiation', color: 'bg-orange-500/10 text-orange-600' },
    { value: 'won', label: 'Won', color: 'bg-emerald-500/10 text-emerald-600' },
    { value: 'lost', label: 'Lost', color: 'bg-red-500/10 text-red-600' },
]

const LEAD_SOURCES = ['Website', 'Referral', 'Social Media', 'Advertisement', 'Cold Call', 'Walk-in', 'Other']
const LEAD_PRIORITIES = ['low', 'medium', 'high', 'urgent']

const INITIAL_FORM_DATA: LeadFormData = {
    name: '',
    email: '',
    phone: '',
    company: '',
    status: 'new',
    source: '',
    priority: 'medium',
    notes: '',
}

export default function LeadsCenterPage() {
    const { profile, loading: profileLoading } = useUserProfile()
    const [leads, setLeads] = useState<Lead[]>([])
    const [filteredLeads, setFilteredLeads] = useState<Lead[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [statusFilter, setStatusFilter] = useState<string>('all')
    const [sourceFilter, setSourceFilter] = useState<string>('all')
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
    const [formData, setFormData] = useState<LeadFormData>(INITIAL_FORM_DATA)
    const [editingLead, setEditingLead] = useState<Lead | null>(null)
    const [submitting, setSubmitting] = useState(false)

    // Fetch leads from Supabase
    const fetchLeads = async () => {
        if (!profile?.tenant_id) return

        try {
            setLoading(true)
            const { data, error } = await supabase
                .from('leads')
                .select('*')
                .eq('tenant_id', profile.tenant_id)
                .is('deleted_at', null)
                .order('created_at', { ascending: false })

            if (error) throw error

            setLeads(data || [])
            setFilteredLeads(data || [])
        } catch (error: any) {
            console.error('Error fetching leads:', error)
            toast.error('Failed to load leads')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (profile?.tenant_id) {
            fetchLeads()
        }
    }, [profile?.tenant_id])

    // Apply filters and search
    useEffect(() => {
        let filtered = [...leads]

        // Search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase()
            filtered = filtered.filter(
                (lead) =>
                    lead.name.toLowerCase().includes(query) ||
                    lead.email?.toLowerCase().includes(query) ||
                    lead.phone?.includes(query) ||
                    lead.company?.toLowerCase().includes(query)
            )
        }

        // Status filter
        if (statusFilter !== 'all') {
            filtered = filtered.filter((lead) => lead.status === statusFilter)
        }

        // Source filter
        if (sourceFilter !== 'all') {
            filtered = filtered.filter((lead) => lead.source === sourceFilter)
        }

        setFilteredLeads(filtered)
    }, [searchQuery, statusFilter, sourceFilter, leads])

    const handleInputChange = (field: keyof LeadFormData, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }))
    }

    // Add new lead
    const handleAddLead = async () => {
        if (!profile?.tenant_id) {
            toast.error('User profile not loaded')
            return
        }

        if (!formData.name || !formData.phone) {
            toast.error('Please fill in required fields (Name and Phone)')
            return
        }

        try {
            setSubmitting(true)

            const { data, error } = await supabase
                .from('leads')
                .insert({
                    tenant_id: profile.tenant_id,
                    name: formData.name,
                    email: formData.email || null,
                    phone: formData.phone,
                    company: formData.company || null,
                    status: formData.status,
                    source: formData.source || null,
                    priority: formData.priority,
                    notes: formData.notes || null,
                    created_by: profile.id,
                })
                .select()
                .single()

            if (error) throw error

            setLeads([data, ...leads])
            setFormData(INITIAL_FORM_DATA)
            setIsAddDialogOpen(false)
            toast.success('Lead added successfully')
        } catch (error: any) {
            console.error('Error adding lead:', error)
            toast.error('Failed to add lead')
        } finally {
            setSubmitting(false)
        }
    }

    // Open edit dialog
    const handleEditClick = (lead: Lead) => {
        setEditingLead(lead)
        setFormData({
            name: lead.name,
            email: lead.email || '',
            phone: lead.phone || '',
            company: lead.company || '',
            status: lead.status,
            source: lead.source || '',
            priority: lead.priority,
            notes: lead.notes || '',
        })
        setIsEditDialogOpen(true)
    }

    // Update lead
    const handleUpdateLead = async () => {
        if (!editingLead) return

        if (!formData.name || !formData.phone) {
            toast.error('Please fill in required fields')
            return
        }

        try {
            setSubmitting(true)

            const { data, error } = await supabase
                .from('leads')
                .update({
                    name: formData.name,
                    email: formData.email || null,
                    phone: formData.phone,
                    company: formData.company || null,
                    status: formData.status,
                    source: formData.source || null,
                    priority: formData.priority,
                    notes: formData.notes || null,
                })
                .eq('id', editingLead.id)
                .select()
                .single()

            if (error) throw error

            setLeads(leads.map((l) => (l.id === data.id ? data : l)))
            setFormData(INITIAL_FORM_DATA)
            setEditingLead(null)
            setIsEditDialogOpen(false)
            toast.success('Lead updated successfully')
        } catch (error: any) {
            console.error('Error updating lead:', error)
            toast.error('Failed to update lead')
        } finally {
            setSubmitting(false)
        }
    }

    // Delete lead
    const handleDeleteLead = async (leadId: string) => {
        if (!confirm('Are you sure you want to delete this lead?')) return

        try {
            const { error } = await supabase
                .from('leads')
                .update({ deleted_at: new Date().toISOString() })
                .eq('id', leadId)

            if (error) throw error

            setLeads(leads.filter((l) => l.id !== leadId))
            toast.success('Lead deleted successfully')
        } catch (error: any) {
            console.error('Error deleting lead:', error)
            toast.error('Failed to delete lead')
        }
    }

    const getStatusBadge = (status: string) => {
        const statusConfig = LEAD_STATUSES.find((s) => s.value === status)
        return statusConfig || LEAD_STATUSES[0]
    }

    const getPriorityColor = (priority: string) => {
        const colors: Record<string, string> = {
            low: 'bg-gray-500/10 text-gray-600',
            medium: 'bg-blue-500/10 text-blue-600',
            high: 'bg-orange-500/10 text-orange-600',
            urgent: 'bg-red-500/10 text-red-600',
        }
        return colors[priority] || colors.medium
    }

    const clearFilters = () => {
        setSearchQuery('')
        setStatusFilter('all')
        setSourceFilter('all')
    }

    if (profileLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading...</p>
                </div>
            </div>
        )
    }

    if (!profile) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Card className="max-w-md">
                    <CardHeader>
                        <CardTitle>Authentication Required</CardTitle>
                        <CardDescription>Please log in to access Leads Center</CardDescription>
                    </CardHeader>
                </Card>
            </div>
        )
    }

    return (
        <div className="container mx-auto py-6 px-4 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
                        <Users className="w-8 h-8 text-primary" />
                        Leads Center
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Manage and track all your leads in one place
                    </p>
                </div>

                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="gap-2">
                            <Plus className="w-4 h-4" />
                            Add Lead
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Add New Lead</DialogTitle>
                            <DialogDescription>
                                Enter the lead details below to add them to your CRM
                            </DialogDescription>
                        </DialogHeader>
                        <LeadForm
                            formData={formData}
                            onChange={handleInputChange}
                            onSubmit={handleAddLead}
                            onCancel={() => {
                                setIsAddDialogOpen(false)
                                setFormData(INITIAL_FORM_DATA)
                            }}
                            submitting={submitting}
                            submitLabel="Add Lead"
                        />
                    </DialogContent>
                </Dialog>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Total Leads</CardDescription>
                        <CardTitle className="text-3xl">{leads.length}</CardTitle>
                    </CardHeader>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>New</CardDescription>
                        <CardTitle className="text-3xl">
                            {leads.filter((l) => l.status === 'new').length}
                        </CardTitle>
                    </CardHeader>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Qualified</CardDescription>
                        <CardTitle className="text-3xl">
                            {leads.filter((l) => l.status === 'qualified').length}
                        </CardTitle>
                    </CardHeader>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Won</CardDescription>
                        <CardTitle className="text-3xl">
                            {leads.filter((l) => l.status === 'won').length}
                        </CardTitle>
                    </CardHeader>
                </Card>
            </div>

            {/* Search and Filters */}
            <Card>
                <CardHeader>
                    <CardTitle>Search & Filter</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="md:col-span-2">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search by name, email, phone, or company..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>

                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger>
                                <SelectValue placeholder="Filter by status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Statuses</SelectItem>
                                {LEAD_STATUSES.map((status) => (
                                    <SelectItem key={status.value} value={status.value}>
                                        {status.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select value={sourceFilter} onValueChange={setSourceFilter}>
                            <SelectTrigger>
                                <SelectValue placeholder="Filter by source" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Sources</SelectItem>
                                {LEAD_SOURCES.map((source) => (
                                    <SelectItem key={source} value={source}>
                                        {source}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {(searchQuery || statusFilter !== 'all' || sourceFilter !== 'all') && (
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">
                                Showing {filteredLeads.length} of {leads.length} leads
                            </span>
                            <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1">
                                <X className="w-3 h-3" />
                                Clear filters
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Leads Table */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>All Leads</CardTitle>
                        <Button variant="outline" size="sm" className="gap-2">
                            <Download className="w-4 h-4" />
                            Export
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="text-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                                <p className="text-sm text-muted-foreground">Loading leads...</p>
                            </div>
                        </div>
                    ) : filteredLeads.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <Users className="w-12 h-12 text-muted-foreground mb-4" />
                            <h3 className="text-lg font-semibold mb-2">
                                {searchQuery || statusFilter !== 'all' || sourceFilter !== 'all'
                                    ? 'No leads found'
                                    : 'No leads yet'}
                            </h3>
                            <p className="text-muted-foreground mb-4">
                                {searchQuery || statusFilter !== 'all' || sourceFilter !== 'all'
                                    ? 'Try adjusting your filters'
                                    : 'Get started by adding your first lead'}
                            </p>
                            {!searchQuery && statusFilter === 'all' && sourceFilter === 'all' && (
                                <Button onClick={() => setIsAddDialogOpen(true)} className="gap-2">
                                    <Plus className="w-4 h-4" />
                                    Add Lead
                                </Button>
                            )}
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Contact</TableHead>
                                        <TableHead>Company</TableHead>
                                        <TableHead>Source</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Priority</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredLeads.map((lead) => {
                                        const statusConfig = getStatusBadge(lead.status)
                                        return (
                                            <TableRow key={lead.id}>
                                                <TableCell className="font-medium">{lead.name}</TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col gap-1">
                                                        {lead.phone && (
                                                            <div className="flex items-center gap-1 text-sm">
                                                                <Phone className="w-3 h-3 text-muted-foreground" />
                                                                {lead.phone}
                                                            </div>
                                                        )}
                                                        {lead.email && (
                                                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                                                <Mail className="w-3 h-3" />
                                                                {lead.email}
                                                            </div>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <span className="text-sm">{lead.company || 'N/A'}</span>
                                                </TableCell>
                                                <TableCell>
                                                    <span className="text-sm capitalize">{lead.source || 'N/A'}</span>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge className={statusConfig.color} variant="secondary">
                                                        {statusConfig.label}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge className={getPriorityColor(lead.priority)} variant="secondary">
                                                        {lead.priority}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleEditClick(lead)}
                                                            title="Edit Lead"
                                                        >
                                                            <Pencil className="w-4 h-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleDeleteLead(lead.id)}
                                                            className="text-destructive hover:text-destructive"
                                                            title="Delete Lead"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        )
                                    })}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Edit Lead Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Edit Lead</DialogTitle>
                        <DialogDescription>Update the lead details below</DialogDescription>
                    </DialogHeader>
                    <LeadForm
                        formData={formData}
                        onChange={handleInputChange}
                        onSubmit={handleUpdateLead}
                        onCancel={() => {
                            setIsEditDialogOpen(false)
                            setFormData(INITIAL_FORM_DATA)
                            setEditingLead(null)
                        }}
                        submitting={submitting}
                        submitLabel="Update Lead"
                    />
                </DialogContent>
            </Dialog>
        </div>
    )
}

// Lead Form Component
function LeadForm({
    formData,
    onChange,
    onSubmit,
    onCancel,
    submitting,
    submitLabel,
}: {
    formData: LeadFormData
    onChange: (field: keyof LeadFormData, value: string) => void
    onSubmit: () => void
    onCancel: () => void
    submitting: boolean
    submitLabel: string
}) {
    return (
        <div className="space-y-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="name">
                        Full Name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                        id="name"
                        placeholder="John Doe"
                        value={formData.name}
                        onChange={(e) => onChange('name', e.target.value)}
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="phone">
                        Phone <span className="text-destructive">*</span>
                    </Label>
                    <Input
                        id="phone"
                        placeholder="+91 9876543210"
                        value={formData.phone}
                        onChange={(e) => onChange('phone', e.target.value)}
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                        id="email"
                        type="email"
                        placeholder="john@example.com"
                        value={formData.email}
                        onChange={(e) => onChange('email', e.target.value)}
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="company">Company</Label>
                    <Input
                        id="company"
                        placeholder="Company Name"
                        value={formData.company}
                        onChange={(e) => onChange('company', e.target.value)}
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select value={formData.status} onValueChange={(value) => onChange('status', value)}>
                        <SelectTrigger id="status">
                            <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                            {LEAD_STATUSES.map((status) => (
                                <SelectItem key={status.value} value={status.value}>
                                    {status.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="source">Source</Label>
                    <Select value={formData.source} onValueChange={(value) => onChange('source', value)}>
                        <SelectTrigger id="source">
                            <SelectValue placeholder="Select source" />
                        </SelectTrigger>
                        <SelectContent>
                            {LEAD_SOURCES.map((source) => (
                                <SelectItem key={source} value={source}>
                                    {source}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="priority">Priority</Label>
                    <Select value={formData.priority} onValueChange={(value) => onChange('priority', value)}>
                        <SelectTrigger id="priority">
                            <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                        <SelectContent>
                            {LEAD_PRIORITIES.map((priority) => (
                                <SelectItem key={priority} value={priority}>
                                    {priority.charAt(0).toUpperCase() + priority.slice(1)}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                        id="notes"
                        placeholder="Add any additional notes..."
                        value={formData.notes}
                        onChange={(e) => onChange('notes', e.target.value)}
                        rows={3}
                    />
                </div>
            </div>

            <DialogFooter className="gap-2">
                <Button variant="outline" onClick={onCancel} disabled={submitting}>
                    Cancel
                </Button>
                <Button onClick={onSubmit} disabled={submitting}>
                    {submitting ? 'Saving...' : submitLabel}
                </Button>
            </DialogFooter>
        </div>
    )
}
