import Image from "next/image";
import mark from "@/app/icon.svg";

/**
 * The site mark. The picture is app/icon.svg, which is also the browser
 * tab icon. That one file is the only place allowed to contain colour
 * values. Decorative here: always show the site name next to it.
 */
export function Logo({ size = 28, className }: { size?: number; className?: string }) {
  return (
    <Image
      src={mark}
      alt=""
      width={size}
      height={size}
      unoptimized
      className={className}
    />
  );
}
