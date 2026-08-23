import type { CustomerAddress } from "@/src/context/ShopContext";

// Mirrors the backend's zod rules in src/schemas/address.schema.ts exactly, so
// a draft that passes here will not come back rejected by the server. The
// server still validates independently — this only exists to give immediate
// feedback, never as the enforcement point.

const MOBILE_PATTERN = /^[6-9]\d{9}$/;
const PINCODE_PATTERN = /^\d{6}$/;

export type AddressField =
  | "fullName"
  | "mobile"
  | "house"
  | "area"
  | "landmark"
  | "pincode"
  | "city"
  | "state";

export type AddressDraft = Record<AddressField, string>;

export const addressFields: AddressField[] = [
  "fullName",
  "mobile",
  "house",
  "area",
  "landmark",
  "pincode",
  "city",
  "state",
];

export const emptyAddressDraft: AddressDraft = {
  fullName: "",
  mobile: "",
  house: "",
  area: "",
  landmark: "",
  pincode: "",
  city: "Patna",
  state: "Bihar",
};

/** Seeds the edit form from a saved address, so editing starts from what's stored. */
export function draftFromAddress(address: CustomerAddress): AddressDraft {
  return {
    fullName: address.fullName,
    mobile: address.mobile,
    house: address.house,
    area: address.area,
    landmark: address.landmark ?? "",
    pincode: address.pincode,
    city: address.city,
    state: address.state,
  };
}

export function validateAddressField(field: AddressField, value: string): string | undefined {
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

export function validateAddressDraft(draft: AddressDraft): Partial<Record<AddressField, string>> {
  const errors: Partial<Record<AddressField, string>> = {};
  for (const field of addressFields) {
    const message = validateAddressField(field, draft[field]);
    if (message) errors[field] = message;
  }
  return errors;
}

/**
 * Only the fields that actually changed. Editing sends a minimal PATCH, which
 * keeps an edit from re-asserting values the user never touched.
 */
export function changedFields(draft: AddressDraft, original: AddressDraft): Partial<AddressDraft> {
  const changes: Partial<AddressDraft> = {};
  for (const field of addressFields) {
    if (draft[field].trim() !== original[field].trim()) {
      changes[field] = draft[field].trim();
    }
  }
  return changes;
}
