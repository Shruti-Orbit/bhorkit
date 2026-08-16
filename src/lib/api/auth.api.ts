import { apiGet, apiPost, getApiUrl } from "@/src/lib/api/client";

export type BackendUser = {
  id: string;
  email: string;
  emailVerified: boolean;
  image: string | null;
  name: string;
  provider: "google";
  role: "customer" | "admin";
};

export function getGoogleLoginUrl() {
  return getApiUrl("/auth/google");
}

export async function getCurrentUser() {
  const response = await apiGet<BackendUser>("/auth/me");
  return response.data;
}

export async function logout() {
  await apiPost<{ loggedOut: boolean }, Record<string, never>>("/auth/logout", {});
}
