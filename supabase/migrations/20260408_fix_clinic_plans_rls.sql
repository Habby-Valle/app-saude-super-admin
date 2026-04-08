-- Fix: RLS policy for clinic_plans using custom get_my_role function
-- Date: 2026-04-08
-- Problem: clinic_admin couldn't read clinic_plans due to JWT role mismatch

-- Step 1: Create helper function to check clinic plan access
CREATE OR REPLACE FUNCTION public.user_can_view_clinic_plan(plan_clinic_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  user_role TEXT;
  user_clinic_id UUID;
BEGIN
  user_role := public.get_my_role();
  user_clinic_id := (SELECT clinic_id FROM users WHERE id = auth.uid());
  
  RETURN (user_role = 'super_admin') 
      OR (user_role = 'clinic_admin' AND plan_clinic_id = user_clinic_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 2: Replace the broken policy
DROP POLICY IF EXISTS "Clinic admin can view own clinic plans" ON clinic_plans;

CREATE POLICY "Users can view their clinic plans"
ON clinic_plans FOR SELECT
USING (public.user_can_view_clinic_plan(clinic_id));
