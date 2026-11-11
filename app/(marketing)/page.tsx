import Link from "next/link";
import { buttonStyles } from "@/components/ui/button";

export default function HomePage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
      <h1 className="font-heading text-4xl font-semibold">ReelWright</h1>
      <p className="text-lg text-muted">Setup complete</p>
      <Link
        href="/styleguide"
        className={buttonStyles({ variant: "secondary", className: "mt-2" })}
      >
        View the style guide
      </Link>
    </main>
  );
}
