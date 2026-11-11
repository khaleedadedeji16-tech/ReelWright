"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { requestPasswordReset, type AuthFormState } from "@/lib/auth/actions";
import { FormMessage } from "./form-message";

const initialState: AuthFormState = {};

export function ForgotPasswordForm() {
  const [state, formAction, pending] = useActionState(
    requestPasswordReset,
    initialState,
  );

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
      <Button type="submit" loading={pending} className="w-full">
        Send reset link
      </Button>
    </form>
  );
}
