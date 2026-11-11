import type { Metadata } from "next";
import { Card } from "@/components/ui/card";
import { ResetPasswordForm } from "../_components/reset-password-form";

export const metadata: Metadata = { title: "Choose a new password | ReelWright" };

// Reached from the link in the reset email, which logs the user in first.
// proxy.ts sends anyone who is not logged in to the login page.
export default function ResetPasswordPage() {
  return (
    <Card>
      <h1 className="mb-4 font-heading text-2xl font-semibold">Choose a new password</h1>
      <ResetPasswordForm />
    </Card>
  );
}
