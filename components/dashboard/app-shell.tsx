"use client";

import Link from "next/link";
import { useEffect, useId, useState, type ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { ChatIcon, CloseIcon, MenuIcon } from "@/components/ui/icons";
import { Logo } from "@/components/ui/logo";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { cn } from "@/lib/cn";

export type AppShellNavLink = {
  href: string;
  label: string;
};

export type AppShellProps = {
  /** Site name shown at the top of the side menu. */
  siteName: string;
  /** Short label for the kind of user, shown as a badge (for example "Author"). */
  roleLabel: string;
  navLinks: AppShellNavLink[];
  /** The href of the link for the page being shown, so it can be highlighted. */
  activeHref?: string;
  /** Small info card at the bottom of the side menu. */
  sidebarFooter?: ReactNode;
  /** Account actions at the bottom of the side menu (for example Log out). */
  sidebarAccount?: ReactNode;
  /** Page heading. */
  title: string;
  subtitle?: string;
  /** Buttons shown at the right of the page heading. */
  actions?: ReactNode;
  /** Text on the floating assistant button. */
  assistantLabel?: string;
  /** Page content. */
  children: ReactNode;
};

const iconButton =
  "inline-flex size-11 items-center justify-center rounded-control text-foreground hover:bg-border";

/**
 * The frame shared by every dashboard and the admin area: side menu,
 * page heading, content area and the floating assistant button.
 * It only displays what it is given and holds no role-specific content.
 */
export function AppShell({
  siteName,
  roleLabel,
  navLinks,
  activeHref,
  sidebarFooter,
  sidebarAccount,
  title,
  subtitle,
  actions,
  assistantLabel = "Ask the assistant",
  children,
}: AppShellProps) {
  // Only matters on phones, where the side menu is hidden behind a button.
  const [menuOpen, setMenuOpen] = useState(false);
  const menuId = useId();

  useEffect(() => {
    if (!menuOpen) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setMenuOpen(false);
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [menuOpen]);

  return (
    <div className="flex min-h-dvh flex-1 bg-background text-foreground">
      {menuOpen && (
        <button
          type="button"
          aria-label="Close menu"
          onClick={() => setMenuOpen(false)}
          className="fixed inset-0 z-30 cursor-default bg-overlay lg:hidden"
        />
      )}

      <aside
        id={menuId}
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 max-w-[85vw] flex-col gap-4 border-r bg-surface p-4 shadow-float lg:sticky lg:top-0 lg:flex lg:h-dvh lg:shadow-none",
          menuOpen ? "flex" : "hidden",
        )}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 flex-col items-start gap-2">
            <span className="flex items-center gap-2">
              <Logo />
              <span className="font-heading text-lg font-semibold">{siteName}</span>
            </span>
            <Badge variant="info">{roleLabel}</Badge>
          </div>
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setMenuOpen(false)}
            className={cn(iconButton, "self-start lg:hidden")}
          >
            <CloseIcon />
          </button>
        </div>

        <nav aria-label="Main" className="-mx-1 flex-1 overflow-y-auto px-1 py-1">
          <ul className="flex flex-col gap-1">
            {navLinks.map((link) => {
              const active = link.href === activeHref;
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    aria-current={active ? "page" : undefined}
                    onClick={() => setMenuOpen(false)}
                    className={cn(
                      "flex min-h-11 items-center rounded-control px-3 font-medium",
                      active
                        ? "bg-accent-soft text-accent-soft-text"
                        : "text-muted hover:bg-background hover:text-foreground",
                    )}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {sidebarFooter ? <div>{sidebarFooter}</div> : null}

        {sidebarAccount ? <div className="border-t pt-4">{sidebarAccount}</div> : null}

        <div className="flex items-center justify-between gap-2 border-t pt-4">
          <span className="text-muted">Theme</span>
          <ThemeToggle />
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center gap-2 border-b bg-surface px-2 py-2 lg:hidden">
          <button
            type="button"
            aria-label="Open menu"
            aria-expanded={menuOpen}
            aria-controls={menuId}
            onClick={() => setMenuOpen(true)}
            className={iconButton}
          >
            <MenuIcon />
          </button>
          <Logo size={24} />
          <span className="font-heading text-base font-semibold">{siteName}</span>
        </div>

        <header className="flex flex-wrap items-start justify-between gap-4 px-4 pt-6 sm:px-8 sm:pt-8">
          <div className="min-w-0">
            <h1 className="font-heading text-2xl font-semibold">{title}</h1>
            {subtitle ? <p className="mt-1 text-muted">{subtitle}</p> : null}
          </div>
          {actions ? (
            <div className="flex flex-wrap items-center gap-2">{actions}</div>
          ) : null}
        </header>

        {/* Extra space at the bottom so the floating button never covers content. */}
        <main className="flex-1 px-4 pt-6 pb-28 sm:px-8">{children}</main>
      </div>

      {/* Does nothing yet; the assistant is built in a later step. */}
      <button
        type="button"
        className="fixed right-4 bottom-4 z-20 inline-flex h-12 items-center gap-2 rounded-pill bg-inverse px-5 font-medium text-inverse-contrast shadow-float hover:opacity-90 sm:right-6 sm:bottom-6"
      >
        <ChatIcon />
        {assistantLabel}
      </button>
    </div>
  );
}
