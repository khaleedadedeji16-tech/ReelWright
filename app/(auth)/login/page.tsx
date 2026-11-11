import type { Metadata } from "next";
import { Suspense } from "react";
import { Card } from "@/components/ui/card";
import { safeInternalPath } from "@/lib/auth/safe-path";
import { FormMessage } from "../_components/form-message";
import { GoogleButton } from "../_components/google-button";
import { LoginForm } from "../_components/login-form";
import { TextLink } from "../_components/text-link";

export const metadata: Metadata = { title: "Log in | ReelWright" };

const googleEnabled = process.env.NEXT_PUBLIC_ENABLE_GOOGLE_LOGIN === "true";

// Fixed messages chosen by a short code in the address. Text from the
// address itself is never shown.
const NOTICES: Record<string, string> = {
  link: "That link could not be used here. It may have expired, or been opened in a different browser. If you were confirming your email, try logging in. Otherwise request a new link.",
  google: "Google sign-in is not available right now. Please use your email and password.",
};

async function LoginContent({ searchParams }: { searchParams: PageProps<"/login">["searchParams"] }) {
  const params = await searchParams;
  const next = safeInternalPath(params.next) ?? undefined;
  const notice = typeof params.error === "string" ? NOTICES[params.error] : undefined;

  return (
    <div className="flex flex-col gap-4">
      {notice ? <FormMessage tone="info">{notice}</FormMessage> : null}
      {googleEnabled ? <GoogleButton next={next} /> : null}
      <LoginForm next={next} />
    </div>
  );
}

export default function LoginPage({ searchParams }: PageProps<"/login">) {
  return (
    <Card>
      <h1 className="mb-4 font-heading text-2xl font-semibold">Log in</h1>
      <Suspense>
        <LoginContent searchParams={searchParams} />
      </Suspense>
      <div className="mt-4 flex flex-col items-start text-sm">
        <TextLink href="/forgot-password">Forgot your password?</TextLink>
        <p className="text-muted">
          New here? <TextLink href="/signup">Create an account</TextLink>
        </p>
      </div>
    </Card>
  );
}
