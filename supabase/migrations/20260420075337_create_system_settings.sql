-- Sistema de configurações globais
CREATE TABLE IF NOT EXISTS system_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    maintenance_mode BOOLEAN DEFAULT FALSE,
    maintenance_message TEXT DEFAULT 'Sistema em manutenção. Em breve retornaremos.',
    maintenance_planned_end TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- Policy: everyone can read
CREATE POLICY "system_settings_read" ON system_settings
    FOR SELECT USING (true);

-- Policy: only super_admin can update
CREATE POLICY "system_settings_update" ON system_settings
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role = 'super_admin'
        )
    );

-- Insert default settings
INSERT INTO system_settings (id, maintenance_mode, maintenance_message)
VALUES (gen_random_uuid(), false, 'Sistema em manutenção. Em breve retornaremos.')
ON CONFLICT DO NOTHING;

-- Function to update timestamp
CREATE OR REPLACE FUNCTION update_system_settings_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger
CREATE TRIGGER update_system_settings_timestamp
    BEFORE UPDATE ON system_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_system_settings_timestamp();
