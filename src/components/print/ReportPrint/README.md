<!--
  Copyright (c) 2026 Advanced Software and AI Solutions LLC. All rights reserved.
-->

# ReportPrint

Reusable, self-contained print report for US Letter (8.5 x 11 in) and browser Save as PDF. Copy this folder into another project as an example.

## What it does

Renders a print-only report into `document.body` via a React portal. On screen it is hidden (`display: none`, `aria-hidden`, `inert`). Under `@media print` the host app root is hidden and this report is shown: cover summary, sections, chart PNGs, yearly table, monthly appendix with repeating headers, assumptions, disclaimer, and a company credit block.

## Props API

All display strings must be pre-formatted by the host. See `types.ts`.

```tsx
import { ReportPrint } from "./ReportPrint";

<ReportPrint
  title="Mortgage Report"
  subtitle="30-year fixed example"
  generatedOn="11-03-2026"
  brandLockupSrc="/brand/header-lockup-light.svg"
  brandLockupAlt="Mortgage Calculator"
  summary={[
    { label: "Loan amount", value: "$300,000.00" },
    { label: "Rate", value: "6.5%" },
  ]}
  sections={[
    {
      heading: "Loan inputs",
      kind: "keyValue",
      pairs: [{ label: "Term", value: "30 years" }],
    },
  ]}
  charts={[
    {
      src: "data:image/png;base64,...",
      alt: "Balance over time",
      caption: "Balance over time",
      summary: "Balance declines from $300,000.00 to $0.00.",
      width: 1600,
      height: 800,
    },
  ]}
  scheduleDetail="both"
  yearlySchedule={{
    caption: "Yearly amortization",
    columns: ["Year", "Payments", "Principal", "Interest", "Balance"],
    rows: [["2026", "12", "$4,000.00", "$19,000.00", "$296,000.00"]],
  }}
  schedule={{
    caption: "Monthly amortization",
    columns: ["#", "Date", "Payment", "Principal", "Interest", "Extra", "Balance"],
    rows: [["1", "02-15-2026", "$1,896.20", "$271.20", "$1,625.00", "$0.00", "$299,728.80"]],
    rowsPerPage: 40,
  }}
  assumptions={["First payment is one month after the start date."]}
  disclaimer="Figures are estimates for education only, not financial advice."
  footer={{
    companyName: "Advanced Software and AI Solutions LLC",
    website: "https://advancedsoftwareandaisolutions.com/",
    logoSrc: "/brand/asais-mark.svg",
    logoAlt: "Advanced Software and AI Solutions LLC",
    creditLine: "Created with Mortgage Calculator",
  }}
/>
```

## How to reuse

1. Copy `src/components/print/ReportPrint/` into the other project.
2. Import `ReportPrint` and `reportPrint.css` (imported by the component).
3. Map your domain data to `ReportPrintProps` in the host (this repo uses `src/components/report/buildMortgageReport.ts`).
4. Under print CSS, hide your app root (`#root` in this project) so only `.rp-root` prints.
5. Trigger `window.print()` after chart images are ready.

Dependencies inside this folder: React and ReactDOM (`createPortal`) only. No MUI, no loan math, no app config.

## Chart PNGs

Host code should:

1. Create a detached canvas (~1600 x 800, `devicePixelRatio` 2).
2. Render Chart.js with a fixed light palette, white background plugin, animation off, and dashed series for grayscale.
3. Call `chart.toBase64Image("image/png")` and destroy the chart.
4. Pass data URLs into `charts[].src`. Never use blob URLs if CSP is `img-src 'self' data:`.

## CSP and base path

- Images: same-origin SVGs and `data:` PNG URLs. Blob URLs are blocked by this app CSP.
- Brand lockup and company mark paths must include the Vite base (`import.meta.env.BASE_URL`), e.g. `/mortgagecalculator/brand/asais-mark.svg`.

## Company logo source

`public/brand/asais-mark.svg` in the Mortgage Calculator repo is copied unchanged from Advanced Software and AI Solutions LLC site repo `public/brand/mark.svg` (64 x 64, one ink color, about 1 KB). Skip `wordmark-light.svg` (it draws a gray background rect).

## Pagination

`paginate.ts` exports `chunkRows(rows, rowsPerPage)` (default 40). Each chunk is its own table with `<thead>` so column headers repeat in every browser. Rows use `break-inside: avoid`.

## Page numbers

- Preferred: `@page` `@bottom-right` margin box (`Page N of M`). Support varies; Chromium often ignores margin boxes.
- Fallback: fixed `.rp-running-footer` with company name and title. Bottom page margin reserves space so content does not overlap.

## Browser print limits

- Layout is Letter only (`@page size: letter; margin: 0.65in`).
- Browser print engines differ on margin boxes, blank trailing pages, and background graphics.
- iPhone Safari: use Share, then Print (or Save PDF). Installed PWAs may no-op `window.print()`; show a Share hint.
- PDF file name comes from `document.title` during print (host sets `Mortgage Report YYYY-MM-DD` and restores after).
