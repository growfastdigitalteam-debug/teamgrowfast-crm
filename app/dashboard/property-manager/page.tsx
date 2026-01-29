/**
 * Property Manager Page
 * Manage properties with full CRUD operations connected to Supabase
 */

'use client'

import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, Building2, MapPin, Home } from 'lucide-react'
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

interface Property {
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
    images: any
    amenities: any
    features: any
    assigned_to: string | null
    created_by: string | null
    created_at: string
    updated_at: string
    deleted_at: string | null
}

type PropertyFormData = {
    name: string
    location: string
    address: string
    city: string
    state: string
    country: string
    postal_code: string
    type: string
    status: string
    price: string
    bedrooms: string
    bathrooms: string
    area: string
    description: string
}

const PROPERTY_TYPES = [
    'Residential',
    'Commercial',
    'Industrial',
    'Land',
    'Villa',
    'Apartment',
    'Office',
    'Retail',
]

const PROPERTY_STATUSES = [
    { value: 'active', label: 'Active', color: 'bg-emerald-500/10 text-emerald-600' },
    { value: 'upcoming', label: 'Upcoming', color: 'bg-blue-500/10 text-blue-600' },
    { value: 'ongoing', label: 'Ongoing', color: 'bg-amber-500/10 text-amber-600' },
    { value: 'ready_to_move', label: 'Ready to Move', color: 'bg-green-500/10 text-green-600' },
    { value: 'sold', label: 'Sold', color: 'bg-gray-500/10 text-gray-600' },
    { value: 'inactive', label: 'Inactive', color: 'bg-red-500/10 text-red-600' },
]

const INITIAL_FORM_DATA: PropertyFormData = {
    name: '',
    location: '',
    address: '',
    city: '',
    state: '',
    country: 'India',
    postal_code: '',
    type: '',
    status: 'active',
    price: '',
    bedrooms: '',
    bathrooms: '',
    area: '',
    description: '',
}

