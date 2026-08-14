export const mockExistingIdentifiers = [
  "demo@bhorkit.com",
  "user@bhorkit.com",
  "9876543210",
  "9123456789",
];

export const mockOtp = "123456";

export type AuthIdentifierType = "email" | "mobile";

export function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export function isValidIndianMobile(value: string) {
  return /^[6-9]\d{9}$/.test(normalizeIdentifier(value));
}

export function isValidAuthIdentifier(value: string) {
  return isValidEmail(value) || isValidIndianMobile(value);
}

export function normalizeIdentifier(value: string) {
  return value.trim().toLowerCase().replace(/^\+91\s?/, "").replace(/\s/g, "");
}

export function getAuthIdentifierType(value: string): AuthIdentifierType {
  return isValidEmail(value) ? "email" : "mobile";
}

export function isExistingMockUser(value: string) {
  return mockExistingIdentifiers.includes(normalizeIdentifier(value));
}

export function maskAuthIdentifier(value: string) {
  const normalized = normalizeIdentifier(value);

  if (isValidEmail(normalized)) {
    const [name, domain] = normalized.split("@");
    const visible = name.slice(0, 2);
    return `${visible}${"*".repeat(Math.max(name.length - 2, 2))}@${domain}`;
  }

  return `${normalized.slice(0, 2)}******${normalized.slice(-2)}`;
}
