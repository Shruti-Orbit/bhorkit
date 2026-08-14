"use client";

import { FormEvent, useState } from "react";
import { Trash2 } from "lucide-react";
import { AccountSectionCard, AccountShell } from "@/src/components/account/AccountShell";
import { AddressText } from "@/src/components/checkout/DeliveryAddressSection";
import { useShop } from "@/src/context/ShopContext";

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

export default function AddressesPage() {
  const { addAddress, addresses, deleteAddress, setDefaultAddress } = useShop();
  const [draft, setDraft] = useState(emptyAddress);
  const [showForm, setShowForm] = useState(addresses.length === 0);

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
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="min-h-11 rounded-bhor-sm bg-bhor-primary px-5 text-bhor-button font-bhor-bold uppercase text-white"
          >
            Add New Address
          </button>
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

        {showForm ? (
          <AccountSectionCard>
            <form onSubmit={saveAddress} className="space-y-4">
              <h2 className="text-bhor-product font-bhor-bold text-bhor-text">Add New Address</h2>
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
              <div className="flex flex-wrap gap-3">
                <button type="submit" className="min-h-11 rounded-bhor-sm bg-bhor-primary px-5 text-bhor-button font-bhor-bold uppercase text-white">
                  Save Address
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="min-h-11 rounded-bhor-sm border border-bhor-border px-5 text-bhor-button font-bhor-bold uppercase text-bhor-text">
                  Cancel
                </button>
              </div>
            </form>
          </AccountSectionCard>
        ) : null}
      </div>
    </AccountShell>
  );

  function saveAddress(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    addAddress(draft);
    setDraft(emptyAddress);
    setShowForm(false);
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
