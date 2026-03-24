-- ============================================================
-- Migration 007: Seed — Super Admin inicial
-- ============================================================

create extension if not exists pgcrypto;

-- Cria o usuário no Supabase Auth apenas se não existir
do $$
begin
  if not exists (select 1 from auth.users where email = 'habby@admin.com') then
    insert into auth.users (
      id,
      instance_id,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      role,
      aud,
      created_at,
      updated_at
    ) values (
      gen_random_uuid(),
      '00000000-0000-0000-0000-000000000000',
      'habby@admin.com',
      extensions.crypt('Senha123!', extensions.gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}',
      '{"name":"Habby Super Admin"}',
      'authenticated',
      'authenticated',
      now(),
      now()
    );
  end if;
end;
$$;

-- Insere perfil público vinculado ao auth.users
insert into public.users (id, clinic_id, name, email, role, status)
select
  id,
  null,
  'Habby Super Admin',
  'habby@admin.com',
  'super_admin',
  'active'
from auth.users
where email = 'habby@admin.com'
on conflict (id) do nothing;
