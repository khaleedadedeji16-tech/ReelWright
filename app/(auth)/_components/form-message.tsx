import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/** A message box at the top of a form. */
export function FormMessage({
  tone = "danger",
  children,
}: {
  tone?: "danger" | "info" | "success";
  children: ReactNode;
}) {
  return (
    <p
      role={tone === "danger" ? "alert" : "status"}
      className={cn(
        "rounded-control px-3 py-2.5 text-sm",
        tone === "danger" && "bg-danger-soft text-danger-text",
        tone === "info" && "bg-accent-soft text-accent-soft-text",
        tone === "success" && "bg-success-soft text-success-text",
      )}
    >
      {children}
    </p>
  );
}
