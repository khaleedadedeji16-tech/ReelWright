import "server-only";

import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";
import { getSupabaseEnv } from "./env";

/**
 * Supabase ADMIN client. It uses the service role key, which skips row
 * level security, so it can read and change everything.
 *
 * Rules:
 * - Server code only. The "server-only" import above makes the build fail
 *   if this file is ever imported into browser code, and the check below
 *   stops it at run time as well.
 * - Use it only for the things users must not do themselves: credits,
 *   jobs, files, secrets, plans, admin flags.
 * - Always check who the signed-in user is first (with the normal server
 *   client), because this client does not.
 */
export function createAdminClient() {
  if (typeof window !== "undefined") {
    throw new Error("The Supabase admin client must never run in the browser.");
  }

  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    throw new Error(
      "Missing SUPABASE_SERVICE_ROLE_KEY. Add it to .env.local (and to the Vercel project settings). It must never have the NEXT_PUBLIC_ prefix.",
    );
  }

  const { url } = getSupabaseEnv();
  return createClient<Database>(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
