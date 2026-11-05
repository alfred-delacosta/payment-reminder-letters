/*
 * Copyright (c) 2026 Advanced Software and AI Solutions LLC. All rights reserved.
 */

import { describe, expect, it } from "vitest";
import {
  buildReportDocumentTitle,
  chunkRows,
  DEFAULT_ROWS_PER_PAGE,
  formatReportDate,
} from "./paginate";

describe("chunkRows", () => {
  it("chunks 360 rows into 9 pages of 40", () => {
    const rows = Array.from({ length: 360 }, (_, i) => i + 1);
    const chunks = chunkRows(rows, 40);
    expect(chunks).toHaveLength(9);
    expect(chunks.every((c) => c.length === 40)).toBe(true);
    expect(chunks[0][0]).toBe(1);
    expect(chunks[8][39]).toBe(360);
  });

  it("leaves an uneven last page", () => {
    const rows = Array.from({ length: 85 }, (_, i) => i);
    const chunks = chunkRows(rows, 40);
    expect(chunks).toHaveLength(3);
    expect(chunks[0]).toHaveLength(40);
    expect(chunks[1]).toHaveLength(40);
    expect(chunks[2]).toHaveLength(5);
  });

  it("returns empty for empty input", () => {
    expect(chunkRows([], 40)).toEqual([]);
  });

  it("defaults to DEFAULT_ROWS_PER_PAGE", () => {
    expect(DEFAULT_ROWS_PER_PAGE).toBe(40);
    const rows = Array.from({ length: 41 }, (_, i) => i);
    expect(chunkRows(rows)).toHaveLength(2);
  });

  it("rejects rowsPerPage less than 1", () => {
    expect(() => chunkRows([1], 0)).toThrow(/at least 1/);
  });
});

describe("buildReportDocumentTitle", () => {
  it("builds Mortgage Report YYYY-MM-DD from a Date", () => {
    expect(buildReportDocumentTitle(new Date(2026, 10, 3))).toBe("Mortgage Report 2026-11-03");
  });

  it("accepts an ISO date string", () => {
    expect(buildReportDocumentTitle("2026-01-15")).toBe("Mortgage Report 2026-01-15");
  });

  it("formatReportDate pads month and day", () => {
    expect(formatReportDate(new Date(2026, 0, 5))).toBe("2026-01-05");
  });
});
