import { DashboardPlaceholder } from "@/components/dashboard/dashboard-placeholder";
import { requireAccess } from "@/lib/auth/session";

export default async function Page() {
  const viewer = await requireAccess("/admin");
  return (
    <DashboardPlaceholder
      roleLabel="Admin"
      homeHref="/admin"
      displayName={viewer.displayName ?? viewer.email ?? "there"}
    />
  );
}
