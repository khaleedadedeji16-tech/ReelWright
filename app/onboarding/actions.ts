"use server";

import { redirect } from "next/navigation";
import { DASHBOARD_PATHS, isUserRole } from "@/lib/auth/roles";
import { getViewer } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/admin";

export type OnboardingFormState = {
  error?: string;
  fieldErrors?: {
    displayName?: string;
    timeZone?: string;
    role?: string;
    ageConfirmed?: string;
  };
};

function isValidTimeZone(value: string): boolean {
  try {
    new Intl.DateTimeFormat("en", { timeZone: value });
    return true;
  } catch {
    return false;
  }
}

/**
 * Saves the user's name, time zone and role. The role can only be set
 * here, once: the database does not let users change it themselves, so
 * this runs with the admin client after checking who is logged in, and
 * only updates the row while its role is still empty.
 */
export async function completeOnboarding(
  _previous: OnboardingFormState,
  formData: FormData,
): Promise<OnboardingFormState> {
  // 1. Who is logged in? (Checked with Supabase, not taken from the form.)
  const viewer = await getViewer();
  if (!viewer) redirect("/login");
  if (viewer.role) redirect(DASHBOARD_PATHS[viewer.role]);

  // 2. Check what was sent.
  const rawName = formData.get("displayName");
  const rawTimeZone = formData.get("timeZone");
  const role = formData.get("role");
  const ageConfirmed = formData.get("ageConfirmed") === "on";

  const displayName = typeof rawName === "string" ? rawName.trim() : "";
  const timeZone = typeof rawTimeZone === "string" ? rawTimeZone : "";

  const fieldErrors: NonNullable<OnboardingFormState["fieldErrors"]> = {};
  if (displayName.length === 0) {
    fieldErrors.displayName = "Enter the name you want shown.";
  } else if (displayName.length > 100) {
    fieldErrors.displayName = "Use 100 characters or fewer.";
  }
  if (!timeZone || timeZone.length > 64 || !isValidTimeZone(timeZone)) {
    fieldErrors.timeZone = "Choose a time zone from the list.";
  }
  if (!isUserRole(role)) {
    fieldErrors.role = "Choose one of the three options.";
  } else if (role === "fanvue" && !ageConfirmed) {
    fieldErrors.ageConfirmed = "You must confirm you are 18 or older to continue.";
  }
  if (Object.keys(fieldErrors).length > 0 || !isUserRole(role)) {
    return { fieldErrors };
  }

  // 3. Save with the admin client. "role is null" in the filter means a
  //    role that is already set can never be overwritten.
  let saved = false;
  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("profiles")
      .update({
        display_name: displayName,
        time_zone: timeZone,
        role,
        ...(role === "fanvue"
          ? { age_confirmed: true, age_confirmed_at: new Date().toISOString() }
          : {}),
      })
      .eq("id", viewer.id)
      .is("role", null)
      .select("id");
    if (error) throw error;
    saved = data.length > 0;
  } catch (cause) {
    console.error("Onboarding could not be saved", cause);
    return { error: "We could not save your choice. Please try again." };
  }

  if (!saved) {
    // Nothing was updated: either the role was set a moment ago (for
    // example in another tab), or the profile row is missing.
    const again = await createAdminClient()
      .from("profiles")
      .select("role")
      .eq("id", viewer.id)
      .maybeSingle();
    if (again.data?.role) redirect(DASHBOARD_PATHS[again.data.role]);
    return {
      error: "Your account is not fully set up. Please contact support.",
    };
  }

  redirect(DASHBOARD_PATHS[role]);
}
