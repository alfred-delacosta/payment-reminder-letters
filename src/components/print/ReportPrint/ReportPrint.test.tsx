/*
 * Copyright (c) 2026 Advanced Software and AI Solutions LLC. All rights reserved.
 */

import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ReportPrintDocument } from "./ReportPrint";
import type { ReportPrintProps } from "./types";

const sampleProps: ReportPrintProps = {
  title: "Mortgage Report",
  subtitle: "Sample loan",
  generatedOn: "11-03-2026",
  brandLockupSrc: "/mortgagecalculator/brand/header-lockup-light.svg",
  brandLockupAlt: "Mortgage Calculator",
  summary: [
    { label: "Loan amount", value: "$300,000.00" },
    { label: "Rate", value: "6.5%" },
  ],
  sections: [
    {
      heading: "Loan inputs",
      kind: "keyValue",
      pairs: [
        { label: "Term", value: "30 years" },
        { label: "Start date", value: "01-15-2026" },
      ],
    },
    {
      heading: "Monthly payment breakdown",
      kind: "keyValue",
      pairs: [
        { label: "Principal and interest", value: "$1,896.20" },
        { label: "Housing total", value: "$1,896.20" },
      ],
    },
  ],
  charts: [
    {
      src: "data:image/png;base64,aaa",
      alt: "Balance over time line chart",
      caption: "Balance over time",
      summary: "Balance declines from $300,000.00 to $0.00 over 360 payments.",
      width: 1600,
      height: 800,
    },
  ],
  scheduleDetail: "both",
  yearlySchedule: {
    caption: "Yearly amortization",
    columns: ["Year", "Payments", "Principal", "Interest", "Extra", "Balance"],
    rows: [["2026", "11", "$3,000.00", "$17,000.00", "$0.00", "$297,000.00"]],
  },
  schedule: {
    caption: "Monthly amortization",
    columns: ["#", "Date", "Payment", "Principal", "Interest", "Extra", "Balance"],
    rows: Array.from({ length: 45 }, (_, i) => [
      String(i + 1),
      "02-15-2026",
      "$1,896.20",
      "$271.20",
      "$1,625.00",
      "$0.00",
      "$299,728.80",
    ]),
    rowsPerPage: 40,
  },
  assumptions: [
    "First payment is one month after the start date.",
    "Estimates only. Not financial advice.",
  ],
  disclaimer:
    "Figures are estimates for education only, not financial advice. Actual loan terms, taxes, insurance and fees vary. Talk to a licensed lender or advisor.",
  footer: {
    companyName: "Advanced Software and AI Solutions LLC",
    website: "https://advancedsoftwareandaisolutions.com/",
    logoSrc: "/mortgagecalculator/brand/asais-mark.svg",
    logoAlt: "Advanced Software and AI Solutions LLC",
    creditLine: "Created with Mortgage Calculator",
  },
};

function hasEmOrEnDash(text: string): boolean {
  return /[\u2013\u2014]/.test(text);
}

describe("ReportPrint structure", () => {
  it("renders cover, sections, thead per chunk, chart alt, footer, disclaimer", () => {
    const html = renderToStaticMarkup(<ReportPrintDocument {...sampleProps} />);

    expect(html).toContain('class="rp-root"');
    expect(html).toContain("Mortgage Report");
    expect(html).toContain("Sample loan");
    expect(html).toContain("Loan inputs");
    expect(html).toContain("Monthly payment breakdown");
    expect(html).toContain("Yearly summary");
    expect(html).toContain("Monthly amortization");

    // Two chunks for 45 rows at 40 per page => two tables with thead
    const theadCount = (html.match(/<thead>/g) ?? []).length;
    expect(theadCount).toBeGreaterThanOrEqual(2);

    expect(html).toContain('alt="Balance over time line chart"');
    expect(html).toContain("data:image/png;base64,aaa");
    expect(html).toContain("Advanced Software and AI Solutions LLC");
    expect(html).toContain("https://advancedsoftwareandaisolutions.com/");
    expect(html).toContain("/mortgagecalculator/brand/asais-mark.svg");
    expect(html).toContain("Created with Mortgage Calculator");
    expect(html).toContain(sampleProps.disclaimer);
    expect(html).toContain("Estimates only. Not financial advice.");

    expect(hasEmOrEnDash(html)).toBe(false);
  });

  it("snapshots the structure (not pixels)", () => {
    const html = renderToStaticMarkup(<ReportPrintDocument {...sampleProps} />);
    expect(html).toMatchSnapshot();
  });
});
