/*
 * Copyright (c) 2026 Advanced Software and AI Solutions LLC. All rights reserved.
 */

import { describe, expect, it } from "vitest";
import {
  applyBasisPoints,
  centsToDollarString,
  formatCentsUsd,
  parseMoneyTextToCents,
  percentToBasisPoints,
  roundHalfUp,
} from "./index";

describe("money", () => {
  it("rounds half up once", () => {
    expect(roundHalfUp(1.5)).toBe(2);
    expect(roundHalfUp(1.4)).toBe(1);
    expect(roundHalfUp(-1.5)).toBe(-2);
  });

  it("parses money text to cents without float math", () => {
    expect(parseMoneyTextToCents("2400.00")).toBe(240_000);
    expect(parseMoneyTextToCents("0.5")).toBe(50);
    expect(parseMoneyTextToCents(".99")).toBe(99);
    expect(parseMoneyTextToCents("10")).toBe(1000);
    expect(parseMoneyTextToCents("-1.25")).toBe(-125);
    expect(parseMoneyTextToCents("0")).toBe(0);
  });

  it("rejects bad money text", () => {
    expect(() => parseMoneyTextToCents("1.234")).toThrow(/invalid/);
    expect(() => parseMoneyTextToCents("1.2.3")).toThrow();
    expect(() => parseMoneyTextToCents("abc")).toThrow();
    expect(() => parseMoneyTextToCents("")).toThrow();
    expect(() => parseMoneyTextToCents("-")).toThrow();
    expect(() => parseMoneyTextToCents(".")).toThrow();
    expect(() => parseMoneyTextToCents("-.")).toThrow();
  });

  it("formats cents", () => {
    expect(centsToDollarString(240_000)).toBe("2400.00");
    expect(centsToDollarString(-50)).toBe("-0.50");
    expect(formatCentsUsd(240_000)).toBe("$2,400.00");
    expect(formatCentsUsd(36_00)).toBe("$36.00");
  });

  it("converts percent to basis points and applies with BigInt", () => {
    expect(percentToBasisPoints(1.5)).toBe(150);
    expect(percentToBasisPoints(0)).toBe(0);
    expect(percentToBasisPoints(100)).toBe(10_000);
    expect(applyBasisPoints(240_000, 150)).toBe(3600);
    expect(applyBasisPoints(100, 1)).toBe(0);
    expect(applyBasisPoints(10_000, 1)).toBe(1);
    expect(applyBasisPoints(-10_000, 150)).toBe(-150);
  });

  it("rejects non-finite and out of range", () => {
    expect(() => roundHalfUp(Number.NaN)).toThrow(/non-finite/);
    expect(() => percentToBasisPoints(Number.POSITIVE_INFINITY)).toThrow(/non-finite/);
    expect(() => percentToBasisPoints(101)).toThrow(/out-of-range/);
    expect(() => percentToBasisPoints(-1)).toThrow(/out-of-range/);
    expect(() => centsToDollarString(1.5)).toThrow(/integer/);
    expect(() => centsToDollarString(Number.NaN)).toThrow(/integer/);
    expect(() => formatCentsUsd(1.5)).toThrow(/integer/);
    expect(() => formatCentsUsd(Number.NaN)).toThrow(/integer/);
    expect(() => applyBasisPoints(1.5, 1)).toThrow(/integer/);
    expect(() => applyBasisPoints(1, -1)).toThrow(/negative/);
    expect(() => parseMoneyTextToCents("9007199254740992")).toThrow(/unsafe/);
    expect(() => applyBasisPoints(Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER)).toThrow(
      /overflow/,
    );
  });
});
