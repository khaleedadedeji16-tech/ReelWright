import { cn } from "@/lib/cn";

export type AvatarSize = "sm" | "md" | "lg";

const sizes: Record<AvatarSize, string> = {
  sm: "size-8 text-xs",
  md: "size-10 text-sm",
  lg: "size-14 text-base",
};

export type AvatarProps = {
  /** The person's name. Used for the initials and as the image description. */
  name: string;
  /** Picture address. When missing, the initials are shown instead. */
  src?: string;
  size?: AvatarSize;
  className?: string;
};

function getInitials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "?";
  const first = words[0][0];
  const last = words.length > 1 ? words[words.length - 1][0] : "";
  return (first + last).toUpperCase();
}

export function Avatar({ name, src, size = "md", className }: AvatarProps) {
  const shape = cn(
    "inline-flex shrink-0 items-center justify-center overflow-hidden rounded-pill bg-accent-soft font-medium text-accent-soft-text select-none",
    sizes[size],
    className,
  );

  if (src) {
    return (
      // A plain <img> is used because avatar pictures can come from any
      // address, which next/image would need to be configured for.
      // eslint-disable-next-line @next/next/no-img-element
      <img src={src} alt={name} className={cn(shape, "object-cover")} />
    );
  }

  return (
    <span role="img" aria-label={name} className={shape}>
      {getInitials(name)}
    </span>
  );
}
