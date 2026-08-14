"use client";

import { FormEvent, useState } from "react";
import { MapPin } from "lucide-react";
import { useShop, type CustomerAddress } from "@/src/context/ShopContext";

const emptyAddress = {
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

export function DeliveryAddressSection() {
  const {
    addAddress,
    addresses,
    isLoggedIn,
    selectedAddressId,
    setSelectedAddressId,
  } = useShop();
  const [draft, setDraft] = useState(emptyAddress);
  const [isAdding, setIsAdding] = useState(false);

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
      ) : addresses.length > 0 && !isAdding ? (
        <div className="mt-4 space-y-3">
          <p className="text-bhor-small font-bhor-semibold text-bhor-text">
            Select Delivery Address
          </p>
          <div className="grid gap-3">
            {addresses.map((address) => (
              <label
                key={address.id}
                className={`flex cursor-pointer gap-3 rounded-bhor-md border p-4 ${
                  selectedAddressId === address.id
                    ? "border-bhor-primary bg-bhor-primary-soft"
                    : "border-bhor-border bg-bhor-cream"
                }`}
              >
                <input
                  type="radio"
                  name="delivery-address"
                  checked={selectedAddressId === address.id}
                  onChange={() => setSelectedAddressId(address.id)}
                  className="mt-1 h-4 w-4 accent-bhor-primary"
                />
                <AddressText address={address} />
              </label>
            ))}
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => setIsAdding(true)}
              className="min-h-11 rounded-bhor-sm border border-bhor-primary px-5 text-bhor-button font-bhor-bold uppercase text-bhor-primary"
            >
              Add New Address
            </button>
            <button
              type="button"
              className="min-h-11 rounded-bhor-sm bg-bhor-gold-light px-5 text-bhor-button font-bhor-bold uppercase text-bhor-primary-dark"
            >
              Continue
            </button>
          </div>
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
            {addresses.length > 0 ? (
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="min-h-11 rounded-bhor-sm border border-bhor-border px-5 text-bhor-button font-bhor-bold uppercase text-bhor-text"
              >
                Cancel
              </button>
            ) : null}
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
    addAddress(draft);
    setDraft(emptyAddress);
    setIsAdding(false);
  }
}

export function AddressText({ address }: { address: CustomerAddress }) {
  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <p className="font-bhor-semibold text-bhor-text">{address.fullName}</p>
        {address.isDefault ? (
          <span className="rounded-bhor-sm bg-bhor-gold-light px-2 py-0.5 text-bhor-badge font-bhor-bold uppercase text-bhor-primary-dark">
            Default
          </span>
        ) : null}
      </div>
      <p className="mt-1 text-bhor-small leading-bhor-body text-bhor-text-muted">
        {address.house}, {address.area}
        {address.landmark ? `, ${address.landmark}` : ""}
        <br />
        {address.city}, {address.state} - {address.pincode}
        <br />
        Mobile: {address.mobile}
      </p>
    </div>
  );
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
