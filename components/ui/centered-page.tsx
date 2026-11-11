import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Logo } from "./logo";

/**
 * A simple page with the logo and site name on top and the content in a
 * centred column. Used by the login pages and onboarding.
 */
export function CenteredPage({
  children,
  wide = false,
}: {
  children: ReactNode;
  /** Use the wider column (onboarding). */
  wide?: boolean;
}) {
  return (
    <div className="flex flex-1 flex-col items-center px-4 py-10 sm:py-16">
      <Link
        href="/"
        className="mb-8 inline-flex min-h-11 items-center gap-2 rounded-control"
      >
        <Logo size={32} />
        <span className="font-heading text-xl font-semibold">ReelWright</span>
      </Link>
      <main className={cn("w-full", wide ? "max-w-2xl" : "max-w-sm")}>{children}</main>
    </div>
  );
}
