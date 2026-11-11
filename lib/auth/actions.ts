"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { homePathFor, ONBOARDING_PATH, resolveAccess } from "./access";
import { safeInternalPath } from "./safe-path";
import { getViewer } from "./session";

/** What a form gets back when it cannot continue. */
export type AuthFormState = {
  /** A message for the whole form. */
  error?: string;
  /** Messages for single fields. */
  fieldErrors?: { email?: string; password?: string; confirmPassword?: string };
  /** The email typed in, so the form can keep it after an error. */
  email?: string;
};

const MIN_PASSWORD_LENGTH = 8;

const TOO_MANY_ATTEMPTS = "Too many attempts. Please wait a few minutes and try again.";
const TRY_AGAIN = "Something went wrong. Please try again.";

function readText(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

function looksLikeEmail(value: string): boolean {
  return value.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isRateLimited(error: { status?: number; code?: string }): boolean {
  return error.status === 429 || (error.code ?? "").startsWith("over_");
}

/** The address of this site as the visitor sees it, for links in emails. */
async function getSiteOrigin(): Promise<string> {
  const headerList = await headers();
  const origin = headerList.get("origin");
  if (origin) return origin;
  const host = headerList.get("x-forwarded-host") ?? headerList.get("host");
  const protocol = headerList.get("x-forwarded-proto") ?? "https";
  return `${protocol}://${host}`;
}

/**
 * Where to send someone who has just logged in: the page they asked for
 * if they are allowed to open it, otherwise their own dashboard (or
 * onboarding when they have no role yet).
 */
async function destinationAfterLogin(requested: string | null): Promise<string> {
  const viewer = await getViewer();
  if (!viewer) return "/login";
  const access = { role: viewer.role, isAdmin: viewer.isAdmin };
  if (requested && resolveAccess(requested, access).type === "allow") {
    return requested;
  }
  return homePathFor(access);
}

function callbackUrl(origin: string, next: string): string {
  return `${origin}/auth/callback?next=${encodeURIComponent(next)}`;
}

export async function logIn(
  _previous: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const email = readText(formData, "email").trim();
  const password = readText(formData, "password");
  // Only paths inside this site are accepted.
  const next = safeInternalPath(readText(formData, "next"));

  if (!looksLikeEmail(email)) {
    return { email, fieldErrors: { email: "Enter a valid email address." } };
  }
  if (!password) {
    return { email, fieldErrors: { password: "Enter your password." } };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    if (isRateLimited(error)) return { email, error: TOO_MANY_ATTEMPTS };
    // One message for every failure, so it never reveals whether the email
    // has an account.
    return {
      email,
      error:
        "Email or password is incorrect. If you have just signed up, confirm your email first.",
    };
  }

  redirect(await destinationAfterLogin(next));
}

export async function signUp(
  _previous: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const email = readText(formData, "email").trim();
  const password = readText(formData, "password");

  if (!looksLikeEmail(email)) {
    return { email, fieldErrors: { email: "Enter a valid email address." } };
  }
  if (password.length < MIN_PASSWORD_LENGTH) {
    return {
      email,
      fieldErrors: {
        password: `Use at least ${MIN_PASSWORD_LENGTH} characters.`,
      },
    };
  }

  const origin = await getSiteOrigin();
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: callbackUrl(origin, ONBOARDING_PATH) },
  });

  if (error) {
    if (isRateLimited(error)) return { email, error: TOO_MANY_ATTEMPTS };
    if (error.code === "weak_password") {
      return {
        email,
        fieldErrors: { password: "Choose a stronger password." },
      };
    }
    // "Already registered" must look the same as success, so the page
    // never reveals whether the email has an account.
    if (error.code !== "user_already_exists" && error.code !== "email_exists") {
      return { email, error: TRY_AGAIN };
    }
  }

  // Only happens if email confirmation is switched off in Supabase.
  if (data.session) redirect(ONBOARDING_PATH);

  redirect("/check-email?type=signup");
}

export async function requestPasswordReset(
  _previous: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const email = readText(formData, "email").trim();
  if (!looksLikeEmail(email)) {
    return { email, fieldErrors: { email: "Enter a valid email address." } };
  }

  const origin = await getSiteOrigin();
  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: callbackUrl(origin, "/reset-password"),
  });
  if (error && isRateLimited(error)) return { email, error: TOO_MANY_ATTEMPTS };

  // Same page whether or not the email has an account.
  redirect("/check-email?type=reset");
}

export async function updatePassword(
  _previous: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const password = readText(formData, "password");
  const confirmPassword = readText(formData, "confirmPassword");

  if (password.length < MIN_PASSWORD_LENGTH) {
    return {
      fieldErrors: { password: `Use at least ${MIN_PASSWORD_LENGTH} characters.` },
    };
  }
  if (password !== confirmPassword) {
    return { fieldErrors: { confirmPassword: "The two passwords do not match." } };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/forgot-password");

  const { error } = await supabase.auth.updateUser({ password });
  if (error) {
    if (isRateLimited(error)) return { error: TOO_MANY_ATTEMPTS };
    if (error.code === "same_password") {
      return {
        fieldErrors: { password: "Choose a password you have not used before." },
      };
    }
    if (error.code === "weak_password") {
      return { fieldErrors: { password: "Choose a stronger password." } };
    }
    return { error: TRY_AGAIN };
  }

  redirect(await destinationAfterLogin(null));
}

export async function logOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function continueWithGoogle(formData: FormData): Promise<void> {
  if (process.env.NEXT_PUBLIC_ENABLE_GOOGLE_LOGIN !== "true") {
    redirect("/login");
  }
  const next = safeInternalPath(readText(formData, "next")) ?? ONBOARDING_PATH;
  const origin = await getSiteOrigin();
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: callbackUrl(origin, next) },
  });
  if (error || !data.url) redirect("/login?error=google");
  // This address is Google's sign-in page, as returned by Supabase.
  redirect(data.url);
}
