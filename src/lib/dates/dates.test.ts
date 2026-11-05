/*
 * Copyright (c) 2026 Advanced Software and AI Solutions LLC. All rights reserved.
 */

import { describe, expect, it } from "vitest";
import {
  addDays,
  completedMonthsBetween,
  defaultPayByDate,
  dueDatePreset,
  formatIsoDate,
  formatLongUsDate,
  isLeapYear,
  isValidIsoDate,
  localToday,
  parseIsoDate,
  wholeDaysBetween,
} from "./index";

describe("dates", () => {
  it("parses and formats YYYY-MM-DD", () => {
    expect(formatIsoDate(parseIsoDate("2026-11-04"))).toBe("2026-11-04");
    expect(() => parseIsoDate("2026-13-01")).toThrow();
    expect(() => parseIsoDate("11/04/2026")).toThrow();
    expect(() => parseIsoDate("2026-02-30")).toThrow();
  });

  it("validates calendar dates", () => {
    expect(isValidIsoDate({ year: 2026, month: 2, day: 28 })).toBe(true);
    expect(isValidIsoDate({ year: 2024, month: 2, day: 29 })).toBe(true);
    expect(isValidIsoDate({ year: 2026, month: 2, day: 29 })).toBe(false);
    expect(isValidIsoDate({ year: 1899, month: 1, day: 1 })).toBe(false);
    expect(isValidIsoDate({ year: 2201, month: 1, day: 1 })).toBe(false);
    expect(isValidIsoDate({ year: 2026.5, month: 1, day: 1 })).toBe(false);
    expect(isValidIsoDate({ year: 2026, month: 0, day: 1 })).toBe(false);
  });

  it("formats long US dates and rejects invalid format inputs", () => {
    expect(formatLongUsDate(parseIsoDate("2026-11-04"))).toBe("November 4, 2026");
    expect(() => formatIsoDate({ year: 2026, month: 13, day: 1 })).toThrow();
    expect(() => formatLongUsDate({ year: 2026, month: 13, day: 1 })).toThrow();
  });

  it("counts whole UTC days", () => {
    expect(wholeDaysBetween(parseIsoDate("2026-11-01"), parseIsoDate("2026-11-04"))).toBe(3);
    expect(wholeDaysBetween(parseIsoDate("2026-11-04"), parseIsoDate("2026-11-04"))).toBe(0);
    expect(() =>
      wholeDaysBetween({ year: 2026, month: 13, day: 1 }, parseIsoDate("2026-11-04")),
    ).toThrow();
  });

  it("counts completed months with end-of-month handling", () => {
    expect(completedMonthsBetween(parseIsoDate("2026-10-04"), parseIsoDate("2026-11-04"))).toBe(1);
    expect(completedMonthsBetween(parseIsoDate("2026-01-31"), parseIsoDate("2026-02-28"))).toBe(1);
    expect(completedMonthsBetween(parseIsoDate("2026-01-31"), parseIsoDate("2026-02-27"))).toBe(0);
    expect(completedMonthsBetween(parseIsoDate("2026-01-31"), parseIsoDate("2026-03-31"))).toBe(2);
    expect(completedMonthsBetween(parseIsoDate("2026-11-04"), parseIsoDate("2026-11-04"))).toBe(0);
    expect(() =>
      completedMonthsBetween({ year: 2026, month: 13, day: 1 }, parseIsoDate("2026-11-04")),
    ).toThrow();
  });

  it("adds days and builds presets", () => {
    const today = parseIsoDate("2026-11-04");
    expect(formatIsoDate(addDays(today, 7))).toBe("2026-11-11");
    expect(formatIsoDate(defaultPayByDate(today))).toBe("2026-11-11");
    expect(formatIsoDate(dueDatePreset(0, today))).toBe("2026-11-04");
    expect(formatIsoDate(dueDatePreset(7, today))).toBe("2026-10-28");
    expect(formatIsoDate(dueDatePreset(14, today))).toBe("2026-10-21");
    expect(formatIsoDate(dueDatePreset(30, today))).toBe("2026-10-05");
    expect(formatIsoDate(dueDatePreset(60, today))).toBe("2026-09-05");
    expect(() => dueDatePreset(3, today)).toThrow();
    expect(() => addDays(today, 1.5)).toThrow();
    expect(() => addDays({ year: 2026, month: 13, day: 1 }, 1)).toThrow();
  });

  it("reports leap years and local today shape", () => {
    expect(isLeapYear(2024)).toBe(true);
    expect(isLeapYear(1900)).toBe(false);
    expect(isLeapYear(2000)).toBe(true);
    expect(isLeapYear(2026)).toBe(false);
    const t = localToday(new Date(2026, 10, 4));
    expect(t).toEqual({ year: 2026, month: 11, day: 4 });
  });

  it("returns 0 days for out-of-range month numbers", async () => {
    const { daysInMonth } = await import("./index");
    expect(daysInMonth(2026, 0)).toBe(0);
    expect(daysInMonth(2026, 13)).toBe(0);
  });
});
