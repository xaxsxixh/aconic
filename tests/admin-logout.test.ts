import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
  let adminToken = "";
  const cookieStore = {
    get: vi.fn((name: string) => name === "fixit_admin" && adminToken ? { value: adminToken } : undefined),
    set: vi.fn((name: string, value: string) => {
      if (name === "fixit_admin") adminToken = value;
    }),
    delete: vi.fn((name: string) => {
      if (name === "fixit_admin") adminToken = "";
    }),
  };
  return {
    cookieStore,
    reset: () => { adminToken = ""; },
    seed: (token: string) => { adminToken = token; },
  };
});

vi.mock("server-only", () => ({}));
vi.mock("next/headers", () => ({ cookies: async () => mocks.cookieStore }));

import { POST } from "../app/api/admin/logout/route";
import { withAdminAuthorization } from "../lib/auth/admin-guard";
import { hasAdminSession } from "../lib/auth/cookies";
import { createAdminSessionToken } from "../lib/auth/session-token";

const testSecret = "a-test-only-admin-signing-secret-with-enough-bytes";

describe("administrator logout", () => {
  beforeEach(() => {
    mocks.reset();
    vi.stubEnv("COOKIE_SIGNING_SECRET", testSecret);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("expires the admin cookie and blocks subsequent protected work", async () => {
    mocks.seed(createAdminSessionToken(testSecret));

    const response = await POST();
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ authenticated: false });
    expect(response.headers.get("Cache-Control")).toBe("no-store");
    expect(mocks.cookieStore.set).toHaveBeenCalledWith("fixit_admin", "", expect.objectContaining({
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 0,
      expires: new Date(0),
    }));
    await expect(hasAdminSession()).resolves.toBe(false);

    const protectedResponse = await withAdminAuthorization(hasAdminSession, async () => Response.json({ protected: true }));
    expect(protectedResponse.status).toBe(401);
  });

  it("does not clear cookies for an unauthenticated logout request", async () => {
    const response = await POST();
    expect(response.status).toBe(401);
    expect(mocks.cookieStore.set).not.toHaveBeenCalled();
  });
});
