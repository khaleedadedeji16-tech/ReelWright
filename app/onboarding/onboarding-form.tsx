"use client";

import {
  startTransition,
  useActionState,
  useState,
  useSyncExternalStore,
  type FormEvent,
} from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ChoiceCard } from "@/components/ui/choice-card";
import { FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import type { UserRole } from "@/lib/auth/roles";
import { completeOnboarding, type OnboardingFormState } from "./actions";

const initialState: OnboardingFormState = {};

const ROLE_CHOICES: Array<{ value: UserRole; title: string; description: string }> = [
  {
    value: "author",
    title: "Author",
    description: "Turn your books into trailers and posts that find readers.",
  },
  {
    value: "creator",
    title: "Content creator",
    description: "Make short videos and images, then schedule them to post.",
  },
  {
    value: "fanvue",
    title: "Fanvue creator",
    description: "Create content for your Fanvue page and its promotion.",
  },
];

// The browser's time zone. On the server (and for the very first paint)
// this is "UTC"; the real value appears as soon as the page is live.
const subscribeToNothing = () => () => {};
const readBrowserTimeZone = () => Intl.DateTimeFormat().resolvedOptions().timeZone;
const readServerTimeZone = () => "UTC";

export function OnboardingForm({
  defaultDisplayName,
  timeZones,
}: {
  defaultDisplayName: string;
  /** The list of time zone names to offer. */
  timeZones: string[];
}) {
  const [state, formAction, pending] = useActionState(completeOnboarding, initialState);
  const [role, setRole] = useState<UserRole | null>(null);
  const [displayName, setDisplayName] = useState(defaultDisplayName);
  const [ageConfirmed, setAgeConfirmed] = useState(false);

  const browserTimeZone = useSyncExternalStore(
    subscribeToNothing,
    readBrowserTimeZone,
    readServerTimeZone,
  );
  const [chosenTimeZone, setChosenTimeZone] = useState<string | null>(null);
  const timeZone = chosenTimeZone ?? browserTimeZone;
  const options = timeZones.includes(timeZone) ? timeZones : [timeZone, ...timeZones];

  // Send the form ourselves so the browser does not clear the choices
  // when the server sends back an error.
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(() => formAction(formData));
  }

  return (
    <form
      action={formAction}
      onSubmit={handleSubmit}
      className="flex flex-col gap-6"
      noValidate
    >
      {state.error ? (
        <p role="alert" className="rounded-control bg-danger-soft px-3 py-2.5 text-danger-text">
          {state.error}
        </p>
      ) : null}

      <Input
        label="Display name"
        name="displayName"
        autoComplete="name"
        maxLength={100}
        value={displayName}
        onChange={(event) => setDisplayName(event.target.value)}
        error={state.fieldErrors?.displayName}
        required
      />

      <Select
        label="Time zone"
        name="timeZone"
        value={timeZone}
        onChange={(event) => setChosenTimeZone(event.target.value)}
        error={state.fieldErrors?.timeZone}
      >
        {options.map((zone) => (
          <option key={zone} value={zone}>
            {zone.replaceAll("_", " ")}
          </option>
        ))}
      </Select>

      <fieldset className="flex flex-col gap-3">
        <legend className="mb-3 text-sm font-medium">What will you use ReelWright for?</legend>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {ROLE_CHOICES.map((choice) => (
            <ChoiceCard
              key={choice.value}
              name="role"
              value={choice.value}
              title={choice.title}
              description={choice.description}
              checked={role === choice.value}
              onChange={() => setRole(choice.value)}
            />
          ))}
        </div>
        {state.fieldErrors?.role ? (
          <FieldError id="role-error">{state.fieldErrors.role}</FieldError>
        ) : null}
      </fieldset>

      {role === "fanvue" ? (
        <Checkbox
          name="ageConfirmed"
          label="I confirm I am 18 or older."
          checked={ageConfirmed}
          onChange={(event) => setAgeConfirmed(event.target.checked)}
          error={state.fieldErrors?.ageConfirmed}
          required
        />
      ) : null}

      <p className="rounded-control bg-warning-soft px-3 py-2.5 text-warning-text">
        Choose carefully: this cannot be changed later without contacting support.
      </p>

      <Button type="submit" loading={pending} className="self-start">
        Continue
      </Button>
    </form>
  );
}
