# Welcome Page Design

## Context

After accepting a Supabase email invitation, `caregiver`, `family`, and `emergency_contact` users are redirected to `/welcome` since they don't have access to the admin panel. The admin panel is for `super_admin` and `clinic_admin` only.

## Design

**Location:** `app/(main)/welcome/page.tsx`

**Behavior:**
1. Verify user session via `getSession()`
2. If no session → redirect to `/login`
3. If session exists, fetch role from `users` table
4. Redirect based on role:

| Role | Destination (mocked) |
|------|---------------------|
| `caregiver` | `/app-cuidadores` |
| `family` | `/app-familiares` |
| `emergency_contact` | `/app-familiares` |
| `super_admin` / `clinic_admin` | `/login` |

**UI:** Simple loading state with "Redirecionando..." message.

## Technical Approach

- Use `createClient()` from `@/lib/supabase`
- Use `useEffect` to handle client-side redirect logic
- `router.replace()` to redirect without adding to history
- No authentication required on page itself (redirects if not authenticated)
