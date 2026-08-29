import { apiGet, apiPost, getApiUrl } from "@/src/lib/api/client";

export type BackendUser = {
  id: string;
  email: string;
  emailVerified: boolean;
  image: string | null;
  name: string;
  provider: "google";
  role: "customer" | "admin";
  /** Whether this account has agreed to the CURRENT terms. Decided server-side. */
  policiesAccepted: boolean;
  policiesAcceptedAt: string | null;
};

export function getGoogleLoginUrl() {
  return getApiUrl("/auth/google");
}

export async function getCurrentUser() {
  const response = await apiGet<BackendUser>("/auth/me");
  return response.data;
}

/**
 * Records the signed-in account's acceptance of the terms.
 *
 * Sends no "accepted" flag — the server records acceptance from the session
 * and its own version, so there is nothing here for a client to forge. The
 * checkbox decides whether this call is made, not whether it counts.
 */
export async function acceptPolicies() {
  const response = await apiPost<BackendUser, Record<string, never>>("/auth/policies/accept", {});
  return response.data;
}

/**
 * A signup that Google has verified but nobody has agreed to yet.
 *
 * The email comes from the server, which is holding the profile Google
 * returned — the browser is not told to trust an email it was given, and
 * cannot substitute a different one.
 */
export type PendingSignup = {
  email: string;
  name: string;
  returnTo: string;
};

/**
 * Asks whether this browser has a signup waiting on acceptance.
 *
 * Answered from the server's own record, keyed by an httpOnly cookie the page
 * cannot read. A 404 means there is nothing pending, which is the normal
 * answer for everyone who is not mid-signup.
 */
export async function getPendingSignup() {
  const response = await apiGet<PendingSignup>("/auth/signup/pending");
  return response.data;
}

/**
 * Creates the account, now that the terms have been accepted.
 *
 * Sends no body at all. The identity being registered is the one the server
 * has been holding since Google verified it, so there is no email, no
 * `accepted: true`, and nothing else here for a client to influence.
 */
export async function completeSignup() {
  const response = await apiPost<{ user: BackendUser; returnTo: string }, Record<string, never>>(
    "/auth/signup/complete",
    {},
  );
  return response.data;
}

/** Throws away a signup the customer decided against. No account was created. */
export async function cancelSignup() {
  await apiPost<{ cancelled: boolean }, Record<string, never>>("/auth/signup/cancel", {});
}

export async function logout() {
  await apiPost<{ loggedOut: boolean }, Record<string, never>>("/auth/logout", {});
}
