import type { Metadata } from "next";
import { Suspense } from "react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { CenteredPage } from "@/components/ui/centered-page";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHeaderCell,
  TableRow,
} from "@/components/ui/table";
import { ROLE_LABELS } from "@/lib/auth/roles";
import { requireAccess } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

// TEMPORARY PAGE. It exists only so the owner can confirm that row level
// security works for a real logged-in user. Step 5 removes it.

export const metadata: Metadata = {
  title: "Security check (temporary) | ReelWright",
  robots: { index: false },
};

async function Results() {
  const viewer = await requireAccess("/security-check");

  // The normal user client, never the admin client: these numbers show
  // what this user's own browser session is allowed to read.
  const supabase = await createClient();
  const [profiles, wallets] = await Promise.all([
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase.from("credit_wallets").select("id", { count: "exact", head: true }),
  ]);

  const rows: Array<[string, string]> = [
    ["My email", viewer.email ?? "(none)"],
    ["My role", viewer.role ? ROLE_LABELS[viewer.role] : "(none)"],
    ["Am I an admin?", viewer.isAdmin ? "Yes" : "No"],
    [
      "Profiles rows I can read",
      profiles.error ? "Could not read" : String(profiles.count ?? 0),
    ],
    [
      "Credit wallet rows I can read",
      wallets.error ? "Could not read" : String(wallets.count ?? 0),
    ],
  ];

  return (
    <>
      <Table label="Security check results">
        <TableBody>
          {rows.map(([label, value]) => (
            <TableRow key={label}>
              <TableHeaderCell scope="row" className="border-b-0">
                {label}
              </TableHeaderCell>
              <TableCell className="font-medium">{value}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <p className="mt-4 text-muted">
        {viewer.isAdmin
          ? "You are an admin, so both counts should equal the total number of users."
          : "You are not an admin, so both counts should be exactly 1: your own row."}
      </p>
    </>
  );
}

export default function SecurityCheckPage() {
  return (
    <CenteredPage wide>
      <Card
        title="Security check"
        action={<Badge variant="warning">Temporary page</Badge>}
      >
        <p className="mb-4 text-muted">
          This page shows what your own login can read from the database. It
          will be removed in the next step.
        </p>
        <Suspense fallback={<Skeleton className="h-56 w-full" />}>
          <Results />
        </Suspense>
      </Card>
    </CenteredPage>
  );
}
