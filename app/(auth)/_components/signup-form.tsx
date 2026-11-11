"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { signUp, type AuthFormState } from "@/lib/auth/actions";
import { FormMessage } from "./form-message";

const initialState: AuthFormState = {};

export function SignupForm() {
  const [state, formAction, pending] = useActionState(signUp, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4" noValidate>
      {state.error ? <FormMessage>{state.error}</FormMessage> : null}
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
        label="Password (at least 8 characters)"
        name="password"
        type="password"
        autoComplete="new-password"
        minLength={8}
        error={state.fieldErrors?.password}
        required
      />
      <Button type="submit" loading={pending} className="w-full">
        Create account
      </Button>
    </form>
  );
}
