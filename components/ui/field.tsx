import type { LabelHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

/** Shared look for Input, Textarea and Select. */
export const controlStyles =
  "w-full rounded-control border border-input-border bg-surface px-3 text-sm text-foreground placeholder:text-muted disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-danger-text";

export function Label({
  className,
  ...props
}: LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn("text-sm font-medium text-foreground", className)}
      {...props}
    />
  );
}

/** Error message shown under a form control. */
export function FieldError({ id, children }: { id: string; children: ReactNode }) {
  return (
    <p id={id} className="text-xs text-danger-text">
      {children}
    </p>
  );
}

/** Lays out a label, a control and an optional error message. */
export function Field({
  label,
  htmlFor,
  error,
  errorId,
  children,
}: {
  label: ReactNode;
  htmlFor: string;
  error?: ReactNode;
  errorId: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {error ? <FieldError id={errorId}>{error}</FieldError> : null}
    </div>
  );
}
