import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isAccessControlled, resolveAccess, type AccessViewer } from "@/lib/auth/access";
import type { Database } from "@/lib/database.types";
import { getSupabaseEnv, hasSupabaseEnv } from "@/lib/supabase/env";

/**
 * Runs before every page request. It does two jobs:
 * 1. Keeps the Supabase login session fresh (renews its cookies).
 * 2. Applies the "who can open what" rules from lib/auth/access.ts, so
 *    people are sent to the right place before a page starts to load.
 * Protected layouts repeat the same check on the server.
 */
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });
  if (!hasSupabaseEnv()) return response;

  const { url, anonKey } = getSupabaseEnv();
  const supabase = createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
        Object.entries(headers).forEach(([key, value]) =>
          response.headers.set(key, value),
        );
      },
    },
  });

  // Checks the session token is genuine and renews it if needed.
  // Do not put code between creating the client and this call.
  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub ?? null;

  const { pathname, search } = request.nextUrl;
  if (!isAccessControlled(pathname)) return response;

  let viewer: AccessViewer = null;
  if (userId) {
    // The user's own profile row, read with their own permissions.
    const { data: profile } = await supabase
      .from("profiles")
      .select("role, is_admin")
      .eq("id", userId)
      .maybeSingle();
    viewer = { role: profile?.role ?? null, isAdmin: profile?.is_admin ?? false };
  }

  const decision = resolveAccess(pathname, viewer, search);
  if (decision.type === "allow") return response;

  const result =
    decision.type === "redirect"
      ? NextResponse.redirect(new URL(decision.to, request.url))
      : // A path that does not exist, so the normal "not found" page is
        // shown with a real 404 status.
        NextResponse.rewrite(new URL("/404", request.url), { status: 404 });

  // Carry over any renewed session cookies.
  response.cookies.getAll().forEach((cookie) => result.cookies.set(cookie));
  return result;
}

export const config = {
  matcher: [
    // Everything except Next.js internals and static files.
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
