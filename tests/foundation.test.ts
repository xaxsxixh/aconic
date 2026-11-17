import { describe, expect, it } from "vitest";
import { createIssueSchema, isAllowedStatusTransition, normalizeLocation } from "../lib/validation/issues";

describe("issue foundation", () => {
  it("validates and trims a new issue", () => {
    expect(createIssueSchema.parse({ category: "Electrical", location: " Block A ", title: "  Lights out  " }))
      .toMatchObject({ location: "Block A", title: "Lights out", description: "" });
  });

  it("rejects unknown fields and overlong descriptions", () => {
    expect(createIssueSchema.safeParse({ category: "Other", location: "Lab", title: "Issue title", reporterId: "spoof" }).success).toBe(false);
    expect(createIssueSchema.safeParse({ category: "Other", location: "Lab", title: "Issue title", description: "x".repeat(2001) }).success).toBe(false);
  });

  it("normalizes locations without treating different locations as equal", () => {
    expect(normalizeLocation("  BLOCK   A ")).toBe("block a");
    expect(normalizeLocation("Lab 2")).not.toBe(normalizeLocation("Lab 3"));
  });

  it("allows only the selected status transitions", () => {
    expect(isAllowedStatusTransition("received", "in_progress")).toBe(true);
    expect(isAllowedStatusTransition("in_progress", "fixed")).toBe(true);
    expect(isAllowedStatusTransition("fixed", "in_progress")).toBe(true);
    expect(isAllowedStatusTransition("received", "fixed")).toBe(false);
    expect(isAllowedStatusTransition("fixed", "received")).toBe(false);
  });
});
