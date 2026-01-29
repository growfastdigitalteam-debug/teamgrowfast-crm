-- =====================================================
-- SUPABASE SCHEMA FOR MULTI-TENANT CRM
-- =====================================================
-- This schema implements a secure multi-tenant architecture
-- with Row Level Security (RLS) for data isolation
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. TENANTS TABLE
-- =====================================================
-- Stores organization/company information
-- Each tenant represents a separate customer organization

CREATE TABLE tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL, -- URL-friendly identifier
    domain VARCHAR(255), -- Custom domain (optional)
    logo_url TEXT,
    subscription_plan VARCHAR(50) DEFAULT 'free', -- free, starter, professional, enterprise
    subscription_status VARCHAR(50) DEFAULT 'active', -- active, suspended, cancelled
    max_users INTEGER DEFAULT 5,
    max_properties INTEGER DEFAULT 10,
    settings JSONB DEFAULT '{}', -- Flexible settings storage
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE -- Soft delete support
);

-- Indexes for performance
CREATE INDEX idx_tenants_slug ON tenants(slug);
CREATE INDEX idx_tenants_deleted_at ON tenants(deleted_at) WHERE deleted_at IS NULL;

-- =====================================================
-- 2. USERS TABLE
-- =====================================================
-- Stores user information linked to Supabase Auth
-- Links auth.users to tenant and role information

CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    avatar_url TEXT,
    role VARCHAR(50) NOT NULL DEFAULT 'user', -- super_admin, admin, manager, agent, user
    phone VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    last_login_at TIMESTAMP WITH TIME ZONE,
    preferences JSONB DEFAULT '{}', -- User preferences (theme, notifications, etc.)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE,
    
    CONSTRAINT unique_email_per_tenant UNIQUE(tenant_id, email)
);

-- Indexes
CREATE INDEX idx_users_tenant_id ON users(tenant_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_deleted_at ON users(deleted_at) WHERE deleted_at IS NULL;

-- =====================================================
-- 3. PROPERTIES TABLE
-- =====================================================
-- Stores property/project information for Property Manager

CREATE TABLE properties (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    location VARCHAR(255),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100),
    postal_code VARCHAR(20),
    type VARCHAR(100), -- residential, commercial, industrial, land, etc.
    status VARCHAR(50) DEFAULT 'active', -- active, inactive, sold, rented, under_construction
    price DECIMAL(15, 2),
    currency VARCHAR(10) DEFAULT 'USD',
    area DECIMAL(10, 2), -- Square footage/meters
    area_unit VARCHAR(20) DEFAULT 'sqft', -- sqft, sqm
    bedrooms INTEGER,
    bathrooms INTEGER,
    floors INTEGER,
    year_built INTEGER,
    images JSONB DEFAULT '[]', -- Array of image URLs
    amenities JSONB DEFAULT '[]', -- Array of amenities
    features JSONB DEFAULT '{}', -- Additional property features
    assigned_to UUID REFERENCES users(id), -- Property manager/agent
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Indexes
CREATE INDEX idx_properties_tenant_id ON properties(tenant_id);
CREATE INDEX idx_properties_status ON properties(status);
CREATE INDEX idx_properties_type ON properties(type);
CREATE INDEX idx_properties_assigned_to ON properties(assigned_to);
CREATE INDEX idx_properties_deleted_at ON properties(deleted_at) WHERE deleted_at IS NULL;

-- =====================================================
-- 4. CRM_SETTINGS TABLE
-- =====================================================
-- Stores customizable CRM settings per tenant
-- Used for activity types, lead sources, statuses, etc.

CREATE TABLE crm_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    type VARCHAR(100) NOT NULL, -- activity_type, lead_source, lead_status, priority, etc.
    name VARCHAR(255) NOT NULL,
    value VARCHAR(255), -- Optional value field
    color VARCHAR(50), -- Hex color code for UI display
    icon VARCHAR(100), -- Icon identifier
    description TEXT,
    sort_order INTEGER DEFAULT 0, -- For custom ordering
    is_active BOOLEAN DEFAULT true,
    is_default BOOLEAN DEFAULT false, -- Mark default options
    metadata JSONB DEFAULT '{}', -- Additional flexible data
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT unique_setting_per_tenant UNIQUE(tenant_id, type, name)
);

-- Indexes
CREATE INDEX idx_crm_settings_tenant_id ON crm_settings(tenant_id);
CREATE INDEX idx_crm_settings_type ON crm_settings(type);
CREATE INDEX idx_crm_settings_is_active ON crm_settings(is_active);

