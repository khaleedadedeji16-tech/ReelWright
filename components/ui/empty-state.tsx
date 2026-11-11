import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export type EmptyStateProps = {
  title: string;
  /** One line of help. */
  description: string;
  /** One action, usually a Button. */
  action?: ReactNode;
  className?: string;
};

export function EmptyState({ title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-2 rounded-card border border-dashed border-border-strong bg-surface px-6 py-10 text-center",
        className,
      )}
    >
      <h3 className="font-heading text-base font-semibold text-foreground">{title}</h3>
      <p className="max-w-sm text-muted">{description}</p>
      {action ? <div className="mt-3">{action}</div> : null}
    </div>
  );
}
