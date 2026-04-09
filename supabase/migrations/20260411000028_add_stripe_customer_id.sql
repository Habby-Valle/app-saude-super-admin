-- Add stripe_customer_id to clinics table
-- Used for Stripe Customer Portal integration

ALTER TABLE clinics 
ADD COLUMN IF NOT EXISTS stripe_customer_id text;

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_clinics_stripe_customer 
ON clinics(stripe_customer_id) 
WHERE stripe_customer_id IS NOT NULL;