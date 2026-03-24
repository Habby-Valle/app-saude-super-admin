-- ============================================================
-- Migration 008: Corrige seed do super admin
-- Adiciona registro em auth.identities (necessário para login)
-- ============================================================

do $$
declare
  v_user_id uuid;
begin
  -- Pega o id do usuário criado na migration 007
  select id into v_user_id
  from auth.users
  where email = 'habby@admin.com';

  if v_user_id is null then
    raise exception 'Super admin não encontrado em auth.users';
  end if;

  -- Insere a identidade email (obrigatório para o GoTrue autenticar)
  if not exists (
    select 1 from auth.identities
    where user_id = v_user_id and provider = 'email'
  ) then
    insert into auth.identities (
      id,
      user_id,
      provider_id,
      identity_data,
      provider,
      last_sign_in_at,
      created_at,
      updated_at
    ) values (
      gen_random_uuid(),
      v_user_id,
      'habby@admin.com',
      jsonb_build_object('sub', v_user_id::text, 'email', 'habby@admin.com'),
      'email',
      now(),
      now(),
      now()
    );
  end if;
end;
$$;
