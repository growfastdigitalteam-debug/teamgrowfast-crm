# 📊 Migration Checklist

## Current Status

Your old `app/page.tsx` (3,265 lines) has been replaced with a redirect. 
A temporary dashboard is now at `app/dashboard/page.tsx`.

## What to Do Next

### Option 1: Gradual Migration (Recommended)

Migrate your old dashboard components piece by piece:

1. **Week 1: Core Dashboard**
   - [ ] Create `components/dashboard/stats-grid.tsx` 
   - [ ] Create `components/dashboard/conversion-widget.tsx`
   - [ ] Migrate dashboard stats calculation
   - [ ] Update `app/dashboard/page.tsx` to use new components

2. **Week 2: Leads Table**
   - [ ] Create `components/leads/leads-table.tsx`
   - [ ] Create `components/leads/lead-filters.tsx`
   - [ ] Create `app/dashboard/leads/page.tsx`
   - [ ] Use `useLeads()` hook instead of useState

3. **Week 3: Lead Modals**
   - [ ] Create `components/leads/add-lead-modal.tsx`
   - [ ] Create `components/leads/edit-lead-modal.tsx`
   - [ ] Create `components/leads/followup-modal.tsx`
   - [ ] Use `useCreateLead()`, `useUpdateLead()` hooks

4. **Week 4: Settings & Polish**
   - [ ] Create `app/dashboard/settings/page.tsx`
   - [ ] Create category/source/status management UI
   - [ ] Add export buttons
   - [ ] Add bulk actions
   - [ ] Mobile optimization

### Option 2: Keep Old Code Temporarily

If you want to keep the old system working while migrating:

1. Rename old `page.tsx` to `page_old.tsx` (already in backup)
2. Copy-paste sections you need into new components
3. Delete old file when migration is complete

## Files to Migrate

### From `app/page.tsx` (OLD - 3265 lines)

Extract these components:

```typescript
// Lines ~1087-1226: CRMUserDashboard
// → Move to: app/dashboard/layout.tsx (sidebar + header)

// Lines ~1229-1467: DashboardView
// → Move to: app/dashboard/page.tsx (main dashboard)

// Lines ~1469-1527: SidebarConversionWidget
// → Move to: components/dashboard/conversion-widget.tsx

// Lines ~1535-1623: AddLeadModal
// → Move to: components/leads/add-lead-modal.tsx

// Lines ~1625-1913: CategorysView
// → Move to: app/dashboard/categories/page.tsx

// Lines ~1915-2365: LeadsCenterView
// → Move to: app/dashboard/leads/page.tsx

// Lines ~2373-2500: LeadsAssignView
// → Move to: app/dashboard/leads/assign/page.tsx

// Lines ~2502-2700: UserListView
// → Move to: app/dashboard/users/page.tsx

// Lines ~2702-2800: SettingsView
// → Move to: app/dashboard/settings/page.tsx
```

## Code Changes Needed

### Replace useState with React Query

**OLD:**
```typescript
const [leads, setLeads] = useState<Lead[]>([])

useEffect(() => {
  fetchLeadsFromSupabase()
}, [])
```

**NEW:**
```typescript
const { data: leads, isLoading } = useLeads(user?.tenantId)
// Automatic caching, refetching, error handling!
```

### Replace alert() with toast

**OLD:**
```typescript
alert('Lead created successfully')
```

**NEW:**
```typescript
const toast = useToast()
toast.success('Lead created successfully')
```

### Replace direct Supabase calls with hooks

**OLD:**
```typescript
const { data, error } = await supabase.from('leads').insert(newLead)
if (error) alert(error.message)
setLeads([...leads, newLead])
```

**NEW:**
```typescript
const createLead = useCreateLead()
createLead.mutate({ tenantId, userId, data: formData })
// Automatic error toast + refetch!
```

## Testing Checklist

After migration:

- [ ] Can login with Supabase credentials
- [ ] Dashboard loads and shows data
- [ ] Can create new lead
- [ ] Can edit existing lead
- [ ] Can delete lead
- [ ] Can assign leads
- [ ] Can manage categories/sources
- [ ] Export to Excel/CSV works
- [ ] Toast notifications appear
- [ ] Loading states show
- [ ] Errors handled gracefully
- [ ] Mobile responsive
- [ ] No console errors

## Backup Plan

Before you start:

```bash
# Create a backup branch
git checkout -b backup-before-refactor

# Or just keep the old page.tsx as reference
cp app/page.tsx app/page_ORIGINAL_BACKUP.tsx
```

## Need Help?

1. Check `IMPLEMENTATION_GUIDE.md` for API usage
2. Check `REFACTORING_PROGRESS.md` for what's done
3. Look at new files in `lib/api/` for examples
4. Test individual hooks in isolation first

---

**Good luck with the migration! Take it step by step. 🚀**
