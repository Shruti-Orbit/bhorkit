"use client";

import { useState } from "react";
import { MapPin, Pencil } from "lucide-react";
import { AddressForm } from "@/src/components/address/AddressForm";
import { useShop, type CustomerAddress } from "@/src/context/ShopContext";
import {
  changedFields,
  draftFromAddress,
  type AddressDraft,
} from "@/src/lib/address/validation";

type Mode = { kind: "list" } | { kind: "add" } | { kind: "edit"; addressId: string };

export function DeliveryAddressSection() {
  const {
    addAddress,
    addresses,
    canAddMoreAddresses,
    isLoggedIn,
    maxAddresses,
    selectedAddressId,
    setSelectedAddressId,
    updateAddress,
  } = useShop();

  // Opens straight into the form for a customer with no saved address, so
  // checkout doesn't dead-end on an empty list.
  const [mode, setMode] = useState<Mode>({ kind: "list" });
  const effectiveMode: Mode =
    mode.kind === "list" && addresses.length === 0 ? { kind: "add" } : mode;

  const editing =
    effectiveMode.kind === "edit"
      ? addresses.find((address) => address.id === effectiveMode.addressId)
      : undefined;

  async function handleAdd(draft: AddressDraft) {
    const saved = await addAddress({ ...draft, isDefault: addresses.length === 0 });
    if (saved) setMode({ kind: "list" });
    return saved;
  }

  async function handleEdit(draft: AddressDraft) {
    if (!editing) return false;
    const changes = changedFields(draft, draftFromAddress(editing));
    if (Object.keys(changes).length === 0) {
      // Nothing changed — close without a pointless round trip (the server
      // rejects an empty PATCH body anyway).
      setMode({ kind: "list" });
      return true;
    }
    // Updates in place: the id is unchanged, so the checkout selection below
    // stays valid and this can't count against the address limit.
    const saved = await updateAddress(editing.id, changes);
    if (saved) setMode({ kind: "list" });
    return saved;
  }

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
      ) : effectiveMode.kind === "edit" && editing ? (
        <div className="mt-4">
          <AddressForm
            title="Edit Address"
            initialDraft={draftFromAddress(editing)}
            submitLabel="Save Changes"
            onSubmit={handleEdit}
            onCancel={() => setMode({ kind: "list" })}
          />
        </div>
      ) : effectiveMode.kind === "add" ? (
        <div className="mt-4">
          <AddressForm
            title="Add Delivery Address"
            submitLabel="Save Address"
            onSubmit={handleAdd}
            {...(addresses.length > 0 ? { onCancel: () => setMode({ kind: "list" }) } : {})}
          />
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          <p className="text-bhor-small font-bhor-semibold text-bhor-text">Select Delivery Address</p>
          <div className="grid gap-3">
            {addresses.map((address) => (
              <div
                key={address.id}
                className={`flex items-start gap-3 rounded-bhor-md border p-4 ${
                  selectedAddressId === address.id
                    ? "border-bhor-primary bg-bhor-primary-soft"
                    : "border-bhor-border bg-bhor-cream"
                }`}
              >
                <label className="flex flex-1 cursor-pointer gap-3">
                  <input
                    type="radio"
                    name="delivery-address"
                    checked={selectedAddressId === address.id}
                    onChange={() => setSelectedAddressId(address.id)}
                    className="mt-1 h-4 w-4 shrink-0 accent-bhor-primary"
                  />
                  <AddressText address={address} />
                </label>
                <button
                  type="button"
                  onClick={() => setMode({ kind: "edit", addressId: address.id })}
                  aria-label={`Edit address for ${address.fullName}`}
                  className="inline-flex shrink-0 items-center gap-1 rounded-bhor-sm px-2 py-1 text-bhor-caption font-bhor-bold uppercase text-bhor-primary hover:bg-bhor-surface"
                >
                  <Pencil className="h-3.5 w-3.5" aria-hidden />
                  Edit
                </button>
              </div>
            ))}
          </div>

          {canAddMoreAddresses ? (
            <button
              type="button"
              onClick={() => setMode({ kind: "add" })}
              className="min-h-11 rounded-bhor-sm border border-bhor-primary px-5 text-bhor-button font-bhor-bold uppercase text-bhor-primary"
            >
              Add New Address
            </button>
          ) : (
            <p className="text-bhor-caption text-bhor-text-muted">
              You&apos;ve saved the maximum of {maxAddresses} addresses. Edit one above, or remove one
              from your account to add another.
            </p>
          )}
        </div>
      )}
    </section>
  );
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
