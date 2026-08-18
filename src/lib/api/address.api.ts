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
};

export type AddressInput = Omit<BackendAddress, "id" | "isDefault"> & { isDefault?: boolean };

export async function getAddresses() {
  const response = await apiGet<BackendAddress[]>("/addresses");
  return response.data;
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
