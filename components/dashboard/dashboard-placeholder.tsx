import { EmptyState } from "@/components/ui/empty-state";
import { AppShell } from "./app-shell";
import { LogoutButton } from "./logout-button";

export type DashboardPlaceholderProps = {
  /** Shown as the badge in the side menu, for example "Author". */
  roleLabel: string;
  /** This dashboard's own address, for the Home link. */
  homeHref: string;
  displayName: string;
};

/**
 * Temporary stand-in for a dashboard. Step 5 replaces it with the real
 * dashboards. It only shows what it is given.
 */
export function DashboardPlaceholder({
  roleLabel,
  homeHref,
  displayName,
}: DashboardPlaceholderProps) {
  return (
    <AppShell
      siteName="ReelWright"
      roleLabel={roleLabel}
      navLinks={[{ href: homeHref, label: "Home" }]}
      activeHref={homeHref}
      title={`Welcome, ${displayName}`}
      subtitle={`${roleLabel} dashboard`}
      sidebarAccount={<LogoutButton />}
    >
      <EmptyState
        title="Your dashboard is on its way"
        description="This dashboard arrives in the next step."
      />
    </AppShell>
  );
}
