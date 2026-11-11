"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { logIn, type AuthFormState } from "@/lib/auth/actions";
import { FormMessage } from "./form-message";

const initialState: AuthFormState = {};

export function LoginForm({ next }: { next?: string }) {
  const [state, formAction, pending] = useActionState(logIn, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4" noValidate>
      {state.error ? <FormMessage>{state.error}</FormMessage> : null}
      {next ? <input type="hidden" name="next" value={next} /> : null}
      <Input
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        defaultValue={state.email}
        error={state.fieldErrors?.email}
        required
      />
      <Input
        label="Password"
        name="password"
        type="password"
        autoComplete="current-password"
        error={state.fieldErrors?.password}
        required
      />
      <Button type="submit" loading={pending} className="w-full">
        Log in
      </Button>
    </form>
  );
}
