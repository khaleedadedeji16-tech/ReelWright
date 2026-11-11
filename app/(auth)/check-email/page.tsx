import type { Metadata } from "next";
import { Suspense } from "react";
import { Card } from "@/components/ui/card";
import { TextLink } from "../_components/text-link";

export const metadata: Metadata = { title: "Check your email | ReelWright" };

// The wording never says whether the email has an account.
const MESSAGES = {
  signup:
    "If that email can be used for a new account, we have sent it a confirmation link. Open the link to finish signing up.",
  reset:
    "If that email has an account, we have sent it a link to choose a new password.",
} as const;

async function Message({
  searchParams,
}: {
  searchParams: PageProps<"/check-email">["searchParams"];
}) {
  const { type } = await searchParams;
  return <p>{type === "reset" ? MESSAGES.reset : MESSAGES.signup}</p>;
}

export default function CheckEmailPage({ searchParams }: PageProps<"/check-email">) {
  return (
    <Card>
      <h1 className="mb-4 font-heading text-2xl font-semibold">Check your email</h1>
      <Suspense>
        <Message searchParams={searchParams} />
      </Suspense>
      <p className="mt-2 text-muted">
        It can take a minute to arrive. Look in your spam folder too. Open the
        link in this same browser.
      </p>
      <p className="mt-4 text-sm">
        <TextLink href="/login">Back to log in</TextLink>
      </p>
    </Card>
  );
}
