import { apiPost } from "@/src/lib/api/client";

export type AuthMode = "login" | "signup";

export type BackendUser = {
  id: string;
  email: string;
  emailVerified: boolean;
  image: string | null;
  mobile?: string;
  name: string;
  provider: string;
  role: string;
};

export type AuthResult = {
  token: string;
  user: BackendUser;
};

export async function startOtp(input: {
  email?: string;
  mobile?: string;
  mode: AuthMode;
  name?: string;
}) {
  const response = await apiPost<{
    delivery: "email" | "mobile";
    devOtp?: string;
    identifier: string;
    mode: AuthMode;
  }>("/auth/otp/start", input);

  return response.data;
}

export async function verifyOtp(input: {
  email?: string;
  identifier: string;
  mobile?: string;
  mode: AuthMode;
  name?: string;
  otp: string;
}) {
  const response = await apiPost<AuthResult>("/auth/otp/verify", input);
  return response.data;
}

export async function logout() {
  await apiPost<{ loggedOut: boolean }, Record<string, never>>("/auth/logout", {});
}
