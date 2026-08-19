export type RawGeoLocation = {
  latitude: number;
  longitude: number;
  accuracy: number;
} | null;

// Best-effort only: resolves to null (never rejects) if geolocation isn't
// supported, permission is denied, or it times out — a support query should
// still be submittable either way. Only the raw device coordinates are
// captured here; the backend resolves them to an address.
export function getBestEffortLocation(): Promise<RawGeoLocation> {
  return new Promise((resolve) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      resolve(null);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
      },
      () => resolve(null),
      { timeout: 5000, maximumAge: 60000 },
    );
  });
}
