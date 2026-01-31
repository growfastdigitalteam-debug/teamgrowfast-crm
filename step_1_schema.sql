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
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
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
    deleted_at TIMESTAMP WITH TIME ZONE,
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
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- ENABLE SECURITY (RLS)
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- CREATE POLICIES (Allow Access) - DROPPING EXISTING FIRST TO AVOID ERRORS
DROP POLICY IF EXISTS "Public tenants" ON tenants;
CREATE POLICY "Public tenants" ON tenants FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public users" ON users;
CREATE POLICY "Public users" ON users FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public settings" ON crm_settings;
CREATE POLICY "Public settings" ON crm_settings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public leads" ON leads;
CREATE POLICY "Public leads" ON leads FOR SELECT USING (true);

DROP POLICY IF EXISTS "Insert leads" ON leads;
CREATE POLICY "Insert leads" ON leads FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Update leads" ON leads;
CREATE POLICY "Update leads" ON leads FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Delete leads" ON leads;
CREATE POLICY "Delete leads" ON leads FOR DELETE USING (true);
