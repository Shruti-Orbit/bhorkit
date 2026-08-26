import { apiDelete, apiGet, apiPatch, apiPost } from "@/src/lib/api/client";

export type BackendAddress = {
  id: string;
  fullName: string;
  mobile: string;
  house: string;
  area: string;
  landmark: string;
  pincode: string;
  city: string;
  state: string;
  isDefault: boolean;
  /**
   * Whether this address can be used for a NEW order right now. Computed by
   * the server from current delivery coverage on every read — a saved address
   * becomes undeliverable if its pincode is later withdrawn, without the
   * address itself being changed.
   */
  deliverable: boolean;
  /** Present only when `deliverable` is false. */
  unavailableMessage?: string;
};

// deliverable/unavailableMessage are server-computed and read-only: sending
// them would be ignored, so they are excluded from what a client may write.
export type AddressInput = Omit<BackendAddress, "id" | "isDefault" | "deliverable" | "unavailableMessage"> & {
  isDefault?: boolean;
};

export type AddressBook = {
  addresses: BackendAddress[];
  /** Server-enforced cap, so the UI never hard-codes its own copy of it. */
  max: number;
  canAddMore: boolean;
};

type AddressListMeta = {
  count: number;
  max: number;
  canAddMore: boolean;
};

export async function getAddresses(): Promise<AddressBook> {
  const response = await apiGet<BackendAddress[], AddressListMeta>("/addresses");
  const addresses = response.data;
  const max = response.meta?.max ?? 2;
  return {
    addresses,
    max,
    canAddMore: response.meta?.canAddMore ?? addresses.length < max,
  };
}

export async function createAddress(input: AddressInput) {
  const response = await apiPost<BackendAddress, AddressInput>("/addresses", input);
  return response.data;
}

export async function updateAddress(id: string, input: Partial<AddressInput>) {
  const response = await apiPatch<BackendAddress, Partial<AddressInput>>(`/addresses/${encodeURIComponent(id)}`, input);
  return response.data;
}

export async function deleteAddress(id: string) {
  await apiDelete<{ id: string }>(`/addresses/${encodeURIComponent(id)}`);
}

export async function setDefaultAddress(id: string) {
  const response = await apiPatch<BackendAddress, Record<string, never>>(`/addresses/${encodeURIComponent(id)}/default`, {});
  return response.data;
}
