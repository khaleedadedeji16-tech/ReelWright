import Link from "next/link";
import type { ReactNode } from "react";

/** An underlined link inside a sentence, with a 44px tall click area. */
export function TextLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex min-h-11 items-center rounded-control font-medium text-accent-soft-text underline underline-offset-2"
    >
      {children}
    </Link>
  );
}
