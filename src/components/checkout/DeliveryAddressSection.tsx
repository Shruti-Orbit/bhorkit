"use client";

import { FormEvent, useState } from "react";
import { MapPin } from "lucide-react";
import { useShop } from "@/src/context/ShopContext";

type Address = {
  fullName: string;
  mobile: string;
  house: string;
  area: string;
  landmark: string;
  pincode: string;
  city: string;
  state: string;
};

const addressStorageKey = "bhorkit_checkout_address";
const emptyAddress: Address = {
  fullName: "",
  mobile: "",
  house: "",
  area: "",
  landmark: "",
  pincode: "",
  city: "Patna",
  state: "Bihar",
};

export function DeliveryAddressSection() {
  const { isLoggedIn } = useShop();
  const [address, setAddress] = useState<Address | null>(() => getInitialAddress());
  const [draft, setDraft] = useState<Address>(() => getInitialAddress() ?? emptyAddress);
  const [isEditing, setIsEditing] = useState(() => !getInitialAddress());

  return (
    <section className="rounded-bhor-lg border border-bhor-border bg-bhor-surface p-5 shadow-bhor-soft">
      <h2 className="flex items-center gap-2 text-bhor-product font-bhor-bold text-bhor-text">
        <MapPin className="h-5 w-5 text-bhor-gold" aria-hidden />
        Delivery Details
      </h2>

      {!isLoggedIn ? (
        <p className="mt-2 text-bhor-small text-bhor-text-muted">
          Login or create an account to add your delivery address.
        </p>
      ) : address && !isEditing ? (
        <div className="mt-4 rounded-bhor-md border border-bhor-border bg-bhor-cream p-4">
          <p className="font-bhor-semibold text-bhor-text">{address.fullName}</p>
          <p className="mt-1 text-bhor-small leading-bhor-body text-bhor-text-muted">
            {address.house}, {address.area}
            {address.landmark ? `, ${address.landmark}` : ""}
            <br />
            {address.city}, {address.state} - {address.pincode}
            <br />
            Mobile: {address.mobile}
          </p>
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="mt-3 text-bhor-small font-bhor-bold text-bhor-primary"
          >
            Change
          </button>
        </div>
      ) : (
        <form onSubmit={saveAddress} className="mt-4 space-y-4">
          <p className="text-bhor-small font-bhor-semibold text-bhor-text">
            Where should we deliver your order?
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <AddressInput label="Full Name" value={draft.fullName} onChange={(value) => setDraft({ ...draft, fullName: value })} />
            <AddressInput label="Mobile Number" value={draft.mobile} onChange={(value) => setDraft({ ...draft, mobile: value })} />
            <AddressInput label="House / Flat / Building" value={draft.house} onChange={(value) => setDraft({ ...draft, house: value })} />
            <AddressInput label="Area / Locality" value={draft.area} onChange={(value) => setDraft({ ...draft, area: value })} />
            <AddressInput label="Landmark (Optional)" value={draft.landmark} onChange={(value) => setDraft({ ...draft, landmark: value })} required={false} />
            <AddressInput label="Pincode" value={draft.pincode} onChange={(value) => setDraft({ ...draft, pincode: value })} />
            <AddressInput label="City" value={draft.city} onChange={(value) => setDraft({ ...draft, city: value })} />
            <AddressInput label="State" value={draft.state} onChange={(value) => setDraft({ ...draft, state: value })} />
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="min-h-11 rounded-bhor-sm border border-bhor-primary px-5 text-bhor-button font-bhor-bold uppercase text-bhor-primary"
            >
              Add New Address
            </button>
            <button
              type="submit"
              className="min-h-11 rounded-bhor-sm bg-bhor-primary px-5 text-bhor-button font-bhor-bold uppercase text-white"
            >
              Save Address
            </button>
            <button
              type="submit"
              className="min-h-11 rounded-bhor-sm bg-bhor-gold-light px-5 text-bhor-button font-bhor-bold uppercase text-bhor-primary-dark"
            >
              Continue
            </button>
          </div>
        </form>
      )}
    </section>
  );

  function saveAddress(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAddress(draft);
    setIsEditing(false);
    window.localStorage.setItem(addressStorageKey, JSON.stringify(draft));
  }
}

function AddressInput({
  label,
  onChange,
  required = true,
  value,
}: {
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
        className="mt-2 min-h-11 w-full rounded-bhor-sm border border-bhor-border bg-bhor-cream px-3 text-bhor-small text-bhor-text outline-none focus:border-bhor-primary"
      />
    </label>
  );
}

function getInitialAddress(): Address | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const storedAddress = window.localStorage.getItem(addressStorageKey);
    return storedAddress ? JSON.parse(storedAddress) : null;
  } catch {
    return null;
  }
}
