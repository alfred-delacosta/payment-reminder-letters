/*
 * Copyright (c) 2026 Advanced Software and AI Solutions LLC. All rights reserved.
 */

/** Integer cents. Never use floating dollars in fee math. */
export type Cents = number;

/** Basis points: 100 bp = 1 percent. */
export type BasisPoints = number;

/** Round half up once to the nearest integer. */
export function roundHalfUp(value: number): number {
  if (!Number.isFinite(value)) {
    throw new Error("roundHalfUp rejects non-finite values");
  }
  return Math.sign(value) * Math.floor(Math.abs(value) + 0.5);
}

/**
 * Parse money text to integer cents without a float parser.
 * Allows an optional leading minus, digits, at most one ".", and at most 2 decimals.
 */
export function parseMoneyTextToCents(text: string): Cents {
  const raw = text.trim();
  if (raw === "" || raw === "-" || raw === "." || raw === "-.") {
    throw new Error("parseMoneyTextToCents rejects empty money text");
  }
  if (!/^-?\d+(\.\d{0,2})?$/.test(raw) && !/^-?\.\d{1,2}$/.test(raw)) {
    throw new Error("parseMoneyTextToCents rejects invalid money text");
  }

  const negative = raw.startsWith("-");
  const unsigned = negative ? raw.slice(1) : raw;
  const [wholePart = "0", fracPart = ""] = unsigned.split(".");
  const whole = wholePart === "" ? "0" : wholePart;
  const frac = (fracPart + "00").slice(0, 2);
  const cents = Number.parseInt(whole, 10) * 100 + Number.parseInt(frac, 10);
  if (!Number.isSafeInteger(cents)) {
    throw new Error("parseMoneyTextToCents rejects unsafe integer cents");
  }
  return negative ? -cents : cents;
}

/** Format integer cents as a fixed 2-decimal dollar string (no currency symbol). */
export function centsToDollarString(cents: Cents): string {
  if (!Number.isFinite(cents) || !Number.isInteger(cents)) {
    throw new Error("centsToDollarString requires finite integer cents");
  }
  const sign = cents < 0 ? "-" : "";
  const abs = Math.abs(cents);
  const whole = Math.floor(abs / 100);
  const frac = String(abs % 100).padStart(2, "0");
  return `${sign}${whole}.${frac}`;
}

const usdFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

/** Format integer cents with Intl en-US USD. */
export function formatCentsUsd(cents: Cents): string {
  if (!Number.isFinite(cents) || !Number.isInteger(cents)) {
    throw new Error("formatCentsUsd requires finite integer cents");
  }
  return usdFormatter.format(cents / 100);
}

/** Convert a percent (e.g. 1.5) to basis points (150). */
export function percentToBasisPoints(percent: number): BasisPoints {
  if (!Number.isFinite(percent)) {
    throw new Error("percentToBasisPoints rejects non-finite values");
  }
  if (percent < 0 || percent > 100) {
    throw new Error("percentToBasisPoints rejects out-of-range percent");
  }
  return roundHalfUp(percent * 100);
}

/**
 * Multiply cents by basis points using BigInt, then round half up once.
 * fee = roundHalfUp(cents * bp / 10000)
 */
export function applyBasisPoints(cents: Cents, basisPoints: BasisPoints): Cents {
  if (!Number.isInteger(cents) || !Number.isInteger(basisPoints)) {
    throw new Error("applyBasisPoints requires integer cents and basis points");
  }
  if (basisPoints < 0) {
    throw new Error("applyBasisPoints rejects negative basis points");
  }
  const product = BigInt(cents) * BigInt(basisPoints);
  const denom = 10_000n;
  const half = denom / 2n;
  const negative = product < 0n;
  const abs = negative ? -product : product;
  const rounded = (abs + half) / denom;
  const asNumber = Number(rounded);
  if (!Number.isSafeInteger(asNumber)) {
    throw new Error("applyBasisPoints overflow");
  }
  return negative ? -asNumber : asNumber;
}
