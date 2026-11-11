import type { Metadata } from "next";
import { Card } from "@/components/ui/card";
import { GoogleButton } from "../_components/google-button";
import { SignupForm } from "../_components/signup-form";
import { TextLink } from "../_components/text-link";

export const metadata: Metadata = { title: "Sign up | ReelWright" };

const googleEnabled = process.env.NEXT_PUBLIC_ENABLE_GOOGLE_LOGIN === "true";

export default function SignupPage() {
  return (
    <Card>
      <h1 className="mb-4 font-heading text-2xl font-semibold">Create your account</h1>
      <div className="flex flex-col gap-4">
        {googleEnabled ? <GoogleButton /> : null}
        <SignupForm />
      </div>
      <p className="mt-4 text-sm text-muted">
        Already have an account? <TextLink href="/login">Log in</TextLink>
      </p>
    </Card>
  );
}