export default function PropertyManagerPage() {
    const { profile, loading: profileLoading } = useUserProfile()
    const [properties, setProperties] = useState<Property[]>([])
    const [loading, setLoading] = useState(true)
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
    const [formData, setFormData] = useState<PropertyFormData>(INITIAL_FORM_DATA)
    const [editingProperty, setEditingProperty] = useState<Property | null>(null)
    const [submitting, setSubmitting] = useState(false)

    // Fetch properties from Supabase
    const fetchProperties = async () => {
        if (!profile?.tenant_id) return

        try {
            setLoading(true)
            const { data, error } = await supabase
                .from('properties')
                .select('*')
                .eq('tenant_id', profile.tenant_id)
                .is('deleted_at', null)
                .order('created_at', { ascending: false })

            if (error) throw error

            setProperties(data || [])
        } catch (error: any) {
            console.error('Error fetching properties:', error)
            toast.error('Failed to load properties')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (profile?.tenant_id) {
            fetchProperties()
        }
    }, [profile?.tenant_id])

    // Handle form input changes
    const handleInputChange = (field: keyof PropertyFormData, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }))
    }

    // Add new property
    const handleAddProperty = async () => {
        if (!profile?.tenant_id) {
            toast.error('User profile not loaded')
            return
        }

        if (!formData.name || !formData.location || !formData.type) {
            toast.error('Please fill in all required fields')
            return
        }

        try {
            setSubmitting(true)

            const { data, error } = await supabase
                .from('properties')
                .insert({
                    tenant_id: profile.tenant_id,
                    name: formData.name,
                    location: formData.location,
                    address: formData.address || null,
                    city: formData.city || null,
                    state: formData.state || null,
                    country: formData.country || 'India',
                    postal_code: formData.postal_code || null,
                    type: formData.type,
                    status: formData.status,
                    price: formData.price ? parseFloat(formData.price) : null,
                    bedrooms: formData.bedrooms ? parseInt(formData.bedrooms) : null,
                    bathrooms: formData.bathrooms ? parseInt(formData.bathrooms) : null,
                    area: formData.area ? parseFloat(formData.area) : null,
                    description: formData.description || null,
                    created_by: profile.id,
                })
                .select()
                .single()

            if (error) throw error

            setProperties([data, ...properties])
            setFormData(INITIAL_FORM_DATA)
            setIsAddDialogOpen(false)
            toast.success('Property added successfully')
        } catch (error: any) {
            console.error('Error adding property:', error)
            toast.error('Failed to add property')
        } finally {
            setSubmitting(false)
        }
    }

    // Open edit dialog
    const handleEditClick = (property: Property) => {
        setEditingProperty(property)
        setFormData({
            name: property.name,
            location: property.location || '',
            address: property.address || '',
            city: property.city || '',
            state: property.state || '',
            country: property.country || 'India',
            postal_code: property.postal_code || '',
            type: property.type || '',
            status: property.status,
            price: property.price?.toString() || '',
            bedrooms: property.bedrooms?.toString() || '',
            bathrooms: property.bathrooms?.toString() || '',
            area: property.area?.toString() || '',
            description: property.description || '',
        })
        setIsEditDialogOpen(true)
    }

    // Update property
    const handleUpdateProperty = async () => {
        if (!editingProperty) return

        if (!formData.name || !formData.location || !formData.type) {
            toast.error('Please fill in all required fields')
            return
        }

        try {
            setSubmitting(true)

            const { data, error } = await supabase
                .from('properties')
                .update({
                    name: formData.name,
                    location: formData.location,
                    address: formData.address || null,
                    city: formData.city || null,
                    state: formData.state || null,
                    country: formData.country || 'India',
                    postal_code: formData.postal_code || null,
                    type: formData.type,
                    status: formData.status,
                    price: formData.price ? parseFloat(formData.price) : null,
                    bedrooms: formData.bedrooms ? parseInt(formData.bedrooms) : null,
                    bathrooms: formData.bathrooms ? parseInt(formData.bathrooms) : null,
                    area: formData.area ? parseFloat(formData.area) : null,
                    description: formData.description || null,
                })
                .eq('id', editingProperty.id)
                .select()
                .single()

            if (error) throw error

            setProperties(properties.map((p) => (p.id === data.id ? data : p)))
            setFormData(INITIAL_FORM_DATA)
            setEditingProperty(null)
            setIsEditDialogOpen(false)
            toast.success('Property updated successfully')
        } catch (error: any) {
            console.error('Error updating property:', error)
            toast.error('Failed to update property')
        } finally {
            setSubmitting(false)
        }
    }

    // Delete property (soft delete)
    const handleDeleteProperty = async (propertyId: string) => {
        if (!confirm('Are you sure you want to delete this property?')) return

        try {
            const { error } = await supabase
                .from('properties')
                .update({ deleted_at: new Date().toISOString() })
                .eq('id', propertyId)

            if (error) throw error

            setProperties(properties.filter((p) => p.id !== propertyId))
            toast.success('Property deleted successfully')
        } catch (error: any) {
            console.error('Error deleting property:', error)
            toast.error('Failed to delete property')
        }
    }

    // Get status badge styling
    const getStatusBadge = (status: string) => {
        const statusConfig = PROPERTY_STATUSES.find((s) => s.value === status)
        return statusConfig || PROPERTY_STATUSES[0]
    }

    // Get configuration display (bedrooms/bathrooms)
    const getConfiguration = (property: Property) => {
        const parts = []
        if (property.bedrooms) parts.push(`${property.bedrooms}BHK`)
        if (property.bathrooms) parts.push(`${property.bathrooms}BA`)
        if (property.area) parts.push(`${property.area} ${property.area_unit}`)
        return parts.join(' • ') || 'N/A'
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
                        <CardDescription>Please log in to access the Property Manager</CardDescription>
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
                        <Building2 className="w-8 h-8 text-primary" />
                        Property Manager
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Manage your properties and real estate listings
                    </p>
                </div>

                {/* Add Property Dialog */}
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="gap-2">
                            <Plus className="w-4 h-4" />
                            Add Property
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Add New Property</DialogTitle>
                            <DialogDescription>
                                Enter the property details below to add it to your listings
                            </DialogDescription>
                        </DialogHeader>
                        <PropertyForm
                            formData={formData}
                            onChange={handleInputChange}
                            onSubmit={handleAddProperty}
                            onCancel={() => {
                                setIsAddDialogOpen(false)
                                setFormData(INITIAL_FORM_DATA)
                            }}
                            submitting={submitting}
                            submitLabel="Add Property"
                        />
                    </DialogContent>
                </Dialog>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Total Properties</CardDescription>
                        <CardTitle className="text-3xl">{properties.length}</CardTitle>
                    </CardHeader>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Active</CardDescription>
                        <CardTitle className="text-3xl">
                            {properties.filter((p) => p.status === 'active').length}
                        </CardTitle>
                    </CardHeader>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Ready to Move</CardDescription>
                        <CardTitle className="text-3xl">
                            {properties.filter((p) => p.status === 'ready_to_move').length}
                        </CardTitle>
                    </CardHeader>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Sold</CardDescription>
                        <CardTitle className="text-3xl">
                            {properties.filter((p) => p.status === 'sold').length}
                        </CardTitle>
                    </CardHeader>
                </Card>
            </div>

            {/* Properties Table */}
            <Card>
                <CardHeader>
                    <CardTitle>All Properties</CardTitle>
                    <CardDescription>
                        View and manage all your property listings
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="text-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                                <p className="text-sm text-muted-foreground">Loading properties...</p>
                            </div>
                        </div>
                    ) : properties.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <Building2 className="w-12 h-12 text-muted-foreground mb-4" />
                            <h3 className="text-lg font-semibold mb-2">No properties yet</h3>
                            <p className="text-muted-foreground mb-4">
                                Get started by adding your first property
                            </p>
                            <Button onClick={() => setIsAddDialogOpen(true)} className="gap-2">
                                <Plus className="w-4 h-4" />
                                Add Property
                            </Button>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Project Name</TableHead>
                                        <TableHead>Location</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Configuration</TableHead>
                                        <TableHead>Price</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {properties.map((property) => {
                                        const statusConfig = getStatusBadge(property.status)
                                        return (
                                            <TableRow key={property.id}>
                                                <TableCell className="font-medium">
                                                    <div className="flex items-center gap-2">
                                                        <Home className="w-4 h-4 text-muted-foreground" />
                                                        {property.name}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-1 text-sm">
                                                        <MapPin className="w-3 h-3 text-muted-foreground" />
                                                        {property.location || property.city || 'N/A'}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <span className="text-sm">{property.type || 'N/A'}</span>
                                                </TableCell>
                                                <TableCell>
                                                    <span className="text-sm text-muted-foreground">
                                                        {getConfiguration(property)}
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    {property.price ? (
                                                        <span className="font-medium">
                                                            ₹{property.price.toLocaleString('en-IN')}
                                                        </span>
                                                    ) : (
                                                        <span className="text-muted-foreground">N/A</span>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge className={statusConfig.color} variant="secondary">
                                                        {statusConfig.label}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleEditClick(property)}
                                                            title="Edit Property"
                                                        >
                                                            <Pencil className="w-4 h-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleDeleteProperty(property.id)}
                                                            className="text-destructive hover:text-destructive"
                                                            title="Delete Property"
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

            {/* Edit Property Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Edit Property</DialogTitle>
                        <DialogDescription>
                            Update the property details below
                        </DialogDescription>
                    </DialogHeader>
                    <PropertyForm
                        formData={formData}
                        onChange={handleInputChange}
                        onSubmit={handleUpdateProperty}
                        onCancel={() => {
                            setIsEditDialogOpen(false)
                            setFormData(INITIAL_FORM_DATA)
                            setEditingProperty(null)
                        }}
                        submitting={submitting}
                        submitLabel="Update Property"
                    />
                </DialogContent>
            </Dialog>
        </div>
    )
}

// Property Form Component
function PropertyForm({
    formData,
    onChange,
    onSubmit,
    onCancel,
    submitting,
    submitLabel,
}: {
    formData: PropertyFormData
    onChange: (field: keyof PropertyFormData, value: string) => void
    onSubmit: () => void
    onCancel: () => void
    submitting: boolean
    submitLabel: string
}) {
    return (
        <div className="space-y-4 py-4">
            {/* Basic Information */}
            <div className="space-y-4">
                <h3 className="text-sm font-semibold text-foreground">Basic Information</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">
                            Project Name <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="name"
                            placeholder="e.g., Sukoon Residency"
                            value={formData.name}
                            onChange={(e) => onChange('name', e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="type">
                            Property Type <span className="text-destructive">*</span>
                        </Label>
                        <Select value={formData.type} onValueChange={(value) => onChange('type', value)}>
                            <SelectTrigger id="type">
                                <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                                {PROPERTY_TYPES.map((type) => (
                                    <SelectItem key={type} value={type}>
                                        {type}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                        id="description"
                        placeholder="Enter property description..."
                        value={formData.description}
                        onChange={(e) => onChange('description', e.target.value)}
                        rows={3}
                    />
                </div>
            </div>

            {/* Location Details */}
            <div className="space-y-4">
                <h3 className="text-sm font-semibold text-foreground">Location Details</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="location">
                            Location <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="location"
                            placeholder="e.g., Baner, Pune"
                            value={formData.location}
                            onChange={(e) => onChange('location', e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="city">City</Label>
                        <Input
                            id="city"
                            placeholder="e.g., Pune"
                            value={formData.city}
                            onChange={(e) => onChange('city', e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="state">State</Label>
                        <Input
                            id="state"
                            placeholder="e.g., Maharashtra"
                            value={formData.state}
                            onChange={(e) => onChange('state', e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="postal_code">Postal Code</Label>
                        <Input
                            id="postal_code"
                            placeholder="e.g., 411045"
                            value={formData.postal_code}
                            onChange={(e) => onChange('postal_code', e.target.value)}
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="address">Full Address</Label>
                    <Textarea
                        id="address"
                        placeholder="Enter complete address..."
                        value={formData.address}
                        onChange={(e) => onChange('address', e.target.value)}
                        rows={2}
                    />
                </div>
            </div>

            {/* Property Details */}
            <div className="space-y-4">
                <h3 className="text-sm font-semibold text-foreground">Property Details</h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="bedrooms">Bedrooms (BHK)</Label>
                        <Input
                            id="bedrooms"
                            type="number"
                            placeholder="e.g., 2"
                            value={formData.bedrooms}
                            onChange={(e) => onChange('bedrooms', e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="bathrooms">Bathrooms</Label>
                        <Input
                            id="bathrooms"
                            type="number"
                            placeholder="e.g., 2"
                            value={formData.bathrooms}
                            onChange={(e) => onChange('bathrooms', e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="area">Area (sq.ft)</Label>
                        <Input
                            id="area"
                            type="number"
                            placeholder="e.g., 1200"
                            value={formData.area}
                            onChange={(e) => onChange('area', e.target.value)}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="price">Price (₹)</Label>
                        <Input
                            id="price"
                            type="number"
                            placeholder="e.g., 5000000"
                            value={formData.price}
                            onChange={(e) => onChange('price', e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="status">Status</Label>
                        <Select value={formData.status} onValueChange={(value) => onChange('status', value)}>
                            <SelectTrigger id="status">
                                <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                                {PROPERTY_STATUSES.map((status) => (
                                    <SelectItem key={status.value} value={status.value}>
                                        {status.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
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
