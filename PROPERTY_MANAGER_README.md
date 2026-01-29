# Property Manager Page - Implementation Guide

## 📁 File Structure

```
app/
├── dashboard/
│   ├── layout.tsx                    # Dashboard layout wrapper
│   └── property-manager/
│       └── page.tsx                  # Property Manager page (MAIN FILE)
lib/
├── supabase.ts                       # Main Supabase exports
└── supabase/
    ├── client.ts                     # Browser client
    ├── server.ts                     # Server client
    ├── hooks.ts                      # React hooks
    ├── queries.ts                    # Database queries
    ├── auth.ts                       # Auth utilities
    └── database.types.ts             # TypeScript types
```

## 🎯 Features Implemented

### ✅ **Full CRUD Operations**
- ✅ **Create**: Add new properties via dialog form
- ✅ **Read**: Fetch and display properties from Supabase
- ✅ **Update**: Edit existing properties
- ✅ **Delete**: Soft delete properties (sets `deleted_at`)

### ✅ **UI Components**
- ✅ Responsive data table with Shadcn Table component
- ✅ Add Property dialog with comprehensive form
- ✅ Edit Property dialog with pre-filled data
- ✅ Stats cards showing property counts by status
- ✅ Empty state with call-to-action
- ✅ Loading states for async operations
- ✅ Toast notifications for user feedback

### ✅ **Property Fields**
- **Basic Info**: Name, Type, Description
- **Location**: Location, City, State, Postal Code, Full Address
- **Details**: Bedrooms (BHK), Bathrooms, Area (sq.ft), Price
- **Status**: Active, Upcoming, Ongoing, Ready to Move, Sold, Inactive

### ✅ **Data Integration**
- ✅ Connected to Supabase `properties` table
- ✅ Automatic tenant filtering (multi-tenant support)
- ✅ Real-time data fetching
- ✅ Optimistic UI updates
- ✅ Error handling with user-friendly messages

## 🚀 How to Use

### 1. **Access the Page**

Navigate to: `/dashboard/property-manager`

```tsx
// In your navigation or routing
<Link href="/dashboard/property-manager">Property Manager</Link>
```

### 2. **Prerequisites**

Before using this page, ensure:

1. ✅ Supabase project is set up
2. ✅ Database schema is created (run `supabase-schema.sql`)
3. ✅ Environment variables are configured (`.env.local`)
4. ✅ User is authenticated with Supabase Auth
5. ✅ User has a valid `tenant_id` in the `users` table

### 3. **Add a Property**

1. Click the **"Add Property"** button
2. Fill in the form:
   - **Required fields**: Project Name, Location, Property Type
   - **Optional fields**: All other fields
3. Click **"Add Property"** to save

### 4. **Edit a Property**

1. Click the **Edit** (pencil) icon on any property row
2. Update the fields in the dialog
3. Click **"Update Property"** to save changes

### 5. **Delete a Property**

1. Click the **Delete** (trash) icon on any property row
2. Confirm the deletion
3. Property is soft-deleted (can be recovered from database)

## 📊 Table Columns

| Column | Description | Example |
|--------|-------------|---------|
| **Project Name** | Property/project name | "Sukoon Residency" |
| **Location** | City or area | "Baner, Pune" |
| **Type** | Property type | "Residential" |
| **Configuration** | BHK, Bathrooms, Area | "2BHK • 2BA • 1200 sqft" |
| **Price** | Property price in INR | "₹50,00,000" |
| **Status** | Current status | Badge (Active, Sold, etc.) |
| **Actions** | Edit/Delete buttons | Icons |

## 🎨 Status Badges

The page includes color-coded status badges:

- 🟢 **Active** - Green
- 🔵 **Upcoming** - Blue
- 🟡 **Ongoing** - Amber
- 🟢 **Ready to Move** - Green
- ⚪ **Sold** - Gray
- 🔴 **Inactive** - Red

## 🔧 Customization

