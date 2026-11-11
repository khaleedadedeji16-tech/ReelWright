import { cn } from "@/lib/cn";

/** A grey pulsing block shown while content loads. Set its size with className. */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn("animate-pulse rounded-control bg-border", className)}
    />
  );
}
