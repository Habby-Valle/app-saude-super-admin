-- Returns last_sign_in_at from auth.users for a given set of user IDs.
-- This is necessary because public.users.last_sign_in_at is not
-- automatically synced from auth.users by Supabase Auth.
-- SECURITY DEFINER so the function can access the auth schema.

CREATE OR REPLACE FUNCTION public.get_auth_users_last_sign_in(user_ids UUID[])
RETURNS TABLE(id UUID, last_sign_in_at TIMESTAMPTZ)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = auth
AS $$
BEGIN
  RETURN QUERY
  SELECT u.id, u.last_sign_in_at
  FROM auth.users u
  WHERE u.id = ANY(user_ids);
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_auth_users_last_sign_in TO authenticated;
