import type {
  HTMLAttributes,
  ReactNode,
  TdHTMLAttributes,
  ThHTMLAttributes,
} from "react";
import { cn } from "@/lib/cn";

export type TableProps = {
  /** Describes the table for screen readers. */
  label: string;
  children: ReactNode;
  className?: string;
};

/** A table that scrolls sideways when it is wider than the screen. */
export function Table({ label, children, className }: TableProps) {
  return (
    <div
      role="region"
      aria-label={label}
      tabIndex={0}
      className={cn("w-full overflow-x-auto rounded-card border bg-surface", className)}
    >
      <table className="w-full border-collapse text-left text-sm">{children}</table>
    </div>
  );
}

export function TableHead(props: HTMLAttributes<HTMLTableSectionElement>) {
  return <thead {...props} />;
}

export function TableBody(props: HTMLAttributes<HTMLTableSectionElement>) {
  return <tbody {...props} />;
}

export function TableRow({
  className,
  ...props
}: HTMLAttributes<HTMLTableRowElement>) {
  return <tr className={cn("border-b last:border-b-0", className)} {...props} />;
}

export function TableHeaderCell({
  className,
  scope = "col",
  ...props
}: ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      scope={scope}
      className={cn(
        "border-b px-4 py-3 text-xs font-medium whitespace-nowrap text-muted",
        className,
      )}
      {...props}
    />
  );
}

export function TableCell({
  className,
  ...props
}: TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td
      className={cn("px-4 py-3 whitespace-nowrap text-foreground", className)}
      {...props}
    />
  );
}
