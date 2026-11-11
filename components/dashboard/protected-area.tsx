import { Suspense, type ReactNode } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { requireAccess } from "@/lib/auth/session";

async function Gate({ pathname, children }: { pathname: string; children: ReactNode }) {
  await requireAccess(pathname);
  return children;
}

function AreaLoading() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-8" aria-busy="true">
      <span className="sr-only">Loading</span>
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-4 w-72 max-w-full" />
      <Skeleton className="h-40 w-full" />
    </div>
  );
}

/**
 * Wraps a protected layout. Checks on the server that the visitor may be
 * here (the same rules proxy.ts applies) before showing anything inside.
 *
 * @param pathname the area being protected, for example "/author"
 */
export function ProtectedArea({
  pathname,
  children,
}: {
  pathname: string;
  children: ReactNode;
}) {
  return (
    <Suspense fallback={<AreaLoading />}>
      <Gate pathname={pathname}>{children}</Gate>
    </Suspense>
  );
}
