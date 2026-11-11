import { Button } from "@/components/ui/button";
import { continueWithGoogle } from "@/lib/auth/actions";

/** Only rendered when NEXT_PUBLIC_ENABLE_GOOGLE_LOGIN is "true". */
export function GoogleButton({ next }: { next?: string }) {
  return (
    <form action={continueWithGoogle} className="flex flex-col gap-4">
      {next ? <input type="hidden" name="next" value={next} /> : null}
      <Button type="submit" variant="secondary" className="w-full">
        Continue with Google
      </Button>
      <div className="flex items-center gap-3 text-xs text-muted" aria-hidden="true">
        <span className="h-px flex-1 bg-border" />
        or
        <span className="h-px flex-1 bg-border" />
      </div>
    </form>
  );
}
