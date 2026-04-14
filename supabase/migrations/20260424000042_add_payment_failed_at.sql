-- Add payment_failed_at column to clinic_plans for grace period tracking
ALTER TABLE clinic_plans 
ADD COLUMN IF NOT EXISTS payment_failed_at TIMESTAMPTZ;

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_clinic_plans_payment_failed_at 
ON clinic_plans(payment_failed_at) 
WHERE payment_failed_at IS NOT NULL;