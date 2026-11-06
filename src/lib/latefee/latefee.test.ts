/*
 * Copyright (c) 2026 Advanced Software and AI Solutions LLC. All rights reserved.
 */

import { describe, expect, it } from "vitest";
import { parseIsoDate } from "../dates";
import { parseMoneyTextToCents } from "../money";
import { LATE_FEE_MODES, computeLateFee, type LateFeeMode } from "./index";

describe("latefee", () => {
  it("lists three modes", () => {
    expect(LATE_FEE_MODES).toEqual(["flatOnce", "percentOnce", "percentPerMonth"]);
  });

  it("golden: 1.5 percent per month for 1 month on 2400.00", () => {
    const result = computeLateFee({
      mode: "percentPerMonth",
      amountCents: parseMoneyTextToCents("2400.00"),
      percent: 1.5,
      dueDate: parseIsoDate("2026-10-04"),
      asOfDate: parseIsoDate("2026-11-04"),
    });
    expect(result.feeCents).toBe(3600);
    expect(result.newTotalCents).toBe(243_600);
    expect(result.formulaLine).toMatch(/1\.5%/);
    expect(result.formulaLine).toMatch(/2400\.00 \+ .*36\.00 = 2436\.00/);
    expect(result.letterLine).toMatch(/\$36\.00/);
    expect(result.letterLine).toMatch(/\$2,436\.00/);
  });

  it("applies flat once and percent once", () => {
    const flat = computeLateFee({
      mode: "flatOnce",
      amountCents: 100_00,
      flatFeeCents: 25_00,
      dueDate: parseIsoDate("2026-10-01"),
      asOfDate: parseIsoDate("2026-10-10"),
    });
    expect(flat.feeCents).toBe(2500);
    expect(flat.formulaLine).toMatch(/100\.00 \+ .*25\.00 = 125\.00/);

    const pct = computeLateFee({
      mode: "percentOnce",
      amountCents: 200_00,
      percent: 10,
      dueDate: parseIsoDate("2026-10-01"),
      asOfDate: parseIsoDate("2026-10-10"),
    });
    expect(pct.feeCents).toBe(2000);
    expect(pct.formulaLine).toMatch(/10%/);
    expect(pct.formulaLine).toMatch(/200\.00 \+ .*20\.00 = 220\.00/);
  });

  it("returns zero fee when not past due or under a month", () => {
    const result = computeLateFee({
      mode: "flatOnce",
      amountCents: 100_00,
      dueDate: parseIsoDate("2026-10-10"),
      asOfDate: parseIsoDate("2026-10-01"),
    });
    expect(result.daysLate).toBe(0);
    expect(result.feeCents).toBe(0);
    expect(result.formulaLine).toMatch(/No late fee/);

    const pctOnceGrace = computeLateFee({
      mode: "percentOnce",
      amountCents: 100_00,
      percent: 10,
      dueDate: parseIsoDate("2026-10-01"),
      asOfDate: parseIsoDate("2026-10-01"),
    });
    expect(pctOnceGrace.feeCents).toBe(0);

    const underMonth = computeLateFee({
      mode: "percentPerMonth",
      amountCents: 100_00,
      percent: 1.5,
      dueDate: parseIsoDate("2026-10-20"),
      asOfDate: parseIsoDate("2026-10-25"),
    });
    expect(underMonth.feeCents).toBe(0);
    expect(underMonth.formulaLine).toMatch(/No late fee/);
  });

  it("honors grace days, maximum, and paid so far", () => {
    const grace = computeLateFee({
      mode: "flatOnce",
      amountCents: 100_00,
      flatFeeCents: 25_00,
      dueDate: parseIsoDate("2026-10-01"),
      asOfDate: parseIsoDate("2026-10-03"),
      graceDays: 5,
    });
    expect(grace.feeCents).toBe(0);
    expect(grace.letterLine).toBe("");

    const capped = computeLateFee({
      mode: "percentOnce",
      amountCents: 10_000_00,
      percent: 10,
      dueDate: parseIsoDate("2026-10-01"),
      asOfDate: parseIsoDate("2026-10-20"),
      maximumCents: 50_00,
    });
    expect(capped.feeCents).toBe(5000);

    const paid = computeLateFee({
      mode: "flatOnce",
      amountCents: 100_00,
      flatFeeCents: 40_00,
      dueDate: parseIsoDate("2026-10-01"),
      asOfDate: parseIsoDate("2026-10-20"),
      paidSoFarCents: 15_00,
    });
    expect(paid.feeCents).toBe(2500);
  });

  it("rejects invalid engine inputs", () => {
    expect(() =>
      computeLateFee({
        mode: "flatOnce",
        amountCents: -1,
        dueDate: parseIsoDate("2026-10-01"),
        asOfDate: parseIsoDate("2026-10-10"),
      }),
    ).toThrow(/amountCents/);

    expect(() =>
      computeLateFee({
        mode: "flatOnce",
        amountCents: 100,
        flatFeeCents: -1,
        dueDate: parseIsoDate("2026-10-01"),
        asOfDate: parseIsoDate("2026-10-10"),
      }),
    ).toThrow(/flatFeeCents/);

    expect(() =>
      computeLateFee({
        mode: "percentOnce",
        amountCents: 100,
        dueDate: parseIsoDate("2026-10-01"),
        asOfDate: parseIsoDate("2026-10-10"),
      }),
    ).toThrow(/percent is required/);

    expect(() =>
      computeLateFee({
        mode: "percentPerMonth",
        amountCents: 100,
        dueDate: parseIsoDate("2026-10-01"),
        asOfDate: parseIsoDate("2026-11-01"),
      }),
    ).toThrow(/percent is required/);

    expect(() =>
      computeLateFee({
        mode: "flatOnce",
        amountCents: 100,
        flatFeeCents: 10,
        dueDate: parseIsoDate("2026-10-01"),
        asOfDate: parseIsoDate("2026-10-10"),
        graceDays: -1,
      }),
    ).toThrow(/graceDays/);

    expect(() =>
      computeLateFee({
        mode: "flatOnce",
        amountCents: 100,
        flatFeeCents: 10,
        dueDate: parseIsoDate("2026-10-01"),
        asOfDate: parseIsoDate("2026-10-10"),
        paidSoFarCents: -1,
      }),
    ).toThrow(/paidSoFarCents/);

    expect(() =>
      computeLateFee({
        mode: "flatOnce",
        amountCents: 100,
        flatFeeCents: 10,
        dueDate: parseIsoDate("2026-10-01"),
        asOfDate: parseIsoDate("2026-10-10"),
        maximumCents: -1,
      }),
    ).toThrow(/maximumCents/);

    expect(() =>
      computeLateFee({
        mode: "nope" as LateFeeMode,
        amountCents: 100,
        dueDate: parseIsoDate("2026-10-01"),
        asOfDate: parseIsoDate("2026-10-10"),
      }),
    ).toThrow(/unknown late fee mode/);
  });
});
