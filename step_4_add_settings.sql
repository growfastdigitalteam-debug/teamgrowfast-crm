DO $$
DECLARE
    v_tenant_id UUID;
BEGIN
    -- 1. Get Tenant ID automatically (Smart Lookup)
    SELECT id INTO v_tenant_id FROM public.tenants WHERE slug = 'growfastdigital';

    IF v_tenant_id IS NOT NULL THEN
        
        -- 2. CATEGORIES
        INSERT INTO crm_settings (tenant_id, type, name, color) VALUES
        (v_tenant_id, 'category', 'Hot Lead', '#ef4444'),
        (v_tenant_id, 'category', 'Warm Lead', '#f59e0b'),
        (v_tenant_id, 'category', 'Cold Lead', '#3b82f6'),
        (v_tenant_id, 'category', 'Converted', '#22c55e')
        ON CONFLICT DO NOTHING;

        -- 3. SOURCES
        INSERT INTO crm_settings (tenant_id, type, name, color) VALUES
        (v_tenant_id, 'source', 'Facebook', '#1877f2'),
        (v_tenant_id, 'source', 'Google Ads', '#ea4335'),
        (v_tenant_id, 'source', 'Instagram', '#e1306c'),
        (v_tenant_id, 'source', 'Website', '#334155'),
        (v_tenant_id, 'source', 'WhatsApp', '#25d366'),
        (v_tenant_id, 'source', 'Referral', '#8b5cf6'),
        (v_tenant_id, 'source', 'Walk-in', '#f59e0b')
        ON CONFLICT DO NOTHING;
        
         -- 4. STATUSES (Activity Types)
        INSERT INTO crm_settings (tenant_id, type, name, color) VALUES
        (v_tenant_id, 'status', 'Interested', '#22c55e'),
        (v_tenant_id, 'status', 'Site Visit Scheduled', '#fbbf24'),
        (v_tenant_id, 'status', 'Site Visit Completed', '#10b981'),
        (v_tenant_id, 'status', 'Booked', '#3b82f6'),
        (v_tenant_id, 'status', 'Junk Lead', '#ef4444'),
        (v_tenant_id, 'status', 'Not Interested', '#991b1b'),
        (v_tenant_id, 'status', 'Call Back', '#8b5cf6'),
        (v_tenant_id, 'status', 'Not Responding', '#64748b')
        ON CONFLICT DO NOTHING;

        -- 5. TEAMS
        INSERT INTO crm_settings (tenant_id, type, name, color) VALUES
        (v_tenant_id, 'team', 'Sales Team A', '#8b5cf6'),
        (v_tenant_id, 'team', 'Sales Team B', '#06b6d4'),
        (v_tenant_id, 'team', 'Support Team', '#f97316')
        ON CONFLICT DO NOTHING;

    END IF;
END $$;
