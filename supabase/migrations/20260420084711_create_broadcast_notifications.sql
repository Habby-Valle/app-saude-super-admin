-- Tabela para notificações broadcast (envio em massa)
CREATE TABLE IF NOT EXISTS broadcast_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    target_role TEXT NOT NULL DEFAULT 'all'
        CHECK (target_role IN ('all', 'caregiver', 'family', 'emergency_contact')),
    status TEXT NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'sending', 'sent', 'failed')),
    recipient_count INTEGER DEFAULT 0,
    sent_count INTEGER DEFAULT 0,
    failed_count INTEGER DEFAULT 0,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    sent_at TIMESTAMPTZ
);

-- RLS
ALTER TABLE broadcast_notifications ENABLE ROW LEVEL SECURITY;

-- Policy: only super_admin can manage
CREATE POLICY "broadcast_super_admin_all" ON broadcast_notifications
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role = 'super_admin'
        )
    );

-- Index
CREATE INDEX idx_broadcast_notifications_created_at 
    ON broadcast_notifications(created_at DESC);