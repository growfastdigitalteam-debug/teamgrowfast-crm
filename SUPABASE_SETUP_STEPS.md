# 🚀 SUPABASE SETUP - DO THIS FIRST!

## ⚡ Quick 5-Minute Setup

---

## Step 1: Supabase Dashboard

1. **Open:** https://supabase.com/dashboard
2. **Login** to your project
3. **Copy** your Project URL (already in `.env.local`) ✅

---

## Step 2: Run SQL Schema

### **IMPORTANT - Run This Once!**

1. Go to **SQL Editor** (left sidebar)
2. Click **"New Query"**
3. **Copy ENTIRE file:** `supabase-schema.sql`  
4. **Paste** into SQL editor
5. Click **"Run"** (or F5)
6. **Wait** 5-10 seconds
7. ✅ Should see "Success" message

**This creates:**
- ✅ `tenants` table (companies)
- ✅ `users` table (linked to auth)
- ✅ `leads` table (your leads)
- ✅ `crm_settings` table (categories, sources, statuses)
- ✅ RLS policies (security)

---

## Step 3: Create Test Users

### **Run These SQL Scripts:**

### A) Create Admin User
```sql
-- In SQL Editor, run this:

-- 1. Create tenant
INSERT INTO public.tenants (name, slug, subscription_plan)
VALUES ('GrowFastDigital', 'growfastdigital', 'enterprise')
ON CONFLICT (slug) DO NOTHING;

-- 2. Create auth user
INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at
) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'admin@admin.com',
    crypt('admin123', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Super Admin"}',
    now(),
    now()
) ON CONFLICT (email) DO NOTHING;

-- 3. Link user to tenant
DO $$
DECLARE
    v_user_id UUID;
    v_tenant_id UUID;
BEGIN
    SELECT id INTO v_user_id FROM auth.users WHERE email = 'admin@admin.com';
    SELECT id INTO v_tenant_id FROM public.tenants WHERE slug = 'growfastdigital';

    INSERT INTO public.users (id, email, full_name, role, tenant_id)
    VALUES (
        v_user_id,
        'admin@admin.com',
        'Super Admin',
        'admin',
        v_tenant_id
    )
    ON CONFLICT (id) DO UPDATE
    SET tenant_id = v_tenant_id, role = 'admin';
END $$;
```

---

### B) Create Default CRM Settings

```sql
-- Get your tenant ID first
SELECT id, name FROM public.tenants WHERE slug = 'growfastdigital';
-- Copy the UUID!

-- Replace YOUR_TENANT_ID below with the UUID you just copied

-- Categories
INSERT INTO crm_settings (tenant_id, type, name, color) VALUES
('YOUR_TENANT_ID', 'category', 'Hot Lead', '#ef4444'),
('YOUR_TENANT_ID', 'category', 'Warm Lead', '#f59e0b'),
('YOUR_TENANT_ID', 'category', 'Cold Lead', '#3b82f6'),
('YOUR_TENANT_ID', 'category', 'Converted', '#22c55e');

-- Sources
INSERT INTO crm_settings (tenant_id, type, name, color) VALUES
('YOUR_TENANT_ID', 'lead_source', 'Facebook', '#1877f2'),
('YOUR_TENANT_ID', 'lead_source', 'Google Ads', '#ea4335'),
('YOUR_TENANT_ID', 'lead_source', 'Instagram', '#e1306c'),
('YOUR_TENANT_ID', 'lead_source', 'Website', '#334155'),
('YOUR_TENANT_ID', 'lead_source', 'WhatsApp', '#25d366'),
('YOUR_TENANT_ID', 'lead_source', 'Cold Calling', '#6366f1'),
('YOUR_TENANT_ID', 'lead_source', 'Walk-in', '#f59e0b'),
('YOUR_TENANT_ID', 'lead_source', 'Referral', '#8b5cf6'),
('YOUR_TENANT_ID', 'lead_source', 'Newspaper', '#64748b');

-- Statuses
INSERT INTO crm_settings (tenant_id, type, name, color) VALUES
('YOUR_TENANT_ID', 'lead_status', 'Interested', '#22c55e'),
('YOUR_TENANT_ID', 'lead_status', 'Site Visit Scheduled', '#fbbf24'),
('YOUR_TENANT_ID', 'lead_status', 'Site Visit Completed', '#10b981'),
('YOUR_TENANT_ID', 'lead_status', 'Booked', '#3b82f6'),
('YOUR_TENANT_ID', 'lead_status', 'Junk Lead', '#ef4444'),
('YOUR_TENANT_ID', 'lead_status', 'Not Interested', '#991b1b'),
('YOUR_TENANT_ID', 'lead_status', 'Call Back', '#8b5cf6'),
('YOUR_TENANT_ID', 'lead_status', 'Not Responding', '#64748b');

-- Teams
INSERT INTO crm_settings (tenant_id, type, name, color) VALUES
('YOUR_TENANT_ID', 'team', 'Sales Team A', '#8b5cf6'),
('YOUR_TENANT_ID', 'team', 'Sales Team B', '#06b6d4'),
('YOUR_TENANT_ID', 'team', 'Support Team', '#f97316');
```

---

## Step 4: Verify Setup

### Check Tables Created:
1. Go to **Table Editor** (left sidebar)
2. Should see:
   - ✅ tenants
   - ✅ users
   - ✅ leads
   - ✅ crm_settings
   - ✅ activities
   - ✅ deals

### Check User Created:
1. Go to **Authentication** → **Users**
2. Should see: `admin@admin.com`

### Check Settings Created:
1. Go to **Table Editor** → `crm_settings`
2. Should see categories, sources, statuses

---

## ✅ Ready!

**After completing above steps:**
1. ✅ Database schema ready
2. ✅ Admin user created
3. ✅ Default settings ready
4. ✅ RLS policies active

**Now I can connect your dashboard to Supabase!**

---

## 🎯 Next Steps:

**Tell me when you've done:**
1. ✅ Run `supabase-schema.sql`
2. ✅ Created admin user (admin@admin.com)
3. ✅ Added default settings

**Then I'll:**
1. Update dashboard to fetch from Supabase
2. Update all CRUD operations
3. Remove local state
4. Test multi-device sync

---

**Batao - Setup complete ho gaya?** 📊
