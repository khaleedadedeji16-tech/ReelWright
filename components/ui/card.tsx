import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export type CardProps = {
  title?: ReactNode;
  /** Shown at the top right, next to the title (for example a button). */
  action?: ReactNode;
  children?: ReactNode;
  className?: string;
};

export function Card({ title, action, children, className }: CardProps) {
  const hasHeader = title !== undefined || action !== undefined;
  return (
    <section
      className={cn("rounded-card border bg-surface p-5 text-foreground", className)}
    >
      {hasHeader && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          {title !== undefined && (
            <h3 className="font-heading text-base font-semibold">{title}</h3>
          )}
          {action !== undefined && (
            <div className="ml-auto flex items-center gap-2">{action}</div>
          )}
        </div>
      )}
      {children}
    </section>
  );
}
