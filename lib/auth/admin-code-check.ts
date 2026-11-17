import { createHash, timingSafeEqual } from "node:crypto";

/** Fixed-length digest comparison avoids a direct timing comparison of access-code text. */
export function verifyAdminAccessCode(candidate: string, configuredCode: string): boolean {
  if (!configuredCode) return false;
  const candidateDigest = createHash("sha256").update(candidate).digest();
  const configuredDigest = createHash("sha256").update(configuredCode).digest();
  return timingSafeEqual(candidateDigest, configuredDigest);
}
