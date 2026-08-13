export const mockExistingEmails = ["demo@bhorkit.com", "user@bhorkit.com"];
export const mockOtp = "123456";

export function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function isExistingMockUser(email: string) {
  return mockExistingEmails.includes(email.trim().toLowerCase());
}

export function maskEmail(email: string) {
  const [name, domain] = email.split("@");

  if (!name || !domain) {
    return email;
  }

  const visible = name.slice(0, 2);
  return `${visible}${"*".repeat(Math.max(name.length - 2, 2))}@${domain}`;
}
