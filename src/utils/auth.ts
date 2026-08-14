export const mockExistingIdentifiers = [
  "demo@bhorkit.com",
  "user@bhorkit.com",
  "9876543210",
  "9123456789",
];

export const mockOtp = "123456";
const registeredUsersStorageKey = "bhorkit_registered_users";

export type AuthIdentifierType = "email" | "mobile";

export type RegisteredUser = {
  id: string;
  email: string;
  mobile: string;
  name: string;
};

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
  return Boolean(findRegisteredUser(value));
}

export function findRegisteredUser(value: string): RegisteredUser | null {
  const normalized = normalizeIdentifier(value);
  return (
    getRegisteredUsers().find(
      (user) => user.email === normalized || normalizeIdentifier(user.mobile) === normalized,
    ) ?? null
  );
}

export function registerMockUser(input: { email: string; mobile: string; name?: string }) {
  const email = normalizeIdentifier(input.email);
  const mobile = normalizeIdentifier(input.mobile);
  const existing = findRegisteredUser(email) ?? findRegisteredUser(mobile);

  if (existing) {
    return existing;
  }

  const user: RegisteredUser = {
    id: email,
    email,
    mobile,
    name: input.name?.trim() || "BHORKIT Devotee",
  };
  const users = [...getRegisteredUsers(), user];

  if (typeof window !== "undefined") {
    window.localStorage.setItem(registeredUsersStorageKey, JSON.stringify(users));
  }

  return user;
}

export function getRegisteredUsers(): RegisteredUser[] {
  const defaults: RegisteredUser[] = [
    {
      id: "demo@bhorkit.com",
      email: "demo@bhorkit.com",
      mobile: "9876543210",
      name: "BHORKIT Devotee",
    },
    {
      id: "user@bhorkit.com",
      email: "user@bhorkit.com",
      mobile: "9123456789",
      name: "BHORKIT Devotee",
    },
  ];

  if (typeof window === "undefined") {
    return defaults;
  }

  try {
    const stored = window.localStorage.getItem(registeredUsersStorageKey);
    const parsed = stored ? JSON.parse(stored) : [];
    return [...defaults, ...(Array.isArray(parsed) ? parsed : [])];
  } catch {
    return defaults;
  }
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
