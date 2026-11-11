import { DashboardPlaceholder } from "@/components/dashboard/dashboard-placeholder";
import { ROLE_LABELS } from "@/lib/auth/roles";
import { requireAccess } from "@/lib/auth/session";

export default async function Page() {
  const viewer = await requireAccess("/creator");
  return (
    <DashboardPlaceholder
      roleLabel={ROLE_LABELS.creator}
      homeHref="/creator"
      displayName={viewer.displayName ?? viewer.email ?? "there"}
    />
  );
}
