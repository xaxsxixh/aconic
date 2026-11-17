const SUPPORT_SUBJECT = "FixIt Support Request";
const EMAIL_PATTERN = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i;
export const SUPPORT_EMAIL = "support@gmail.com";

export function createSupportMailto(email: string | null | undefined): string | null {
  const normalized = email?.trim();
  if (!normalized || !EMAIL_PATTERN.test(normalized)) return null;

  const [localPart, domain] = normalized.split("@");
  return `mailto:${encodeURIComponent(localPart)}@${domain}?subject=${encodeURIComponent(SUPPORT_SUBJECT)}`;
}
