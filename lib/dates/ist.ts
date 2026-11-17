export type TimestampInput = string | number | Date | null | undefined;
export type ReportDateDistribution = { label: string; count: number };

const IST_TIME_ZONE = "Asia/Kolkata";
const IST_DATE_TIME = new Intl.DateTimeFormat("en-IN", {
  timeZone: IST_TIME_ZONE,
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
  timeZoneName: "short",
});
const IST_LONG_DATE = new Intl.DateTimeFormat("en-IN", {
  timeZone: IST_TIME_ZONE,
  weekday: "long",
  month: "long",
  day: "numeric",
  year: "numeric",
});
const IST_TIME = new Intl.DateTimeFormat("en-IN", {
  timeZone: IST_TIME_ZONE,
  hour: "numeric",
  minute: "2-digit",
  timeZoneName: "short",
});
const IST_DATE_KEY = new Intl.DateTimeFormat("en-CA", {
  timeZone: IST_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});
const DAY_MS = 24 * 60 * 60 * 1000;

export function parseTimestamp(value: TimestampInput): number | null {
  if (value instanceof Date) {
    const time = value.getTime();
    return Number.isFinite(time) ? time : null;
  }
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value !== "string" || !/(?:z|[+-]\d{2}(?::?\d{2})?)$/i.test(value)) return null;
  const time = Date.parse(value);
  return Number.isFinite(time) ? time : null;
}

export function compareTimestamps(
  first: TimestampInput,
  second: TimestampInput,
  order: "newest" | "oldest" = "oldest",
): number {
  const firstTime = parseTimestamp(first);
  const secondTime = parseTimestamp(second);
  if (firstTime === null) return secondTime === null ? 0 : 1;
  if (secondTime === null) return -1;
  return order === "newest" ? secondTime - firstTime : firstTime - secondTime;
}

function getIstDateKey(value: TimestampInput): string | null {
  const time = parseTimestamp(value);
  if (time === null) return null;
  const parts = IST_DATE_KEY.formatToParts(new Date(time));
  const values = Object.fromEntries(parts.map(({ type, value: part }) => [type, part]));
  return values.year && values.month && values.day
    ? `${values.year}-${values.month}-${values.day}`
    : null;
}

function dateKeyDayNumber(key: string): number {
  const [year, month, day] = key.split("-").map(Number);
  return Math.floor(Date.UTC(year, month - 1, day) / DAY_MS);
}

export function formatIstDateTime(value: TimestampInput): string {
  const time = parseTimestamp(value);
  return time === null ? "Date unavailable" : IST_DATE_TIME.format(new Date(time));
}

export function formatIstLongDate(value: TimestampInput): string {
  const time = parseTimestamp(value);
  return time === null ? "Date unavailable" : IST_LONG_DATE.format(new Date(time));
}

export function formatIstTime(value: TimestampInput): string {
  const time = parseTimestamp(value);
  return time === null ? "Time unavailable" : IST_TIME.format(new Date(time));
}

export function getIstReportDateDistribution(
  timestamps: readonly TimestampInput[],
  reference: TimestampInput,
): ReportDateDistribution[] {
  const todayKey = getIstDateKey(reference);
  if (!todayKey) return [];

  const today = dateKeyDayNumber(todayKey);
  const counts = [0, 0, 0];
  for (const timestamp of timestamps) {
    const key = getIstDateKey(timestamp);
    if (!key) continue;
    const ageInCalendarDays = today - dateKeyDayNumber(key);
    if (ageInCalendarDays >= 0 && ageInCalendarDays < 7) counts[0] += 1;
    else if (ageInCalendarDays >= 7 && ageInCalendarDays < 30) counts[1] += 1;
    else if (ageInCalendarDays >= 30) counts[2] += 1;
  }
  return [
    { label: "Last 7 days", count: counts[0] },
    { label: "8–30 days", count: counts[1] },
    { label: "Earlier", count: counts[2] },
  ];
}
