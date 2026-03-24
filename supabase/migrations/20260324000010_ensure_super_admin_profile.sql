-- ============================================================
-- Migration 010: Garante que o perfil do super admin existe
-- em public.users (corrige falha silenciosa da migration 007)
-- ============================================================

do $$
declare
  v_user_id uuid;
begin
  -- Busca o auth.users pelo email
  select id into v_user_id
  from auth.users
  where email = 'habby@admin.com'
  limit 1;

  if v_user_id is null then
    raise exception 'Usuário habby@admin.com não encontrado em auth.users. Execute a migration 007 primeiro.';
  end if;

  -- Insere ou atualiza o perfil público
  insert into public.users (id, clinic_id, name, email, role, status, created_at)
  values (
    v_user_id,
    null,
    'Habby Super Admin',
    'habby@admin.com',
    'super_admin',
    'active',
    now()
  )
  on conflict (id) do update
    set role   = 'super_admin',
        status = 'active';

  raise notice 'Perfil super admin garantido para user_id: %', v_user_id;
end;
$$;
