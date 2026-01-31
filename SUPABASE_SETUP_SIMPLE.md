# ✅ SUPABASE SETUP - SUPER SIMPLE STEPS

Follow these steps exactly:

---

## 📍 **STEP 1: Open Supabase Dashboard**

1. Go to: **https://supabase.com/dashboard**
2. Click on your project
3. Click on **"SQL Editor"** (icon looks like a database/terminal on the left)
4. Click **"+ New Query"**

---

## 📍 **STEP 2: Run Schema SQL**

**Copy THIS text below and Paste it into the SQL Editor, then click RUN:**

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. TENANTS TABLE
CREATE TABLE IF NOT EXISTS tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    subscription_plan VARCHAR(50) DEFAULT 'free',
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    role VARCHAR(50) NOT NULL DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_email_per_tenant UNIQUE(tenant_id, email)
);

-- 3. CRM SETTINGS TABLE
CREATE TABLE IF NOT EXISTS crm_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    type VARCHAR(100) NOT NULL,
    name VARCHAR(255) NOT NULL,
    color VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_setting_per_tenant UNIQUE(tenant_id, type, name)
);

-- 4. LEADS TABLE
CREATE TABLE IF NOT EXISTS leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    status VARCHAR(100) DEFAULT 'new',
    source VARCHAR(100),
    category VARCHAR(100),
    assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ENABLE SECURITY (RLS)
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- CREATE POLICIES (Allow Access)
CREATE POLICY "Public tenants" ON tenants FOR SELECT USING (true);
CREATE POLICY "Public users" ON users FOR SELECT USING (true);
CREATE POLICY "Public settings" ON crm_settings FOR SELECT USING (true);
CREATE POLICY "Public leads" ON leads FOR SELECT USING (true);
CREATE POLICY "Insert leads" ON leads FOR INSERT WITH CHECK (true);
CREATE POLICY "Update leads" ON leads FOR UPDATE USING (true);
CREATE POLICY "Delete leads" ON leads FOR DELETE USING (true);
```

---

## 📍 **STEP 3: Create Admin User**

**Clear the editor, then Copy & Run THIS:**

```sql
-- 1. Create Tenant
INSERT INTO public.tenants (name, slug, subscription_plan)
VALUES ('GrowFastDigital', 'growfastdigital', 'enterprise')
ON CONFLICT (slug) DO NOTHING;

-- 2. Create Auth User
INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at, confirmation_token, recovery_token
) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated', 'authenticated',
    'admin@admin.com',
    crypt('admin123', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Super Admin"}',
    now(), now(), '', ''
) ON CONFLICT (email) DO NOTHING;

-- 3. Link User
DO $$
DECLARE
    v_user_id UUID;
    v_tenant_id UUID;
BEGIN
    SELECT id INTO v_user_id FROM auth.users WHERE email = 'admin@admin.com';
    SELECT id INTO v_tenant_id FROM public.tenants WHERE slug = 'growfastdigital';
    
    INSERT INTO public.users (id, email, full_name, role, tenant_id)
    VALUES (v_user_id, 'admin@admin.com', 'Super Admin', 'admin', v_tenant_id)
    ON CONFLICT (id) DO UPDATE SET tenant_id = v_tenant_id, role = 'admin';
END $$;
```

---

## 📍 **STEP 4: Get Tenant ID**

**Clear the editor, then Copy & Run THIS:**

```sql
SELECT id FROM public.tenants WHERE slug = 'growfastdigital';
```

---

## ❓ **FINAL STEP:**

**Jo ID aayega (Step 4 mein), wo mujhe copy karke bhejo!**
Example ID: `123e4567-e89b-12d3-a456-426614174000`

Bas ye ID chahiye, phir main dashboard connect kar dunga! 🚀
