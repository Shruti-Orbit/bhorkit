"use client";

import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { AccountSectionCard, AccountShell } from "@/src/components/account/AccountShell";
import { AddressForm } from "@/src/components/address/AddressForm";
import { AddressText } from "@/src/components/checkout/DeliveryAddressSection";
import { useShop } from "@/src/context/ShopContext";
import {
  changedFields,
  draftFromAddress,
  type AddressDraft,
} from "@/src/lib/address/validation";

type Mode = { kind: "idle" } | { kind: "add" } | { kind: "edit"; addressId: string };

export default function AddressesPage() {
  const {
    addAddress,
    addresses,
    canAddMoreAddresses,
    deleteAddress,
    maxAddresses,
    setDefaultAddress,
    updateAddress,
  } = useShop();

  const [mode, setMode] = useState<Mode>({ kind: "idle" });

  // Falls back to the add form when the account has nothing saved yet.
  const effectiveMode: Mode =
    mode.kind === "idle" && addresses.length === 0 ? { kind: "add" } : mode;

  const editing =
    effectiveMode.kind === "edit"
      ? addresses.find((address) => address.id === effectiveMode.addressId)
      : undefined;

  async function handleAdd(draft: AddressDraft) {
    const saved = await addAddress(draft);
    if (saved) setMode({ kind: "idle" });
    return saved;
  }

  async function handleEdit(draft: AddressDraft) {
    if (!editing) return false;
    const changes = changedFields(draft, draftFromAddress(editing));
    if (Object.keys(changes).length === 0) {
      setMode({ kind: "idle" });
      return true;
    }
    // In-place update — the address keeps its id, so this never reads as a
    // new address against the saved-address limit.
    const saved = await updateAddress(editing.id, changes);
    if (saved) setMode({ kind: "idle" });
    return saved;
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
          {canAddMoreAddresses && effectiveMode.kind === "idle" ? (
            <button
              type="button"
              onClick={() => setMode({ kind: "add" })}
              className="min-h-11 rounded-bhor-sm bg-bhor-primary px-5 text-bhor-button font-bhor-bold uppercase text-white"
            >
              Add New Address
            </button>
          ) : null}
        </div>

        {addresses.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {addresses.map((address) => (
              <AccountSectionCard key={address.id}>
                <AddressText address={address} />
                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setMode({ kind: "edit", addressId: address.id })}
                    className="inline-flex items-center gap-2 rounded-bhor-sm border border-bhor-primary px-3 py-2 text-bhor-caption font-bhor-bold uppercase text-bhor-primary"
                  >
                    <Pencil className="h-4 w-4" aria-hidden />
                    Edit
                  </button>
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
        ) : effectiveMode.kind !== "add" ? (
          <AccountSectionCard>
            <div className="text-center">
              <h2 className="text-bhor-product font-bhor-bold text-bhor-text">
                No saved addresses yet.
              </h2>
              <p className="mt-2 text-bhor-small text-bhor-text-muted">
                Add your delivery address for a faster checkout.
              </p>
            </div>
          </AccountSectionCard>
        ) : null}

        {!canAddMoreAddresses && effectiveMode.kind === "idle" ? (
          <p className="text-bhor-caption text-bhor-text-muted">
            You&apos;ve reached the limit of {maxAddresses} saved addresses. Edit one above, or delete
            one to add a new address.
          </p>
        ) : null}

        {effectiveMode.kind === "edit" && editing ? (
          <AccountSectionCard>
            <AddressForm
              title="Edit Address"
              initialDraft={draftFromAddress(editing)}
              submitLabel="Save Changes"
              onSubmit={handleEdit}
              onCancel={() => setMode({ kind: "idle" })}
            />
          </AccountSectionCard>
        ) : null}

        {effectiveMode.kind === "add" ? (
          <AccountSectionCard>
            <AddressForm
              title="Add New Address"
              submitLabel="Save Address"
              onSubmit={handleAdd}
              {...(addresses.length > 0 ? { onCancel: () => setMode({ kind: "idle" }) } : {})}
            />
          </AccountSectionCard>
        ) : null}
      </div>
    </AccountShell>
  );
}
