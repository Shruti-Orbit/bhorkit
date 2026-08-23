"use client";

import { FormEvent, useMemo, useState } from "react";
import {
  emptyAddressDraft,
  validateAddressDraft,
  type AddressDraft,
  type AddressField,
} from "@/src/lib/address/validation";

type AddressFormProps = {
  /** Heading shown above the fields. */
  title: string;
  /** Prefilled values — a saved address when editing, blank when adding. */
  initialDraft?: AddressDraft;
  submitLabel: string;
  /** Resolve true to close the form; false keeps it open with the user's input. */
  onSubmit: (draft: AddressDraft) => Promise<boolean>;
  onCancel?: () => void;
};

/**
 * The single address form used by both Account → Addresses and Checkout, for
 * both adding and editing. Sharing it keeps one copy of the field list, the
 * validation wiring and the "don't close on failure" behaviour, rather than
 * each surface growing its own subtly different version.
 */
export function AddressForm({
  title,
  initialDraft,
  submitLabel,
  onSubmit,
  onCancel,
}: AddressFormProps) {
  const [draft, setDraft] = useState<AddressDraft>(initialDraft ?? emptyAddressDraft);
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const fieldErrors = useMemo(() => validateAddressDraft(draft), [draft]);
  const isFormValid = Object.keys(fieldErrors).length === 0;

  function updateField(field: AddressField, value: string) {
    setDraft((current) => ({ ...current, [field]: value }));
  }

  // Driven by the field's actual value rather than a blur/touched flag, so it
  // still catches invalid input that arrived via browser autofill — autofill
  // sets a value without necessarily firing blur, so a blur-gated error would
  // silently never appear even though the Save button is correctly disabled.
  function errorFor(field: AddressField): string | undefined {
    const message = fieldErrors[field];
    if (!message) return undefined;
    if (draft[field].trim().length > 0) return message;
    // Field is still empty — only nag about "required" once the user has
    // actually tried to submit, not the instant the form opens.
    return hasAttemptedSubmit ? message : undefined;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    // Guards the case the submit button couldn't (e.g. Enter key with a
    // disabled submit button in some browsers) — same rules, belt and braces.
    if (!isFormValid) {
      setHasAttemptedSubmit(true);
      return;
    }

    setIsSaving(true);
    const saved = await onSubmit(draft);
    setIsSaving(false);
    if (!saved) {
      // Leaves everything the user typed in place; the reason is surfaced by
      // the caller's error toast.
      setHasAttemptedSubmit(true);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <h3 className="text-bhor-product font-bhor-bold text-bhor-text">{title}</h3>
      <div className="grid gap-3 sm:grid-cols-2">
        <AddressInput
          label="Full Name"
          value={draft.fullName}
          onChange={(value) => updateField("fullName", value)}
          error={errorFor("fullName")}
        />
        <AddressInput
          label="Mobile Number"
          value={draft.mobile}
          onChange={(value) => updateField("mobile", value.replace(/[^\d]/g, "").slice(0, 10))}
          error={errorFor("mobile")}
          inputMode="numeric"
        />
        <AddressInput
          label="House / Flat / Building"
          value={draft.house}
          onChange={(value) => updateField("house", value)}
          error={errorFor("house")}
        />
        <AddressInput
          label="Area / Locality"
          value={draft.area}
          onChange={(value) => updateField("area", value)}
          error={errorFor("area")}
        />
        <AddressInput
          label="Landmark (Optional)"
          value={draft.landmark}
          onChange={(value) => updateField("landmark", value)}
          error={errorFor("landmark")}
          required={false}
        />
        <AddressInput
          label="Pincode"
          value={draft.pincode}
          onChange={(value) => updateField("pincode", value.replace(/[^\d]/g, "").slice(0, 6))}
          error={errorFor("pincode")}
          inputMode="numeric"
        />
        <AddressInput
          label="City"
          value={draft.city}
          onChange={(value) => updateField("city", value)}
          error={errorFor("city")}
        />
        <AddressInput
          label="State"
          value={draft.state}
          onChange={(value) => updateField("state", value)}
          error={errorFor("state")}
        />
      </div>
      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={!isFormValid || isSaving}
          className="min-h-11 rounded-bhor-sm bg-bhor-primary px-5 text-bhor-button font-bhor-bold uppercase text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSaving ? "Saving..." : submitLabel}
        </button>
        {onCancel ? (
          <button
            type="button"
            onClick={onCancel}
            disabled={isSaving}
            className="min-h-11 rounded-bhor-sm border border-bhor-border px-5 text-bhor-button font-bhor-bold uppercase text-bhor-text disabled:opacity-50"
          >
            Cancel
          </button>
        ) : null}
      </div>
    </form>
  );
}

function AddressInput({
  error,
  inputMode,
  label,
  onChange,
  required = true,
  value,
}: {
  error?: string;
  inputMode?: "numeric" | "text";
  label: string;
  onChange: (value: string) => void;
  required?: boolean;
  value: string;
}) {
  return (
    <label className="block">
      <span className="text-bhor-caption font-bhor-bold uppercase tracking-wide text-bhor-text-muted">
        {label}
      </span>
      <input
        required={required}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        inputMode={inputMode}
        aria-invalid={Boolean(error)}
        className={`mt-2 min-h-11 w-full rounded-bhor-sm border bg-bhor-cream px-3 text-bhor-small text-bhor-text outline-none focus:border-bhor-primary ${
          error ? "border-bhor-error" : "border-bhor-border"
        }`}
      />
      {error ? <p className="mt-1 text-bhor-caption text-bhor-error">{error}</p> : null}
    </label>
  );
}