-- =====================================================
-- 5. LEADS TABLE
-- =====================================================
-- Stores lead/contact information

CREATE TABLE leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    
    -- Contact Information
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    alternate_phone VARCHAR(50),
    company VARCHAR(255),
    job_title VARCHAR(255),
    
    -- Lead Details
    status VARCHAR(100) DEFAULT 'new', -- new, contacted, qualified, proposal, negotiation, won, lost
    source VARCHAR(100), -- website, referral, social_media, advertisement, etc.
    priority VARCHAR(50) DEFAULT 'medium', -- low, medium, high, urgent
    score INTEGER DEFAULT 0, -- Lead scoring (0-100)
    
    -- Property & Assignment
    property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
    assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- Financial
    estimated_value DECIMAL(15, 2),
    currency VARCHAR(10) DEFAULT 'USD',
    
    -- Additional Information
    notes TEXT,
    tags JSONB DEFAULT '[]', -- Array of tags
    custom_fields JSONB DEFAULT '{}', -- Flexible custom fields
    
    -- Tracking
    last_contacted_at TIMESTAMP WITH TIME ZONE,
    next_follow_up_at TIMESTAMP WITH TIME ZONE,
    converted_at TIMESTAMP WITH TIME ZONE, -- When lead became customer
    
    -- Metadata
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Indexes
CREATE INDEX idx_leads_tenant_id ON leads(tenant_id);
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_source ON leads(source);
CREATE INDEX idx_leads_assigned_to ON leads(assigned_to);
CREATE INDEX idx_leads_property_id ON leads(property_id);
CREATE INDEX idx_leads_email ON leads(email);
CREATE INDEX idx_leads_phone ON leads(phone);
CREATE INDEX idx_leads_next_follow_up ON leads(next_follow_up_at);
CREATE INDEX idx_leads_deleted_at ON leads(deleted_at) WHERE deleted_at IS NULL;

-- =====================================================
-- 6. ACTIVITIES TABLE (BONUS)
-- =====================================================
-- Track all interactions with leads
-- This is essential for a CRM to log calls, emails, meetings, etc.

CREATE TABLE activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
    property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
    
    type VARCHAR(100) NOT NULL, -- call, email, meeting, note, task, etc.
    subject VARCHAR(255),
    description TEXT,
    outcome VARCHAR(100), -- successful, unsuccessful, follow_up_needed, etc.
    
    scheduled_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    duration_minutes INTEGER, -- For calls/meetings
    
    assigned_to UUID REFERENCES users(id),
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_activities_tenant_id ON activities(tenant_id);
CREATE INDEX idx_activities_lead_id ON activities(lead_id);
CREATE INDEX idx_activities_type ON activities(type);
CREATE INDEX idx_activities_assigned_to ON activities(assigned_to);
CREATE INDEX idx_activities_scheduled_at ON activities(scheduled_at);

-- =====================================================
-- 7. DEALS/OPPORTUNITIES TABLE (BONUS)
-- =====================================================
-- Track sales pipeline and deals

CREATE TABLE deals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
    property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
    
    title VARCHAR(255) NOT NULL,
    description TEXT,
    stage VARCHAR(100) DEFAULT 'prospecting', -- prospecting, qualification, proposal, negotiation, closed_won, closed_lost
    value DECIMAL(15, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'USD',
    probability INTEGER DEFAULT 0, -- 0-100%
    
    expected_close_date DATE,
    actual_close_date DATE,
    
    assigned_to UUID REFERENCES users(id),
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Indexes
CREATE INDEX idx_deals_tenant_id ON deals(tenant_id);
CREATE INDEX idx_deals_lead_id ON deals(lead_id);
CREATE INDEX idx_deals_stage ON deals(stage);
CREATE INDEX idx_deals_assigned_to ON deals(assigned_to);
CREATE INDEX idx_deals_deleted_at ON deals(deleted_at) WHERE deleted_at IS NULL;

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================
-- Enable RLS on all tables

ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- TENANTS POLICIES
-- =====================================================

-- Super admins can view all tenants
CREATE POLICY "Super admins can view all tenants"
    ON tenants FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role = 'super_admin'
        )
    );

-- Users can view their own tenant
CREATE POLICY "Users can view their own tenant"
    ON tenants FOR SELECT
    USING (
        id IN (
            SELECT tenant_id FROM users
            WHERE users.id = auth.uid()
        )
    );

