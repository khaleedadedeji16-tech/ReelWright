import { hasSupabaseEnv } from "@/lib/supabase/env";

export default function HomePage() {
  const supabaseReady = hasSupabaseEnv();

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
      <h1 className="text-4xl font-semibold tracking-tight">ReelWright</h1>
      <p className="text-lg">Setup complete</p>
      <p className="text-sm opacity-70">
        Supabase environment variables:{" "}
        {supabaseReady ? "present" : "missing"}
      </p>
    </main>
  );
}
