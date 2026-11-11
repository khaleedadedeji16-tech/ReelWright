import { DashboardPlaceholder } from "@/components/dashboard/dashboard-placeholder";
import { ROLE_LABELS } from "@/lib/auth/roles";
import { requireAccess } from "@/lib/auth/session";

export default async function Page() {
  const viewer = await requireAccess("/fanvue");
  return (
    <DashboardPlaceholder
      roleLabel={ROLE_LABELS.fanvue}
      homeHref="/fanvue"
      displayName={viewer.displayName ?? viewer.email ?? "there"}
    />
  );
}
