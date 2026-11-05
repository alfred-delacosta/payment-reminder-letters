/*
 * Copyright (c) 2026 Advanced Software and AI Solutions LLC. All rights reserved.
 */

/** Default monthly rows per printed table chunk (Letter at 9pt). */
export const DEFAULT_ROWS_PER_PAGE = 40;

/**
 * Split rows into fixed-size chunks. Empty input yields an empty array.
 * The last chunk may be shorter than rowsPerPage.
 */
export function chunkRows<T>(rows: readonly T[], rowsPerPage: number = DEFAULT_ROWS_PER_PAGE): T[][] {
  if (rowsPerPage < 1) {
    throw new Error("rowsPerPage must be at least 1");
  }
  if (rows.length === 0) return [];
  const chunks: T[][] = [];
  for (let i = 0; i < rows.length; i += rowsPerPage) {
    chunks.push(rows.slice(i, i + rowsPerPage) as T[]);
  }
  return chunks;
}

/** Format a Date (or ISO date string YYYY-MM-DD) as YYYY-MM-DD for titles. */
export function formatReportDate(date: Date | string = new Date()): string {
  if (typeof date === "string") {
    const trimmed = date.trim();
    if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) {
      return trimmed.slice(0, 10);
    }
    const parsed = new Date(trimmed);
    if (!Number.isNaN(parsed.getTime())) {
      return formatReportDate(parsed);
    }
    return trimmed.slice(0, 10);
  }
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * Build the document.title / suggested PDF file name stem:
 * "Mortgage Report YYYY-MM-DD"
 */
export function buildReportDocumentTitle(date: Date | string = new Date()): string {
  return `Mortgage Report ${formatReportDate(date)}`;
}
