-- Desabilitar trigger que ativa usuário automaticamente ao confirmar email
-- Agora o status só será 'active' quando o usuário definir sua senha
DROP TRIGGER IF EXISTS on_email_confirmed ON auth.users;

-- Mantém a função mas não faz mais nada (pode ser útil no futuro)
CREATE OR REPLACE FUNCTION public.activate_user_on_email_confirm()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Trigger desabilitado - status só muda após definir senha
  RETURN NEW;
END;
$$;