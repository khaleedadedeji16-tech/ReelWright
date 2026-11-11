import { DASHBOARD_PATHS, type UserRole } from "./roles";

/**
 * The rules for who can open what. This one function is used twice for
 * every protected page: first by proxy.ts before the request reaches the
 * page, then again on the server inside the page's layout.
 * The rules are written out in the "Auth and access" section of CLAUDE.md.
 */

/** What the rules need to know about the visitor. null = not logged in. */
export type AccessViewer = { role: UserRole | null; isAdmin: boolean } | null;

export type AccessDecision =
  | { type: "allow" }
  | { type: "redirect"; to: string }
  | { type: "not-found" };

export const LOGIN_PATH = "/login";
export const ONBOARDING_PATH = "/onboarding";

/** Pages for people who are not logged in yet. */
const GUEST_ONLY_PATHS = ["/login", "/signup", "/forgot-password", "/check-email"];

/** Pages any logged-in user with a role may open. */
const SIGNED_IN_PATHS = ["/security-check"];

function isUnder(pathname: string, base: string): boolean {
  return pathname === base || pathname.startsWith(`${base}/`);
}

/** Where a logged-in user belongs: their dashboard, or onboarding. */
export function homePathFor(viewer: NonNullable<AccessViewer>): string {
  return viewer.role ? DASHBOARD_PATHS[viewer.role] : ONBOARDING_PATH;
}

function loginRedirect(pathname: string, search: string): AccessDecision {
  const next = encodeURIComponent(pathname + search);
  return { type: "redirect", to: `${LOGIN_PATH}?next=${next}` };
}

/** True when the rules below have something to say about this path. */
export function isAccessControlled(pathname: string): boolean {
  return resolveArea(pathname) !== "public";
}

type Area =
  | "public"
  | "guest-only"
  | "reset-password"
  | "onboarding"
  | "signed-in"
  | "admin"
  | UserRole;

function resolveArea(pathname: string): Area {
  if (GUEST_ONLY_PATHS.some((path) => isUnder(pathname, path))) return "guest-only";
  if (isUnder(pathname, "/reset-password")) return "reset-password";
  if (isUnder(pathname, ONBOARDING_PATH)) return "onboarding";
  if (SIGNED_IN_PATHS.some((path) => isUnder(pathname, path))) return "signed-in";
  if (isUnder(pathname, "/admin")) return "admin";
  for (const role of Object.keys(DASHBOARD_PATHS) as UserRole[]) {
    if (isUnder(pathname, DASHBOARD_PATHS[role])) return role;
  }
  return "public";
}

export function resolveAccess(
  pathname: string,
  viewer: AccessViewer,
  search = "",
): AccessDecision {
  const area = resolveArea(pathname);
  const allow: AccessDecision = { type: "allow" };

  if (area === "public") return allow;

  // Login, sign up, forgot password, check your email.
  if (area === "guest-only") {
    return viewer ? { type: "redirect", to: homePathFor(viewer) } : allow;
  }

  // Everything below needs a logged-in user.
  if (!viewer) return loginRedirect(pathname, search);

  // Choosing a new password: reached from the emailed link, which logs the
  // user in, so it must stay open to logged-in users with or without a role.
  if (area === "reset-password") return allow;

  // Logged in with no role: always go to onboarding.
  if (!viewer.role) {
    return area === "onboarding"
      ? allow
      : { type: "redirect", to: ONBOARDING_PATH };
  }

  // From here on the user has a role.
  if (area === "onboarding") {
    return { type: "redirect", to: homePathFor(viewer) };
  }

  if (area === "signed-in") return allow;

  // The admin area: everyone else gets "not found", so it is not revealed.
  if (area === "admin") {
    return viewer.isAdmin ? allow : { type: "not-found" };
  }

  // A role dashboard: the owner of that role, or an admin.
  if (viewer.isAdmin || viewer.role === area) return allow;
  return { type: "redirect", to: homePathFor(viewer) };
}
