import { apiPost } from "@/src/lib/api/client";
import type { RawGeoLocation } from "@/src/lib/geolocation";

/**
 * Asks to be told when a Coming Soon product launches.
 *
 * Sends the address and the product's id and nothing else — the product's
 * name, its range and the request's origin are all recorded from what the
 * server can see for itself, and the endpoint refuses a payload that tries to
 * supply them.
 *
 * Asking twice is not an error. The server answers 200 either way and says
 * which happened, so the form can tell someone they are already on the list
 * without treating it as a failure.
 */
export type LaunchSubscription = {
  alreadyOnList: boolean;
};

export async function subscribeToLaunch(input: {
  email: string;
  productId: string;
  /** The browser's own position, when the visitor allowed it. */
  location?: RawGeoLocation;
}) {
  const response = await apiPost<
    LaunchSubscription,
    { email: string; productId: string; location: RawGeoLocation }
  >("/notify/subscribe", {
    email: input.email,
    productId: input.productId,
    location: input.location ?? null,
  });
  return { alreadyOnList: response.data.alreadyOnList, message: response.message };
}

/**
 * Signs an address up to the newsletter.
 *
 * The same endpoint as a launch alert, with no product id — that absence is
 * what makes it a newsletter subscription. Reusing the route means this form
 * gets the same validation, rate limiting and duplicate handling for free, and
 * the server decides the wording of the confirmation.
 *
 * `location` is the browser's own position when the visitor allowed it, the
 * same shape the support form sends. Coordinates only: the server turns them
 * into a place name, so nothing here can claim to be somewhere it is not.
 */
export async function subscribeToNewsletter(email: string, location: RawGeoLocation = null) {
  const response = await apiPost<LaunchSubscription, { email: string; location: RawGeoLocation }>(
    "/notify/subscribe",
    { email, location },
  );
  return { alreadyOnList: response.data.alreadyOnList, message: response.message };
}

/**
 * A quick check before bothering the server.
 *
 * Deliberately close to what the API enforces, but it is a courtesy for the
 * person typing, not a control: the server validates independently and its
 * answer is the one that counts.
 */
export function looksLikeEmail(value: string): boolean {
  const trimmed = value.trim();
  if (trimmed.length === 0 || trimmed.length > 254 || /\s/.test(trimmed)) return false;

  const parts = trimmed.split("@");
  if (parts.length !== 2) return false;

  const [local, domain] = parts;
  if (!local || !domain || domain.includes("..") || domain.startsWith(".") || domain.endsWith(".")) {
    return false;
  }

  const labels = domain.split(".");
  if (labels.length < 2) return false;
  return /^[A-Za-z]{2,}$/.test(labels[labels.length - 1] ?? "");
}
