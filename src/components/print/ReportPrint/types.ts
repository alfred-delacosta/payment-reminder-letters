/*
 * Copyright (c) 2026 Advanced Software and AI Solutions LLC. All rights reserved.
 */

/** Label/value pair for the cover summary or a key-value section. */
export type ReportPair = {
  label: string;
  value: string;
};

/** A body section: table, key-value list, or paragraphs. Strings arrive formatted. */
export type ReportSection = {
  heading: string;
  kind: "table" | "keyValue" | "paragraphs";
  columns?: string[];
  rows?: string[][];
  pairs?: ReportPair[];
  paragraphs?: string[];
};

/** Chart image already rendered to a PNG data URL (or same-origin asset). */
export type ReportChart = {
  src: string;
  alt: string;
  caption: string;
  summary: string;
  width: number;
  height: number;
};

/** Yearly summary table shown in the body (before the monthly appendix). */
export type ReportYearlySchedule = {
  caption: string;
  columns: string[];
  rows: string[][];
};

/** Full monthly schedule; rows are chunked by rowsPerPage for pagination. */
export type ReportSchedule = {
  caption: string;
  columns: string[];
  rows: string[][];
  /** Rows per printed page chunk. Default 40. */
  rowsPerPage?: number;
};

export type ReportFooter = {
  companyName: string;
  website: string;
  logoSrc: string;
  logoAlt: string;
  creditLine: string;
};

export type ScheduleDetail = "yearly" | "monthly" | "both";

/**
 * Props for the reusable ReportPrint component.
 * All display strings must be pre-formatted by the host app.
 */
export type ReportPrintProps = {
  title: string;
  subtitle?: string;
  generatedOn: string;
  brandLockupSrc: string;
  brandLockupAlt: string;
  summary: ReportPair[];
  sections: ReportSection[];
  charts: ReportChart[];
  /** Default "both". */
  scheduleDetail?: ScheduleDetail;
  yearlySchedule?: ReportYearlySchedule;
  schedule?: ReportSchedule;
  assumptions: string[];
  disclaimer: string;
  footer: ReportFooter;
};
