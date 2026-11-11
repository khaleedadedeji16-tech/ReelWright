"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updatePassword, type AuthFormState } from "@/lib/auth/actions";
import { FormMessage } from "./form-message";

const initialState: AuthFormState = {};

export function ResetPasswordForm() {
  const [state, formAction, pending] = useActionState(updatePassword, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4" noValidate>
      {state.error ? <FormMessage>{state.error}</FormMessage> : null}
      <Input
        label="New password (at least 8 characters)"
        name="password"
        type="password"
        autoComplete="new-password"
        minLength={8}
        error={state.fieldErrors?.password}
        required
      />
      <Input
        label="Repeat new password"
        name="confirmPassword"
        type="password"
        autoComplete="new-password"
        error={state.fieldErrors?.confirmPassword}
        required
      />
      <Button type="submit" loading={pending} className="w-full">
        Save new password
      </Button>
    </form>
  );
}
