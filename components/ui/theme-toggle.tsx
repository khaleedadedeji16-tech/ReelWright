"use client";

import { useTheme } from "next-themes";
import { cn } from "@/lib/cn";
import { MoonIcon, SunIcon } from "./icons";

/**
 * Switches between light and dark mode. The choice is remembered.
 * Both icons are rendered and CSS picks one, so the server and the
 * browser always produce the same HTML.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <button
      type="button"
      aria-label="Switch between light and dark mode"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      className={cn(
        "inline-flex size-11 items-center justify-center rounded-control border border-border-strong bg-surface text-foreground hover:bg-background",
        className,
      )}
    >
      <MoonIcon className="dark:hidden" />
      <SunIcon className="hidden dark:block" />
    </button>
  );
}
