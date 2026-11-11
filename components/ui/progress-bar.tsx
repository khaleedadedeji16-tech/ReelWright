import { cn } from "@/lib/cn";

export type ProgressBarProps = {
  /** How far along, from 0 to max. */
  value: number;
  max?: number;
  /** Describes what is progressing, for screen readers. */
  label: string;
  className?: string;
};

export function ProgressBar({ value, max = 100, label, className }: ProgressBarProps) {
  const safeMax = max > 0 ? max : 100;
  const clamped = Math.min(Math.max(value, 0), safeMax);
  const percent = (clamped / safeMax) * 100;
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={safeMax}
      aria-valuenow={clamped}
      className={cn("h-2 w-full overflow-hidden rounded-pill bg-border", className)}
    >
      <div
        className="h-full rounded-pill bg-accent"
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}
