/*
 * Copyright (c) 2026 Advanced Software and AI Solutions LLC. All rights reserved.
 */

/** Calendar date as YYYY-MM-DD parts. Avoid Date for day math except local today. */
export type IsoDate = {
  year: number;
  /** Calendar month 1-12 */
  month: number;
  /** Day of month 1-31 */
  day: number;
};

const DAYS_IN_MONTH = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

export function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

export function daysInMonth(year: number, month: number): number {
  if (month === 2) return isLeapYear(year) ? 29 : 28;
  return DAYS_IN_MONTH[month] ?? 0;
}

export function isValidIsoDate(date: IsoDate): boolean {
  const { year, month, day } = date;
  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) {
    return false;
  }
  if (year < 1900 || year > 2200) return false;
  if (month < 1 || month > 12) return false;
  if (day < 1 || day > daysInMonth(year, month)) return false;
  return true;
}

/** Parse YYYY-MM-DD. */
export function parseIsoDate(text: string): IsoDate {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(text.trim());
  if (!match) {
    throw new Error("parseIsoDate expects YYYY-MM-DD");
  }
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = { year, month, day };
  if (!isValidIsoDate(date)) {
    throw new Error("parseIsoDate rejects invalid calendar date");
  }
  return date;
}

export function formatIsoDate(date: IsoDate): string {
  if (!isValidIsoDate(date)) {
    throw new Error("formatIsoDate rejects invalid date");
  }
  const m = String(date.month).padStart(2, "0");
  const d = String(date.day).padStart(2, "0");
  return `${date.year}-${m}-${d}`;
}

/** Long US form for copy, e.g. November 4, 2026. DEFAULT (pending Jay) 9. */
export function formatLongUsDate(date: IsoDate): string {
  if (!isValidIsoDate(date)) {
    throw new Error("formatLongUsDate rejects invalid date");
  }
  const utc = new Date(Date.UTC(date.year, date.month - 1, date.day));
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "UTC",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(utc);
}

/** Local calendar today (device timezone). */
export function localToday(now = new Date()): IsoDate {
  return {
    year: now.getFullYear(),
    month: now.getMonth() + 1,
    day: now.getDate(),
  };
}

function toUtcDayNumber(date: IsoDate): number {
  return Date.UTC(date.year, date.month - 1, date.day) / 86_400_000;
}

/** Whole day count between two dates in UTC calendar days (end - start). */
export function wholeDaysBetween(start: IsoDate, end: IsoDate): number {
  if (!isValidIsoDate(start) || !isValidIsoDate(end)) {
    throw new Error("wholeDaysBetween rejects invalid dates");
  }
  return toUtcDayNumber(end) - toUtcDayNumber(start);
}

/**
 * Completed whole months from start to end with end-of-month handling.
 * Jan 31 to Feb 28 = 0 completed months; Jan 31 to Mar 31 = 2.
 * A month completes when end reaches the same day-of-month or the last day
 * of a shorter month after crossing that month boundary.
 */
export function completedMonthsBetween(start: IsoDate, end: IsoDate): number {
  if (!isValidIsoDate(start) || !isValidIsoDate(end)) {
    throw new Error("completedMonthsBetween rejects invalid dates");
  }
  if (wholeDaysBetween(start, end) <= 0) return 0;

  let months =
    (end.year - start.year) * 12 + (end.month - start.month);

  // If end day is before the anniversary day (clamped to month length), the
  // current month is not yet complete.
  const anchorDay = start.day;
  const endMonthLen = daysInMonth(end.year, end.month);
  const requiredDay = Math.min(anchorDay, endMonthLen);
  if (end.day < requiredDay) {
    months -= 1;
  }

  return Math.max(0, months);
}

/** Add whole days in UTC calendar space. */
export function addDays(date: IsoDate, days: number): IsoDate {
  if (!isValidIsoDate(date) || !Number.isInteger(days)) {
    throw new Error("addDays requires a valid date and integer days");
  }
  const utc = new Date(Date.UTC(date.year, date.month - 1, date.day + days));
  return {
    year: utc.getUTCFullYear(),
    month: utc.getUTCMonth() + 1,
    day: utc.getUTCDate(),
  };
}

/** DEFAULT (pending Jay) 4: due date presets relative to today. */
export const DUE_DATE_PRESET_DAYS_AGO = [0, 7, 14, 30, 60] as const;

export function dueDatePreset(daysAgo: number, today = localToday()): IsoDate {
  if (!DUE_DATE_PRESET_DAYS_AGO.includes(daysAgo as (typeof DUE_DATE_PRESET_DAYS_AGO)[number])) {
    throw new Error("dueDatePreset rejects unknown preset");
  }
  return addDays(today, -daysAgo);
}

/** Pay-by date default: today plus 7. */
export function defaultPayByDate(today = localToday()): IsoDate {
  return addDays(today, 7);
}
