export type RawGeoLocation = {
  latitude: number;
  longitude: number;
  accuracy: number;
} | null;

/**
 * How long to wait for a fix once permission is already granted. The device
 * only has to produce a position, which is quick.
 */
const FIX_TIMEOUT_MS = 10_000;

/**
 * How long to wait when the browser still has to ASK.
 *
 * This is the fix for "the first submission has no location, the second one
 * does". `getCurrentPosition`'s timeout covers the permission prompt as well
 * as the fix, so a 5-second budget ran out while the person was still reading
 * the dialog — the first attempt timed out to null, and by the second attempt
 * permission had been granted and a position cached, so it worked. The clock
 * has to allow for a human deciding, not just a chip responding.
 */
const PROMPT_TIMEOUT_MS = 30_000;

/** Whether the browser will show a permission prompt for this call. */
async function willPrompt(): Promise<boolean> {
  try {
    const status = await navigator.permissions?.query({ name: "geolocation" });
    // "granted" needs no prompt. "prompt" clearly does. "denied" fails
    // instantly anyway, so the longer budget costs nothing there.
    return status?.state !== "granted";
  } catch {
    // Permissions API unavailable (older Safari). Assume a prompt is possible.
    return true;
  }
}

/**
 * The device's coordinates, or null.
 *
 * Best-effort only: resolves to null and never rejects if geolocation is
 * unsupported, permission is denied, or it times out — a form must stay
 * submittable either way. Only raw coordinates are captured here; the server
 * turns them into a place name.
 */
export async function getBestEffortLocation(): Promise<RawGeoLocation> {
  if (typeof navigator === "undefined" || !navigator.geolocation) {
    return null;
  }

  const timeout = (await willPrompt()) ? PROMPT_TIMEOUT_MS : FIX_TIMEOUT_MS;

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
      },
      () => resolve(null),
      // A position from the last five minutes is good enough for "roughly
      // where is this person", and reusing it makes a repeat submission
      // instant instead of waking the radio again.
      { timeout, maximumAge: 300_000, enableHighAccuracy: false },
    );
  });
}
