-- Fix: Ensure admin@admin.com has default settings
-- Run this in Supabase SQL Editor

-- First check if settings exist
SELECT COUNT(*) FROM crm_settings WHERE tenant_id = (
    SELECT tenant_id FROM users WHERE email = 'admin@admin.com'
);

-- If count is 0, insert default settings
INSERT INTO crm_settings (tenant_id, name, type, color)
SELECT 
    (SELECT tenant_id FROM users WHERE email = 'admin@admin.com'),
    name,
    type,
    color
FROM (
    VALUES 
    -- Categories
    ('Hot Lead', 'category', '#ef4444'),
    ('Warm Lead', 'category', '#f97316'),
    ('Cold Lead', 'category', '#3b82f6'),
    ('Converted', 'category', '#10b981'),
    -- Sources
    ('Facebook', 'source', '#1877f2'),
    ('Google', 'source', '#ea4335'),
    ('Instagram', 'source', '#e1306c'),
    ('Referral', 'source', '#8b5cf6'),
    ('Direct', 'source', '#64748b'),
    ('WhatsApp', 'source', '#25d366'),
    ('Website', 'source', '#3b82f6'),
    -- Statuses
    ('New', 'status', '#3b82f6'),
    ('Interested', 'status', '#f59e0b'),
    ('Follow Up', 'status', '#8b5cf6'),
    ('Site Visit Scheduled', 'status', '#fbbf24'),
    ('Site Visit Completed', 'status', '#10b981'),
    ('Booked', 'status', '#10b981'),
    ('Not Interested', 'status', '#64748b'),
    ('Junk Lead', 'status', '#ef4444'),
    -- Teams
    ('Sales Team A', 'team', '#ec4899'),
    ('Sales Team B', 'team', '#06b6d4')
) AS t(name, type, color)
WHERE NOT EXISTS (
    SELECT 1 FROM crm_settings 
    WHERE tenant_id = (SELECT tenant_id FROM users WHERE email = 'admin@admin.com')
);

-- Verify
SELECT type, COUNT(*) as count 
FROM crm_settings 
WHERE tenant_id = (SELECT tenant_id FROM users WHERE email = 'admin@admin.com')
GROUP BY type;
