-- ULTIMATE LOGIN FIX SCRIPT
-- Run this entire script in Supabase SQL Editor

-- 1. Enable required extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create the Admin Tenant
INSERT INTO public.tenants (name, slug, subscription_plan)
VALUES ('Admin Company', 'admin-company', 'enterprise')
ON CONFLICT (slug) DO NOTHING;

-- 3. Create the User in Auth System
-- We use a DELETE + INSERT approach to ensure a clean slate for this user
DELETE FROM auth.users WHERE email = 'admin@admin.com';

INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    recovery_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
) VALUES (
    '00000000-0000-0000-0000-000000000000',
    uuid_generate_v4(),
    'authenticated',
    'authenticated',
    'admin@admin.com',
    crypt('admin123', gen_salt('bf')), -- Password: admin123
    now(),
    now(),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Super Admin"}',
    now(),
    now(),
    '',
    '',
    '',
    ''
);

-- 4. Create proper public profile
INSERT INTO public.users (id, email, full_name, role, tenant_id)
SELECT 
    id, 
    email, 
    'Super Admin', 
    'admin', 
    (SELECT id FROM public.tenants WHERE slug = 'admin-company')
FROM auth.users 
WHERE email = 'admin@admin.com'
ON CONFLICT (id) DO UPDATE 
SET 
    role = 'admin',
    tenant_id = (SELECT id FROM public.tenants WHERE slug = 'admin-company');

-- 5. Create a test lead so you see data
INSERT INTO public.leads (tenant_id, name, email, phone, status, source)
SELECT 
    (SELECT id FROM public.tenants WHERE slug = 'admin-company'),
    'Test Customer', 
    'test@example.com', 
    '123-456-7890', 
    'new', 
    'Website'
WHERE NOT EXISTS (SELECT 1 FROM public.leads WHERE email = 'test@example.com');
