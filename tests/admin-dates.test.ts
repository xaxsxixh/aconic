import { describe, expect, it } from "vitest";
import {
  formatIstDateTime,
  formatIstLongDate,
  formatIstTime,
  getIstReportDateDistribution,
  parseTimestamp,
} from "../lib/dates/ist";

describe("administrator Indian Standard Time dates", () => {
  it("formats UTC timestamps as the correct Indian date and time", () => {
    const timestamp = "2026-01-01T20:00:00Z";
    expect(formatIstDateTime(timestamp)).toBe("02 Jan 2026, 1:30 AM IST");
    expect(formatIstLongDate(timestamp)).toBe("Friday, 2 January 2026");
    expect(formatIstTime(timestamp)).toBe("1:30 AM IST");
  });

  it("returns safe fallbacks for missing, invalid, or timezone-less values", () => {
    expect(parseTimestamp("not-a-timestamp")).toBeNull();
    expect(parseTimestamp("2026-01-01T10:00:00")).toBeNull();
    expect(formatIstDateTime(undefined)).toBe("Date unavailable");
    expect(formatIstTime("invalid")).toBe("Time unavailable");
  });

  it("groups date ranges by Indian calendar day rather than elapsed UTC hours", () => {
    expect(getIstReportDateDistribution([
      "2026-01-01T18:29:00Z",
      "2026-01-01T18:31:00Z",
      "2025-12-09T18:31:00Z",
      "2025-12-08T18:31:00Z",
      "invalid",
    ], "2026-01-07T18:31:00Z")).toEqual([
      { label: "Last 7 days", count: 1 },
      { label: "8–30 days", count: 2 },
      { label: "Earlier", count: 1 },
    ]);
  });
});
