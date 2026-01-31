-- 1. Create Tenant (Simple Insert)
INSERT INTO public.tenants (name, slug, subscription_plan)
SELECT 'GrowFastDigital', 'growfastdigital', 'enterprise'
WHERE NOT EXISTS (
    SELECT 1 FROM public.tenants WHERE slug = 'growfastdigital'
);

-- 2. Create Auth User (Using Supabase Function if possible, or direct insert safe check)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'admin@admin.com') THEN
        INSERT INTO auth.users (
            instance_id, id, aud, role, email, encrypted_password,
            email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
            created_at, updated_at
        ) VALUES (
            '00000000-0000-0000-0000-000000000000',
            gen_random_uuid(),
            'authenticated', 'authenticated',
            'admin@admin.com',
            crypt('admin123', gen_salt('bf')),
            now(),
            '{"provider":"email","providers":["email"]}',
            '{"full_name":"Super Admin"}',
            now(), now()
        );
    END IF;
END $$;

-- 3. Link User to Tenant (Safe Update)
DO $$
DECLARE
    v_user_id UUID;
    v_tenant_id UUID;
BEGIN
    -- Get User ID
    SELECT id INTO v_user_id FROM auth.users WHERE email = 'admin@admin.com';
    
    -- Get Tenant ID
    SELECT id INTO v_tenant_id FROM public.tenants WHERE slug = 'growfastdigital';
    
    -- Check if link exists, if not insert, else update
    IF EXISTS (SELECT 1 FROM public.users WHERE id = v_user_id) THEN
        UPDATE public.users 
        SET tenant_id = v_tenant_id, role = 'admin'
        WHERE id = v_user_id;
    ELSE
        INSERT INTO public.users (id, email, full_name, role, tenant_id)
        VALUES (v_user_id, 'admin@admin.com', 'Super Admin', 'admin', v_tenant_id);
    END IF;
END $$;
