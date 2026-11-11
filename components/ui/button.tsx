import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";
import { SpinnerIcon } from "./icons";

export type ButtonVariant = "primary" | "secondary" | "ghost";
export type ButtonSize = "md" | "sm";

const base =
  "relative inline-flex items-center justify-center gap-2 rounded-control font-medium whitespace-nowrap select-none disabled:cursor-not-allowed disabled:opacity-50";

const variants: Record<ButtonVariant, string> = {
  primary: "bg-accent text-accent-contrast not-disabled:hover:opacity-90",
  secondary:
    "border border-border-strong bg-surface text-foreground not-disabled:hover:bg-background",
  ghost: "text-foreground not-disabled:hover:bg-border",
};

// Small buttons look 32px tall, but an invisible area above and below
// (the after: element) keeps the clickable target at 44px.
const sizes: Record<ButtonSize, string> = {
  md: "h-11 px-4 text-sm",
  sm: "h-8 px-3 text-xs after:absolute after:inset-x-0 after:-inset-y-1.5 after:content-['']",
};

/** Class names for a button look. Use on a link that should look like a button. */
export function buttonStyles({
  variant = "primary",
  size = "md",
  className,
}: { variant?: ButtonVariant; size?: ButtonSize; className?: string } = {}) {
  return cn(base, variants[variant], sizes[size], className);
}

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Shows a spinner and stops clicks while something is in progress. */
  loading?: boolean;
};

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  disabled,
  type = "button",
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={buttonStyles({ variant, size, className })}
      {...props}
    >
      {loading && <SpinnerIcon width={16} height={16} />}
      {children}
    </button>
  );
}
