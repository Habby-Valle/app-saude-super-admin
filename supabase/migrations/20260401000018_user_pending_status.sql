-- ─── 1. Adiciona 'pending' ao status de usuários ─────────────────────────────
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_status_check;

ALTER TABLE users
  ADD CONSTRAINT users_status_check
    CHECK (status IN ('active', 'blocked', 'pending'));

-- ─── 2. Altera default para 'pending' (novos convites nascem pendentes) ───────
ALTER TABLE users ALTER COLUMN status SET DEFAULT 'pending';

-- ─── 3. Função que ativa o usuário ao confirmar e-mail (aceitar convite) ─────
CREATE OR REPLACE FUNCTION public.activate_user_on_email_confirm()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Dispara quando email_confirmed_at muda de NULL para um valor (aceite do convite)
  IF OLD.email_confirmed_at IS NULL AND NEW.email_confirmed_at IS NOT NULL THEN
    UPDATE public.users
    SET status = 'active'
    WHERE id = NEW.id AND status = 'pending';
  END IF;
  RETURN NEW;
END;
$$;

-- ─── 4. Trigger no auth.users ─────────────────────────────────────────────────
DROP TRIGGER IF EXISTS on_email_confirmed ON auth.users;

CREATE TRIGGER on_email_confirmed
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.activate_user_on_email_confirm();
