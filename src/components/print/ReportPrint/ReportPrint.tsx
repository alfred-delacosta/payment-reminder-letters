/*
 * Copyright (c) 2026 Advanced Software and AI Solutions LLC. All rights reserved.
 *
 * Reusable print-only report. Imports only React and files in this folder.
 */

import { createPortal } from "react-dom";
import { chunkRows, DEFAULT_ROWS_PER_PAGE } from "./paginate";
import type {
  ReportChart,
  ReportPair,
  ReportPrintProps,
  ReportSchedule,
  ReportSection,
  ReportYearlySchedule,
} from "./types";
import "./reportPrint.css";

function SummaryList({ pairs }: { pairs: ReportPair[] }) {
  if (pairs.length === 0) return null;
  return (
    <ul className="rp-summary">
      {pairs.map((pair) => (
        <li key={pair.label} className="rp-summary-item">
          <span className="rp-summary-label">{pair.label}</span>
          <span className="rp-summary-value">{pair.value}</span>
        </li>
      ))}
    </ul>
  );
}

function KeyValueList({ pairs }: { pairs: ReportPair[] }) {
  return (
    <ul className="rp-kv">
      {pairs.map((pair) => (
        <li key={pair.label} className="rp-kv-row">
          <span className="rp-kv-label">{pair.label}</span>
          <span className="rp-kv-value">{pair.value}</span>
        </li>
      ))}
    </ul>
  );
}

function looksNumeric(value: string): boolean {
  const t = value.trim();
  if (!t) return false;
  return /^[$€£]?\s*-?[\d,.]+%?$/.test(t) || /^\d+$/.test(t);
}

function DataTable({
  caption,
  columns,
  rows,
  className,
}: {
  caption: string;
  columns: string[];
  rows: string[][];
  className?: string;
}) {
  return (
    <div className={className ? `rp-table-wrap ${className}` : "rp-table-wrap"}>
      <table className="rp-table">
        <caption>{caption}</caption>
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col} scope="col">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((cell, cellIndex) => (
                <td key={cellIndex} className={looksNumeric(cell) ? "rp-num" : undefined}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SectionBlock({ section }: { section: ReportSection }) {
  return (
    <section className="rp-section">
      <h2 className="rp-section-heading">{section.heading}</h2>
      {section.kind === "keyValue" && section.pairs ? (
        <KeyValueList pairs={section.pairs} />
      ) : null}
      {section.kind === "table" && section.columns && section.rows ? (
        <DataTable caption={section.heading} columns={section.columns} rows={section.rows} />
      ) : null}
      {section.kind === "paragraphs" && section.paragraphs ? (
        <div className="rp-paragraphs">
          {section.paragraphs.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      ) : null}
    </section>
  );
}

function ChartFigures({ charts }: { charts: ReportChart[] }) {
  if (charts.length === 0) return null;
  return (
    <section className="rp-section">
      <h2 className="rp-section-heading">Charts</h2>
      {charts.map((chart) => (
        <figure key={chart.caption} className="rp-figure">
          <img
            src={chart.src}
            alt={chart.alt}
            width={chart.width}
            height={chart.height}
          />
          <figcaption className="rp-figcaption">{chart.caption}</figcaption>
          <p className="rp-chart-summary">{chart.summary}</p>
        </figure>
      ))}
    </section>
  );
}

function YearlyBlock({ yearly }: { yearly: ReportYearlySchedule }) {
  return (
    <section className="rp-section">
      <h2 className="rp-section-heading">Yearly summary</h2>
      <DataTable caption={yearly.caption} columns={yearly.columns} rows={yearly.rows} />
    </section>
  );
}

function MonthlyAppendix({ schedule }: { schedule: ReportSchedule }) {
  const perPage = schedule.rowsPerPage ?? DEFAULT_ROWS_PER_PAGE;
  const chunks = chunkRows(schedule.rows, perPage);
  if (chunks.length === 0) return null;

  return (
    <section className="rp-appendix" aria-label="Monthly amortization appendix">
      <h2 className="rp-section-heading">Monthly amortization</h2>
      {chunks.map((chunk, index) => {
        const start = index * perPage + 1;
        const end = index * perPage + chunk.length;
        const caption =
          chunks.length === 1
            ? schedule.caption
            : `${schedule.caption} (rows ${start}-${end})`;
        return (
          <DataTable
            key={index}
            className="rp-chunk"
            caption={caption}
            columns={schedule.columns}
            rows={chunk}
          />
        );
      })}
    </section>
  );
}

/**
 * Pure report markup (no portal). Useful for tests and static markup.
 */
export function ReportPrintDocument(props: ReportPrintProps) {
  const detail = props.scheduleDetail ?? "both";
  const showYearly =
    (detail === "yearly" || detail === "both") && Boolean(props.yearlySchedule);
  const showMonthly =
    (detail === "monthly" || detail === "both") && Boolean(props.schedule);

  return (
    <div className="rp-root" aria-hidden="true" inert>
      <div className="rp-running-footer" aria-hidden="true">
        <div className="rp-running-footer-inner">
          {props.footer.companyName} - {props.title}
        </div>
      </div>

      <header className="rp-cover">
        <img
          className="rp-brand-lockup"
          src={props.brandLockupSrc}
          alt={props.brandLockupAlt}
        />
        <h1 className="rp-title">{props.title}</h1>
        {props.subtitle ? <p className="rp-subtitle">{props.subtitle}</p> : null}
        <p className="rp-generated">Generated {props.generatedOn}</p>
        <SummaryList pairs={props.summary} />
      </header>

      {props.sections.map((section) => (
        <SectionBlock key={section.heading} section={section} />
      ))}

      <ChartFigures charts={props.charts} />

      {showYearly && props.yearlySchedule ? (
        <YearlyBlock yearly={props.yearlySchedule} />
      ) : null}

      {showMonthly && props.schedule ? <MonthlyAppendix schedule={props.schedule} /> : null}

      <section className="rp-assumptions">
        <h2 className="rp-section-heading">Assumptions</h2>
        <ul>
          {props.assumptions.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <aside className="rp-disclaimer" role="note">
        <h2 className="rp-h3">Disclaimer</h2>
        <p>{props.disclaimer}</p>
      </aside>

      <footer className="rp-credit">
        <img
          className="rp-credit-logo"
          src={props.footer.logoSrc}
          alt={props.footer.logoAlt}
        />
        <div>
          <p className="rp-credit-text">
            {props.footer.companyName}
            <br />
            <a href={props.footer.website}>{props.footer.website}</a>
            <span className="rp-credit-line">{props.footer.creditLine}</span>
          </p>
        </div>
      </footer>
    </div>
  );
}

/**
 * Print-only report rendered into document.body via a portal.
 * Hidden on screen; shown under @media print (see reportPrint.css).
 */
export function ReportPrint(props: ReportPrintProps) {
  const tree = <ReportPrintDocument {...props} />;
  if (typeof document === "undefined") {
    return tree;
  }
  return createPortal(tree, document.body);
}
