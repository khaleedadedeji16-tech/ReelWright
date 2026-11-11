/**
 * Supabase environment variables.
 *
 * Both are public (NEXT_PUBLIC_*) values: the anon key is designed to be
 * shipped to the browser and is protected by Row Level Security.
 * Real values live in .env.local only — never commit them.
 */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/** True when both Supabase variables are set. Never exposes their values. */
export function hasSupabaseEnv(): boolean {
  return Boolean(supabaseUrl && supabaseAnonKey);
}

/** Returns the Supabase settings, or throws a clear error if any are missing. */
export function getSupabaseEnv(): { url: string; anonKey: string } {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Missing Supabase environment variables. Copy .env.example to .env.local and fill in NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    );
  }
  return { url: supabaseUrl, anonKey: supabaseAnonKey };
}
