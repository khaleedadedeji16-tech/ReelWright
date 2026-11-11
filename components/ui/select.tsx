import { useId, type ReactNode, type SelectHTMLAttributes } from "react";
import { cn } from "@/lib/cn";
import { Field, controlStyles } from "./field";
import { ChevronDownIcon } from "./icons";

export type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label: ReactNode;
  /** Error message shown under the select. */
  error?: ReactNode;
  /** The <option> elements. */
  children: ReactNode;
};

export function Select({
  label,
  error,
  id,
  className,
  children,
  ...props
}: SelectProps) {
  const generatedId = useId();
  const selectId = id ?? generatedId;
  const errorId = `${selectId}-error`;
  return (
    <Field label={label} htmlFor={selectId} error={error} errorId={errorId}>
      <div className="relative">
        <select
          id={selectId}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className={cn(controlStyles, "h-11 appearance-none pr-10", className)}
          {...props}
        >
          {children}
        </select>
        <ChevronDownIcon
          width={16}
          height={16}
          className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-muted"
        />
      </div>
    </Field>
  );
}
