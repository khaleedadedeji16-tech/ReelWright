import { Button } from "@/components/ui/button";
import { logOut } from "@/lib/auth/actions";

/** Logs the user out. Goes in the AppShell side menu. */
export function LogoutButton() {
  return (
    <form action={logOut}>
      <Button type="submit" variant="ghost" className="w-full justify-start px-3">
        Log out
      </Button>
    </form>
  );
}