-- Only super admins can insert/update/delete tenants
CREATE POLICY "Super admins can manage tenants"
    ON tenants FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role = 'super_admin'
        )
    );

-- =====================================================
-- USERS POLICIES
-- =====================================================

-- Users can view users in their tenant
CREATE POLICY "Users can view users in their tenant"
    ON users FOR SELECT
    USING (
        tenant_id IN (
            SELECT tenant_id FROM users
            WHERE users.id = auth.uid()
        )
    );

-- Admins can insert users in their tenant
CREATE POLICY "Admins can insert users in their tenant"
    ON users FOR INSERT
    WITH CHECK (
        tenant_id IN (
            SELECT tenant_id FROM users
            WHERE users.id = auth.uid()
            AND users.role IN ('super_admin', 'admin')
        )
    );

-- Admins can update users in their tenant
CREATE POLICY "Admins can update users in their tenant"
    ON users FOR UPDATE
    USING (
        tenant_id IN (
            SELECT tenant_id FROM users
            WHERE users.id = auth.uid()
            AND users.role IN ('super_admin', 'admin')
        )
    );

-- Users can update their own profile
CREATE POLICY "Users can update their own profile"
    ON users FOR UPDATE
    USING (id = auth.uid());

-- =====================================================
-- PROPERTIES POLICIES
-- =====================================================

-- Users can view properties in their tenant
CREATE POLICY "Users can view properties in their tenant"
    ON properties FOR SELECT
    USING (
        tenant_id IN (
            SELECT tenant_id FROM users
            WHERE users.id = auth.uid()
        )
    );

-- Managers and admins can insert properties
CREATE POLICY "Managers can insert properties"
    ON properties FOR INSERT
    WITH CHECK (
        tenant_id IN (
            SELECT tenant_id FROM users
            WHERE users.id = auth.uid()
            AND users.role IN ('super_admin', 'admin', 'manager')
        )
    );

-- Managers and admins can update properties
CREATE POLICY "Managers can update properties"
    ON properties FOR UPDATE
    USING (
        tenant_id IN (
            SELECT tenant_id FROM users
            WHERE users.id = auth.uid()
            AND users.role IN ('super_admin', 'admin', 'manager')
        )
    );

-- Admins can delete properties
CREATE POLICY "Admins can delete properties"
    ON properties FOR DELETE
    USING (
        tenant_id IN (
            SELECT tenant_id FROM users
            WHERE users.id = auth.uid()
            AND users.role IN ('super_admin', 'admin')
        )
    );

-- =====================================================
-- CRM_SETTINGS POLICIES
-- =====================================================

-- Users can view settings in their tenant
CREATE POLICY "Users can view settings in their tenant"
    ON crm_settings FOR SELECT
    USING (
        tenant_id IN (
            SELECT tenant_id FROM users
            WHERE users.id = auth.uid()
        )
    );

-- Admins can manage settings
CREATE POLICY "Admins can manage settings"
    ON crm_settings FOR ALL
    USING (
        tenant_id IN (
            SELECT tenant_id FROM users
            WHERE users.id = auth.uid()
            AND users.role IN ('super_admin', 'admin')
        )
    );

-- =====================================================
-- LEADS POLICIES
-- =====================================================

-- Users can view leads in their tenant
CREATE POLICY "Users can view leads in their tenant"
    ON leads FOR SELECT
    USING (
        tenant_id IN (
            SELECT tenant_id FROM users
            WHERE users.id = auth.uid()
        )
    );

-- Users can insert leads in their tenant
CREATE POLICY "Users can insert leads"
    ON leads FOR INSERT
    WITH CHECK (
        tenant_id IN (
            SELECT tenant_id FROM users
            WHERE users.id = auth.uid()
        )
    );

-- Users can update leads in their tenant
CREATE POLICY "Users can update leads"
    ON leads FOR UPDATE
    USING (
        tenant_id IN (
            SELECT tenant_id FROM users
            WHERE users.id = auth.uid()
        )
    );

-- Admins can delete leads
CREATE POLICY "Admins can delete leads"
    ON leads FOR DELETE
    USING (
        tenant_id IN (
            SELECT tenant_id FROM users
            WHERE users.id = auth.uid()
            AND users.role IN ('super_admin', 'admin', 'manager')
        )
    );

-- =====================================================
-- ACTIVITIES POLICIES
-- =====================================================

