import { useId, type ReactNode, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/cn";
import { Field, controlStyles } from "./field";

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: ReactNode;
  /** Error message shown under the text area. */
  error?: ReactNode;
};

export function Textarea({
  label,
  error,
  id,
  rows = 4,
  className,
  ...props
}: TextareaProps) {
  const generatedId = useId();
  const textareaId = id ?? generatedId;
  const errorId = `${textareaId}-error`;
  return (
    <Field label={label} htmlFor={textareaId} error={error} errorId={errorId}>
      <textarea
        id={textareaId}
        rows={rows}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={cn(controlStyles, "min-h-11 py-2.5", className)}
        {...props}
      />
    </Field>
  );
}
