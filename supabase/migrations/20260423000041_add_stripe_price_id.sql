-- Add stripe_price_id to plans table

ALTER TABLE plans ADD COLUMN IF NOT EXISTS stripe_price_id TEXT;