-- Users can view activities in their tenant
CREATE POLICY "Users can view activities in their tenant"
    ON activities FOR SELECT
    USING (
        tenant_id IN (
            SELECT tenant_id FROM users
            WHERE users.id = auth.uid()
        )
    );

-- Users can insert activities
CREATE POLICY "Users can insert activities"
    ON activities FOR INSERT
    WITH CHECK (
        tenant_id IN (
            SELECT tenant_id FROM users
            WHERE users.id = auth.uid()
        )
    );

-- Users can update their own activities
CREATE POLICY "Users can update their own activities"
    ON activities FOR UPDATE
    USING (
        created_by = auth.uid()
        OR assigned_to = auth.uid()
        OR EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role IN ('super_admin', 'admin', 'manager')
            AND users.tenant_id = activities.tenant_id
        )
    );

-- =====================================================
-- DEALS POLICIES
-- =====================================================

-- Users can view deals in their tenant
CREATE POLICY "Users can view deals in their tenant"
    ON deals FOR SELECT
    USING (
        tenant_id IN (
            SELECT tenant_id FROM users
            WHERE users.id = auth.uid()
        )
    );

-- Users can insert deals
CREATE POLICY "Users can insert deals"
    ON deals FOR INSERT
    WITH CHECK (
        tenant_id IN (
            SELECT tenant_id FROM users
            WHERE users.id = auth.uid()
        )
    );

-- Users can update deals
CREATE POLICY "Users can update deals"
    ON deals FOR UPDATE
    USING (
        tenant_id IN (
            SELECT tenant_id FROM users
            WHERE users.id = auth.uid()
        )
    );

-- Managers can delete deals
CREATE POLICY "Managers can delete deals"
    ON deals FOR DELETE
    USING (
        tenant_id IN (
            SELECT tenant_id FROM users
            WHERE users.id = auth.uid()
            AND users.role IN ('super_admin', 'admin', 'manager')
        )
    );

-- =====================================================
-- FUNCTIONS & TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to all tables
CREATE TRIGGER update_tenants_updated_at BEFORE UPDATE ON tenants
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_properties_updated_at BEFORE UPDATE ON properties
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_crm_settings_updated_at BEFORE UPDATE ON crm_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON leads
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_activities_updated_at BEFORE UPDATE ON activities
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_deals_updated_at BEFORE UPDATE ON deals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SEED DATA (OPTIONAL - FOR DEVELOPMENT)
-- =====================================================

-- Insert default CRM settings for activity types
-- You can run this after creating your first tenant

-- Example:
-- INSERT INTO crm_settings (tenant_id, type, name, color, icon) VALUES
-- ('YOUR_TENANT_ID', 'activity_type', 'Call', '#3b82f6', 'phone'),
-- ('YOUR_TENANT_ID', 'activity_type', 'Email', '#10b981', 'mail'),
-- ('YOUR_TENANT_ID', 'activity_type', 'Meeting', '#f59e0b', 'calendar'),
-- ('YOUR_TENANT_ID', 'activity_type', 'Note', '#6366f1', 'file-text'),
-- ('YOUR_TENANT_ID', 'lead_source', 'Website', '#8b5cf6', 'globe'),
-- ('YOUR_TENANT_ID', 'lead_source', 'Referral', '#ec4899', 'users'),
-- ('YOUR_TENANT_ID', 'lead_source', 'Social Media', '#06b6d4', 'share-2'),
-- ('YOUR_TENANT_ID', 'lead_status', 'New', '#10b981', 'circle'),
-- ('YOUR_TENANT_ID', 'lead_status', 'Contacted', '#3b82f6', 'phone'),
-- ('YOUR_TENANT_ID', 'lead_status', 'Qualified', '#f59e0b', 'check-circle'),
-- ('YOUR_TENANT_ID', 'lead_status', 'Won', '#22c55e', 'trophy'),
-- ('YOUR_TENANT_ID', 'lead_status', 'Lost', '#ef4444', 'x-circle');

-- =====================================================
-- NOTES & BEST PRACTICES
-- =====================================================
-- 1. Always filter by tenant_id in your application queries
-- 2. Use soft deletes (deleted_at) for important data
-- 3. Implement audit logging for compliance
-- 4. Consider adding full-text search indexes for leads/properties
-- 5. Monitor RLS policy performance with large datasets
-- 6. Use Supabase Realtime for live updates
-- 7. Implement proper backup strategies
-- 8. Add custom validation functions as needed
-- =====================================================
