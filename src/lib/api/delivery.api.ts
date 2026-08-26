import { apiGet } from "@/src/lib/api/client";

export type PincodeAvailability = {
  pincode: string;
  /** Well-formed six-digit Indian pincode. */
  valid: boolean;
  /** We deliver here. Always false when `valid` is false. */
  serviceable: boolean;
  /** What to show the user; null when the pincode is fine. */
  message: string | null;
};

/**
 * Asks the server whether a pincode is deliverable.
 *
 * The answer always comes from the API — the storefront holds no copy of the
 * covered pincodes, so coverage can be changed in the admin without a deploy,
 * and a customer cannot read the list out of the bundle. This is for feedback
 * only: the server independently re-checks on address save and at checkout.
 */
export async function checkPincode(pincode: string): Promise<PincodeAvailability> {
  const response = await apiGet<PincodeAvailability>(
    `/delivery/pincodes/check?pincode=${encodeURIComponent(pincode)}`,
  );
  return response.data;
}
