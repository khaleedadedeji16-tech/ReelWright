import { useId, type InputHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Field, controlStyles } from "./field";

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: ReactNode;
  /** Error message shown under the input. */
  error?: ReactNode;
};

export function Input({ label, error, id, className, ...props }: InputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const errorId = `${inputId}-error`;
  return (
    <Field label={label} htmlFor={inputId} error={error} errorId={errorId}>
      <input
        id={inputId}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={cn(controlStyles, "h-11", className)}
        {...props}
      />
    </Field>
  );
}
