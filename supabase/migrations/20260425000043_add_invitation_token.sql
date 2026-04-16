-- Add invitation_token column to users table for accept-invitation flow
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS invitation_token UUID UNIQUE;

-- Create index for fast lookup
CREATE INDEX IF NOT EXISTS idx_users_invitation_token 
ON users(invitation_token);

-- Add expires_at to invalidate old tokens (24 hours)
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS invitation_expires_at TIMESTAMPTZ;