### Add New Property Types

Edit the `PROPERTY_TYPES` array in `page.tsx`:

```tsx
const PROPERTY_TYPES = [
  'Residential',
  'Commercial',
  'Industrial',
  'Land',
  'Villa',
  'Apartment',
  'Office',
  'Retail',
  'Your Custom Type', // Add here
]
```

### Add New Status Options

Edit the `PROPERTY_STATUSES` array:

```tsx
const PROPERTY_STATUSES = [
  { value: 'custom_status', label: 'Custom Status', color: 'bg-purple-500/10 text-purple-600' },
  // ... existing statuses
]
```

### Modify Form Fields

The form is divided into three sections:
1. **Basic Information** - Name, Type, Description
2. **Location Details** - Location, City, State, Address
3. **Property Details** - Bedrooms, Bathrooms, Area, Price, Status

Add new fields by editing the `PropertyForm` component.

## 🔐 Security

### Row Level Security (RLS)

The page automatically filters properties by `tenant_id`:

```tsx
const { data, error } = await supabase
  .from('properties')
  .select('*')
  .eq('tenant_id', profile.tenant_id) // Automatic tenant filtering
  .is('deleted_at', null)
```

### Permissions

- **View**: All authenticated users in the tenant
- **Create**: Managers and Admins (enforced by RLS)
- **Update**: Managers and Admins (enforced by RLS)
- **Delete**: Admins only (enforced by RLS)

## 📱 Responsive Design

The page is fully responsive:

- **Mobile**: Stacked layout, horizontal scroll for table
- **Tablet**: 2-column grid for stats
- **Desktop**: 4-column grid for stats, full table view

## 🐛 Troubleshooting

### "Failed to load properties"

**Causes:**
- User not authenticated
- User doesn't have `tenant_id`
- RLS policies blocking access
- Supabase connection issue

**Solution:**
1. Check browser console for errors
2. Verify user is logged in: `supabase.auth.getUser()`
3. Check user has `tenant_id` in `users` table
4. Verify RLS policies in Supabase dashboard

### "Failed to add property"

**Causes:**
- Missing required fields
- RLS policy blocking insert
- Invalid data types

**Solution:**
1. Ensure Name, Location, and Type are filled
2. Check user role has insert permissions
3. Verify data types match schema

### Properties not showing

**Causes:**
- No properties in database
- Tenant filter excluding data
- `deleted_at` is not null

**Solution:**
1. Add a test property
2. Check `tenant_id` matches user's tenant
3. Verify `deleted_at IS NULL` in database

## 🔄 Real-time Updates (Optional)

To add real-time updates when properties change:

```tsx
useEffect(() => {
  if (!profile?.tenant_id) return

  const channel = supabase
    .channel('properties_changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'properties',
        filter: `tenant_id=eq.${profile.tenant_id}`,
      },
      (payload) => {
        console.log('Property changed:', payload)
        fetchProperties() // Refresh the list
      }
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}, [profile?.tenant_id])
```

## 📈 Future Enhancements

Potential features to add:

- [ ] Image upload for properties
- [ ] Amenities multi-select
- [ ] Property search and filters
- [ ] Bulk operations (delete, update status)
- [ ] Export to CSV/Excel
- [ ] Property details page
- [ ] Lead assignment to properties
- [ ] Property analytics dashboard
- [ ] Map view with property locations
- [ ] Document attachments (brochures, floor plans)

## 🎓 Learning Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Next.js App Router](https://nextjs.org/docs/app)
- [Shadcn UI Components](https://ui.shadcn.com)
- [React Hook Form](https://react-hook-form.com)

## 📞 Support

If you encounter issues:

1. Check the browser console for errors
2. Review the Supabase logs in your dashboard
3. Verify your database schema matches `supabase-schema.sql`
4. Ensure environment variables are set correctly

---

**Status**: ✅ Fully Functional
**Last Updated**: 2026-01-29
**Version**: 1.0.0
