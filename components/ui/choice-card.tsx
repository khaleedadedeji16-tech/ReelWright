import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export type ChoiceCardProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type" | "title"
> & {
  title: string;
  /** One line saying what this choice is for. */
  description: string;
};

/**
 * A large card for picking one option from a few. It is a real radio
 * button, so give every card in a group the same `name`.
 */
export function ChoiceCard({ title, description, className, ...props }: ChoiceCardProps) {
  return (
    <label
      className={cn(
        "flex min-h-11 cursor-pointer items-start gap-3 rounded-card border border-input-border bg-surface p-4 text-foreground",
        "has-[:checked]:border-accent has-[:checked]:bg-accent-soft has-[:checked]:ring-1 has-[:checked]:ring-accent",
        "has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-accent",
        "has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-50",
        className,
      )}
    >
      <input type="radio" className="mt-0.5 size-5 shrink-0 accent-accent" {...props} />
      <span className="flex flex-col gap-1">
        <span className="font-heading text-base font-semibold">{title}</span>
        <span className="text-muted">{description}</span>
      </span>
    </label>
  );
}
