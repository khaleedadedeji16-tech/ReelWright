import "server-only";

import { notFound, redirect } from "next/navigation";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { resolveAccess } from "./access";
import type { UserRole } from "./roles";

/** The logged-in user, as the app needs to know them. */
export type Viewer = {
  id: string;
  email: string | null;
  displayName: string | null;
  role: UserRole | null;
  isAdmin: boolean;
  timeZone: string;
};

/**
 * Who is logged in, or null. Asks Supabase to confirm the session (it does
 * not just trust the cookie) and reads the user's own profile row with the
 * normal user client. Runs at most once per request.
 */
export const getViewer = cache(async (): Promise<Viewer | null> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, role, is_admin, time_zone")
    .eq("id", user.id)
    .maybeSingle();

  return {
    id: user.id,
    email: user.email ?? null,
    displayName: profile?.display_name ?? null,
    role: profile?.role ?? null,
    isAdmin: profile?.is_admin ?? false,
    timeZone: profile?.time_zone ?? "UTC",
  };
});

/**
 * The server-side check for a protected page or layout. Applies the same
 * rules as proxy.ts. If the visitor may not be here it redirects them (or
 * shows "not found") and never returns.
 *
 * @param pathname the path being protected, for example "/author"
 */
export async function requireAccess(pathname: string): Promise<Viewer> {
  const viewer = await getViewer();
  const decision = resolveAccess(
    pathname,
    viewer ? { role: viewer.role, isAdmin: viewer.isAdmin } : null,
  );
  if (decision.type === "redirect") redirect(decision.to);
  if (decision.type === "not-found" || !viewer) notFound();
  return viewer;
}
