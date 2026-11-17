import { describe, expect, it } from "vitest";
import { createSupportMailto, SUPPORT_EMAIL } from "../lib/support/contact";

describe("homepage support contact", () => {
  it("encodes the configured address and subject in a mailto URL", () => {
    expect(createSupportMailto("team+fixit@example.test"))
      .toBe("mailto:team%2Bfixit@example.test?subject=FixIt%20Support%20Request");
    expect(createSupportMailto(SUPPORT_EMAIL))
      .toBe("mailto:support@gmail.com?subject=FixIt%20Support%20Request");
  });

  it("leaves missing or invalid support addresses disabled", () => {
    expect(createSupportMailto(undefined)).toBeNull();
    expect(createSupportMailto("   ")).toBeNull();
    expect(createSupportMailto("not-an-email")).toBeNull();
  });
});
