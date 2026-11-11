import type { Metadata } from "next";
import { Suspense } from "react";
import { Card } from "@/components/ui/card";
import { CenteredPage } from "@/components/ui/centered-page";
import { Skeleton } from "@/components/ui/skeleton";
import { requireAccess } from "@/lib/auth/session";
import { OnboardingForm } from "./onboarding-form";

export const metadata: Metadata = { title: "Welcome | ReelWright" };

function getTimeZones(): string[] {
  const zones = Intl.supportedValuesOf("timeZone");
  return zones.includes("UTC") ? zones : ["UTC", ...zones];
}

async function Onboarding() {
  // Only for logged-in users who have not picked a role yet.
  const viewer = await requireAccess("/onboarding");
  return (
    <OnboardingForm
      defaultDisplayName={viewer.displayName ?? ""}
      timeZones={getTimeZones()}
    />
  );
}

export default function OnboardingPage() {
  return (
    <CenteredPage wide>
      <Card>
        <h1 className="font-heading text-2xl font-semibold">Welcome to ReelWright</h1>
        <p className="mt-1 mb-6 text-muted">
          Tell us a little about you so we can set up the right dashboard.
        </p>
        <Suspense fallback={<Skeleton className="h-80 w-full" />}>
          <Onboarding />
        </Suspense>
      </Card>
    </CenteredPage>
  );
}
