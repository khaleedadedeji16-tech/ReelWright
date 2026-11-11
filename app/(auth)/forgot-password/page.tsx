import type { Metadata } from "next";
import { Card } from "@/components/ui/card";
import { ForgotPasswordForm } from "../_components/forgot-password-form";
import { TextLink } from "../_components/text-link";

export const metadata: Metadata = { title: "Forgot password | ReelWright" };

export default function ForgotPasswordPage() {
  return (
    <Card>
      <h1 className="mb-2 font-heading text-2xl font-semibold">Forgot your password?</h1>
      <p className="mb-4 text-muted">
        Enter your email and we will send you a link to choose a new one.
      </p>
      <ForgotPasswordForm />
      <p className="mt-4 text-sm">
        <TextLink href="/login">Back to log in</TextLink>
      </p>
    </Card>
  );
}
