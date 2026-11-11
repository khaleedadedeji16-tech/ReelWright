import Link from "next/link";
import { buttonStyles } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";

export default function HomePage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
      <Logo size={56} />
      <h1 className="font-heading text-4xl font-semibold">ReelWright</h1>
      <p className="text-lg text-muted">Setup complete</p>
      <div className="mt-2 flex flex-wrap justify-center gap-3">
        <Link href="/login" className={buttonStyles({ variant: "secondary" })}>
          Log in
        </Link>
        <Link href="/signup" className={buttonStyles()}>
          Sign up
        </Link>
      </div>
    </main>
  );
}
