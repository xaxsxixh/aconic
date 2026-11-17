import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

const ADMIN_SESSION_SECONDS = 60 * 60 * 8;

function signature(token: string, secret: string) {
  return createHmac("sha256", secret).update(token).digest("base64url");
}

export function createAdminSessionToken(secret: string, nowMs = Date.now()) {
  const expiresAt = Math.floor(nowMs / 1000) + ADMIN_SESSION_SECONDS;
  const payload = `${expiresAt}.${randomBytes(16).toString("base64url")}`;
  return `${payload}.${signature(payload, secret)}`;
}

export function verifyAdminSessionToken(value: string, secret: string, nowMs = Date.now()): boolean {
  if (!secret) return false;
  const parts = value.split(".");
  if (parts.length !== 3) return false;
  const [expires, nonce, actualSignature] = parts;
  if (!/^\d+$/.test(expires) || Number(expires) <= Math.floor(nowMs / 1000) || !/^[A-Za-z0-9_-]{20,}$/.test(nonce)) return false;
  const expected = Buffer.from(signature(`${expires}.${nonce}`, secret));
  const actual = Buffer.from(actualSignature);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}
