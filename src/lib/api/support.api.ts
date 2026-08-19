import { apiPost } from "@/src/lib/api/client";
import type { RawGeoLocation } from "@/src/lib/geolocation";

export type SupportLocation = {
  latitude: number;
  longitude: number;
  accuracy?: number;
  address: {
    formatted: string;
    city?: string;
    state?: string;
    country?: string;
  } | null;
} | null;

export type SubmittedSupportQuery = {
  description: string;
  location: SupportLocation;
  createdAt: string;
};

export async function submitSupportQuery(description: string, location: RawGeoLocation) {
  const response = await apiPost<SubmittedSupportQuery, { description: string; location: RawGeoLocation }>(
    "/support",
    { description, location },
  );
  return response.data;
}
