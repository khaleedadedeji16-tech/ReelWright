import { useId, type InputHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { FieldError } from "./field";

export type CheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  label: ReactNode;
  /** Error message shown under the checkbox. */
  error?: ReactNode;
};

export function Checkbox({ label, error, id, className, ...props }: CheckboxProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const errorId = `${inputId}-error`;
  return (
    <div className="flex flex-col gap-1">
      <label
        htmlFor={inputId}
        className="flex min-h-11 cursor-pointer items-center gap-3 text-sm text-foreground"
      >
        <input
          id={inputId}
          type="checkbox"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className={cn("size-5 shrink-0 accent-accent", className)}
          {...props}
        />
        <span>{label}</span>
      </label>
      {error ? <FieldError id={errorId}>{error}</FieldError> : null}
    </div>
  );
}
