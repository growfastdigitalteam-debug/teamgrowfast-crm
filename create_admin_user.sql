-- Script to create Admin User (admin@admin.com / admin123)
-- Run this in your Supabase SQL Editor

-- 1. Create a Tenant for the Admin
INSERT INTO public.tenants (name, slug, subscription_plan)
VALUES ('Admin Company', 'admin-company', 'enterprise')
ON CONFLICT (slug) DO NOTHING;

-- 2. Create the User in auth.users
INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at
) VALUES (
    '00000000-0000-0000-0000-000000000000',
    uuid_generate_v4(),
    'authenticated',
    'authenticated',
    'admin@admin.com',
    crypt('admin123', gen_salt('bf')), -- Password: admin123
    now(),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Super Admin"}',
    now(),
    now()
) ON CONFLICT (email) DO NOTHING;

-- 3. Link the user to the tenant and make them an Admin
DO $$
DECLARE
    v_user_id UUID;
    v_tenant_id UUID;
BEGIN
    -- Get the user ID
    SELECT id INTO v_user_id FROM auth.users WHERE email = 'admin@admin.com';
    
    -- Get the tenant ID
    SELECT id INTO v_tenant_id FROM public.tenants WHERE slug = 'admin-company';

    -- Insert or Update public.users
    INSERT INTO public.users (id, email, full_name, role, tenant_id)
    VALUES (
        v_user_id,
        'admin@admin.com',
        'Super Admin',
        'admin', -- Role is set to admin
        v_tenant_id
    )
    ON CONFLICT (id) DO UPDATE
    SET 
        tenant_id = v_tenant_id, 
        role = 'admin',
        full_name = 'Super Admin';
    
END $$;
