"use client";

import { FormEvent, useMemo, useState } from "react";
import { Trash2 } from "lucide-react";
import { AccountSectionCard, AccountShell } from "@/src/components/account/AccountShell";
import { AddressText } from "@/src/components/checkout/DeliveryAddressSection";
import { useShop } from "@/src/context/ShopContext";

const MAX_ADDRESSES = 2;
const MOBILE_PATTERN = /^[6-9]\d{9}$/;
const PINCODE_PATTERN = /^\d{6}$/;

type AddressField = "fullName" | "mobile" | "house" | "area" | "landmark" | "pincode" | "city" | "state";

type AddressDraft = Record<AddressField, string> & { isDefault: boolean };

const emptyAddress: AddressDraft = {
  fullName: "",
  mobile: "",
  house: "",
  area: "",
  landmark: "",
  pincode: "",
  city: "Patna",
  state: "Bihar",
  isDefault: false,
};

// Mirrors the backend's zod rules in src/schemas/address.schema.ts exactly,
// so a field that passes here will not come back rejected by the server.
function validateField(field: AddressField, value: string): string | undefined {
  const trimmed = value.trim();
  switch (field) {
    case "fullName":
      if (trimmed.length < 2) return "Enter the full name.";
      if (trimmed.length > 80) return "Full name is too long.";
      return undefined;
    case "mobile":
      if (!MOBILE_PATTERN.test(trimmed)) return "Enter a valid 10-digit mobile number.";
      return undefined;
    case "house":
      if (!trimmed) return "House / flat / building is required.";
      if (trimmed.length > 120) return "That's too long.";
      return undefined;
    case "area":
      if (!trimmed) return "Area / locality is required.";
      if (trimmed.length > 120) return "That's too long.";
      return undefined;
    case "landmark":
      if (trimmed.length > 120) return "That's too long.";
      return undefined;
    case "pincode":
      if (!PINCODE_PATTERN.test(trimmed)) return "Enter a valid 6-digit pincode.";
      return undefined;
    case "city":
      if (!trimmed) return "City is required.";
      if (trimmed.length > 80) return "That's too long.";
      return undefined;
    case "state":
      if (!trimmed) return "State is required.";
      if (trimmed.length > 80) return "That's too long.";
      return undefined;
    default:
      return undefined;
  }
}

const addressFields: AddressField[] = ["fullName", "mobile", "house", "area", "landmark", "pincode", "city", "state"];

function validateDraft(draft: AddressDraft): Partial<Record<AddressField, string>> {
  const errors: Partial<Record<AddressField, string>> = {};
  for (const field of addressFields) {
    const message = validateField(field, draft[field]);
    if (message) errors[field] = message;
  }
  return errors;
}

export default function AddressesPage() {
  const { addAddress, addresses, deleteAddress, setDefaultAddress } = useShop();
  const [draft, setDraft] = useState<AddressDraft>(emptyAddress);
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showForm, setShowForm] = useState(addresses.length === 0);
  const atMaxAddresses = addresses.length >= MAX_ADDRESSES;

  const fieldErrors = useMemo(() => validateDraft(draft), [draft]);
  const isFormValid = Object.keys(fieldErrors).length === 0;

  function updateField(field: AddressField, value: string) {
    setDraft((current) => ({ ...current, [field]: value }));
  }

  // Driven by the field's actual value rather than a blur/touched flag, so
  // it still catches invalid input that arrived via browser autofill —
  // autofill sets a field's value without necessarily firing blur on it, so
  // a blur-gated error would silently never appear even though the Save
  // button (which reads the same fieldErrors) is correctly disabled.
  function errorFor(field: AddressField): string | undefined {
    const message = fieldErrors[field];
    if (!message) return undefined;
    if (draft[field].trim().length > 0) return message;
    // Field is still empty — only nag about "required" once the user has
    // actually tried to submit, not the instant the form opens.
    return hasAttemptedSubmit ? message : undefined;
  }

  async function saveAddress(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    // Guards the case the submit button couldn't (e.g. Enter key with a
    // disabled submit button in some browsers) — same rules, belt and braces.
    if (!isFormValid) {
      setHasAttemptedSubmit(true);
      return;
    }

    setIsSaving(true);
    const success = await addAddress(draft);
    setIsSaving(false);

    if (success) {
      setDraft(emptyAddress);
      setHasAttemptedSubmit(false);
      setShowForm(false);
    }
    // On failure the form stays open with everything the user typed intact,
    // and the reason is already surfaced via the error toast.
  }

  function openForm() {
    setDraft(emptyAddress);
    setHasAttemptedSubmit(false);
    setShowForm(true);
  }

  return (
    <AccountShell>
      <div className="space-y-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-bhor-display text-bhor-h2-mobile font-bhor-semibold text-bhor-text md:text-bhor-h2">
              Saved Addresses
            </h1>
            <p className="mt-2 text-bhor-small text-bhor-text-muted">
              Manage your delivery addresses for faster checkout.
            </p>
          </div>
          {!atMaxAddresses ? (
            <button
              type="button"
              onClick={openForm}
              className="min-h-11 rounded-bhor-sm bg-bhor-primary px-5 text-bhor-button font-bhor-bold uppercase text-white"
            >
              Add New Address
            </button>
          ) : null}
        </div>

        {addresses.length === 0 && !showForm ? (
          <AccountSectionCard>
            <div className="text-center">
              <h2 className="text-bhor-product font-bhor-bold text-bhor-text">No saved addresses yet.</h2>
              <p className="mt-2 text-bhor-small text-bhor-text-muted">
                Add your delivery address for a faster checkout.
              </p>
            </div>
          </AccountSectionCard>
        ) : null}

        {addresses.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {addresses.map((address) => (
              <AccountSectionCard key={address.id}>
                <AddressText address={address} />
                <div className="mt-4 flex flex-wrap gap-2">
                  {!address.isDefault ? (
                    <button
                      type="button"
                      onClick={() => setDefaultAddress(address.id)}
                      className="rounded-bhor-sm border border-bhor-primary px-3 py-2 text-bhor-caption font-bhor-bold uppercase text-bhor-primary"
                    >
                      Make Default
                    </button>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => deleteAddress(address.id)}
                    className="inline-flex items-center gap-2 rounded-bhor-sm px-3 py-2 text-bhor-caption font-bhor-bold uppercase text-bhor-primary"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden />
                    Delete
                  </button>
                </div>
              </AccountSectionCard>
            ))}
          </div>
        ) : null}

        {atMaxAddresses && !showForm ? (
          <p className="text-bhor-caption text-bhor-text-muted">
            You&apos;ve reached the limit of {MAX_ADDRESSES} saved addresses. Delete one to add a new address.
          </p>
        ) : null}

        {showForm ? (
          <AccountSectionCard>
            <form onSubmit={saveAddress} noValidate className="space-y-4">
              <h2 className="text-bhor-product font-bhor-bold text-bhor-text">Add New Address</h2>
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
                  {isSaving ? "Saving..." : "Save Address"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="min-h-11 rounded-bhor-sm border border-bhor-border px-5 text-bhor-button font-bhor-bold uppercase text-bhor-text"
                >
                  Cancel
                </button>
              </div>
            </form>
          </AccountSectionCard>
        ) : null}
      </div>
    </AccountShell>
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
