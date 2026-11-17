import "server-only";
import { cookies } from "next/headers";
import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";
import { createAdminSessionToken, verifyAdminSessionToken } from "@/lib/auth/session-token";

const REPORTER_COOKIE = "fixit_reporter";
const ADMIN_COOKIE = "fixit_admin";
const REPORTER_MAX_AGE = 60 * 60 * 24 * 365;
const ADMIN_MAX_AGE = 60 * 60 * 8;

function signingSecret(): string {
  const secret = process.env.COOKIE_SIGNING_SECRET;
  if (!secret || Buffer.byteLength(secret) < 32) {
    throw new Error("COOKIE_SIGNING_SECRET must contain at least 32 bytes.");
  }
  return secret;
}

function sign(value: string): string {
  return createHmac("sha256", signingSecret()).update(value).digest("base64url");
}

function verify(value: string, signature: string): boolean {
  const expected = Buffer.from(sign(value));
  const actual = Buffer.from(signature);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

function cookieOptions(maxAge: number) {
  return { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax" as const, path: "/", maxAge };
}

export async function getOrCreateReporterId(): Promise<string> {
  const jar = await cookies();
  const existing = jar.get(REPORTER_COOKIE)?.value;
  const verified = verifyReporterCookie(existing);
  if (verified) return verified;
  const id = randomUUID();
  jar.set(REPORTER_COOKIE, `${id}.${sign(id)}`, cookieOptions(REPORTER_MAX_AGE));
  return id;
}

/** Reads and verifies an existing identity without creating one (used by activity GET). */
export async function readReporterId(): Promise<string | null> {
  return verifyReporterCookie((await cookies()).get(REPORTER_COOKIE)?.value);
}

function verifyReporterCookie(value: string | undefined): string | null {
  if (!value) return null;
  const [id, signature, ...rest] = value.split(".");
  if (rest.length || !id || !signature || !/^[0-9a-f-]{36}$/i.test(id)) return null;
  return verify(id, signature) ? id : null;
}

export async function createAdminSession(): Promise<void> {
  const jar = await cookies();
  jar.set(ADMIN_COOKIE, createAdminSessionToken(signingSecret()), cookieOptions(ADMIN_MAX_AGE));
}

export async function hasAdminSession(): Promise<boolean> {
  const value = (await cookies()).get(ADMIN_COOKIE)?.value;
  if (!value) return false;
  return verifyAdminSessionToken(value, signingSecret());
}

export async function clearAdminSession(): Promise<void> {
  (await cookies()).set(ADMIN_COOKIE, "", {
    ...cookieOptions(0),
    expires: new Date(0),
  });
}
