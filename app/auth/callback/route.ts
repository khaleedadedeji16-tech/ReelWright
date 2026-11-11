import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { ONBOARDING_PATH } from "@/lib/auth/access";
import { safeInternalPath } from "@/lib/auth/safe-path";
import { createClient } from "@/lib/supabase/server";

const EMAIL_LINK_TYPES: readonly EmailOtpType[] = [
  "signup",
  "invite",
  "magiclink",
  "recovery",
  "email_change",
  "email",
];

/**
 * Where links in emails (confirm sign-up, reset password) and Google
 * sign-in come back to. It turns the one-time code in the link into a
 * login session, then sends the user on.
 *
 * Handles both kinds of link Supabase can send:
 *   ?code=...                 the default email templates, and Google
 *   ?token_hash=...&type=...  the optional custom email templates
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type");
  // Only paths inside this site are accepted.
  // /onboarding sends users who already have a role on to their dashboard.
  const next = safeInternalPath(searchParams.get("next")) ?? ONBOARDING_PATH;

  const supabase = await createClient();
  let succeeded = false;

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    succeeded = !error;
  } else if (tokenHash && EMAIL_LINK_TYPES.includes(type as EmailOtpType)) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: type as EmailOtpType,
    });
    succeeded = !error;
  }

  if (succeeded) {
    return NextResponse.redirect(new URL(next, request.url));
  }
  return NextResponse.redirect(new URL("/login?error=link", request.url));
}
