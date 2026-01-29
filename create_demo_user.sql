-- Script to create a Demo User
-- Run this in your Supabase SQL Editor

-- 1. Create a Tenant for the Demo User
INSERT INTO public.tenants (name, slug, icon, subscription_plan)
VALUES ('Demo Company', 'demo-company', 'https://api.dicebear.com/7.x/initials/svg?seed=DC', 'pro')
ON CONFLICT (slug) DO NOTHING;

-- 2. Create the User in auth.users (This simulates a sign-up)
-- Note: We can't set the password directly here because it's hashed.
-- Ideally, you should sign up via the app.
-- BUT, if you want to force it for testing:

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
    'demo@teamgrowfast.com',
    crypt('demo123456', gen_salt('bf')), -- This sets the password to 'demo123456'
    now(),
    now(),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Demo User"}',
    now(),
    now(),
    '',
    '',
    '',
    ''
) ON CONFLICT (email) DO NOTHING;

-- 3. Link the user to the tenant (Important!)
-- We need to find the ID of the user we just created (or existing one)
DO $$
DECLARE
    v_user_id UUID;
    v_tenant_id UUID;
BEGIN
    -- Get the user ID
    SELECT id INTO v_user_id FROM auth.users WHERE email = 'demo@teamgrowfast.com';
    
    -- Get the tenant ID
    SELECT id INTO v_tenant_id FROM public.tenants WHERE slug = 'demo-company';

    -- Insert into public.users if not exists
    INSERT INTO public.users (id, email, full_name, role, tenant_id)
    VALUES (
        v_user_id,
        'demo@teamgrowfast.com',
        'Demo User',
        'admin',
        v_tenant_id
    )
    ON CONFLICT (id) DO UPDATE
    SET tenant_id = v_tenant_id, role = 'admin';
    
END $$;
