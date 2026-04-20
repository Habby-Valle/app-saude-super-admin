-- Adicionar campos de configurações do sistema
ALTER TABLE system_settings
ADD COLUMN IF NOT EXISTS app_name TEXT DEFAULT 'App Saúde',
ADD COLUMN IF NOT EXISTS app_url TEXT,
ADD COLUMN IF NOT EXISTS app_site_url TEXT,
ADD COLUMN IF NOT EXISTS app_store_url TEXT,
ADD COLUMN IF NOT EXISTS play_store_url TEXT,
ADD COLUMN IF NOT EXISTS support_email TEXT,
ADD COLUMN IF NOT EXISTS support_phone TEXT,
ADD COLUMN IF NOT EXISTS support_whatsapp TEXT,
ADD COLUMN IF NOT EXISTS admin_logo_url TEXT,
ADD COLUMN IF NOT EXISTS cnpj TEXT,
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'America/Sao_Paulo',
ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'BRL';

-- Atualizar registro padrão com valores default
UPDATE system_settings
SET 
    app_name = COALESCE(app_name, 'App Saúde'),
    timezone = COALESCE(timezone, 'America/Sao_Paulo'),
    currency = COALESCE(currency, 'BRL')
WHERE app_name IS NULL;
