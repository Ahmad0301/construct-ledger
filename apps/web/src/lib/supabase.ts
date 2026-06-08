import { createBrowserClient } from '@supabase/ssr';

/**
 * Browser-side Supabase client — uses the anon key.
 * RLS policies in the database enforce what each user can actually see.
 * Never use the service role key on the frontend.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
