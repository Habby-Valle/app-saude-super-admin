import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!

/**
 * Client-side Supabase client.
 * Use em Client Components, hooks e Server Actions sem cookies.
 */
export function createClient() {
  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}
