/*
 * Copyright (c) 2026 Advanced Software and AI Solutions LLC. All rights reserved.
 */

import {
  completedMonthsBetween,
  wholeDaysBetween,
  type IsoDate,
} from "../dates";
import {
  applyBasisPoints,
  centsToDollarString,
  formatCentsUsd,
  percentToBasisPoints,
  type Cents,
} from "../money";

/** Three late fee modes as a list. */
export const LATE_FEE_MODES = ["flatOnce", "percentOnce", "percentPerMonth"] as const;
export type LateFeeMode = (typeof LATE_FEE_MODES)[number];

export type LateFeeInput = {
  mode: LateFeeMode;
  /** Invoice / amount owed in integer cents. */
  amountCents: Cents;
  /** Flat fee in cents when mode is flatOnce. */
  flatFeeCents?: Cents;
  /** Percent rate (e.g. 1.5) when mode is percentOnce or percentPerMonth. */
  percent?: number;
  dueDate: IsoDate;
  asOfDate: IsoDate;
  /** Engine-only: days after due before fees start. */
  graceDays?: number;
  /** Engine-only: maximum fee in cents. */
  maximumCents?: Cents;
  /** Engine-only: fee already paid in cents. */
  paidSoFarCents?: Cents;
};

export type LateFeeResult = {
  daysLate: number;
  feeCents: Cents;
  newTotalCents: Cents;
  formulaLine: string;
  letterLine: string;
};

function rawFeeCents(input: LateFeeInput, billableDays: number, months: number): Cents {
  switch (input.mode) {
    case "flatOnce": {
      const flat = input.flatFeeCents ?? 0;
      if (!Number.isInteger(flat) || flat < 0) {
        throw new Error("flatFeeCents must be a non-negative integer");
      }
      return billableDays > 0 ? flat : 0;
    }
    case "percentOnce": {
      if (input.percent === undefined) {
        throw new Error("percent is required for percentOnce");
      }
      if (billableDays <= 0) return 0;
      return applyBasisPoints(input.amountCents, percentToBasisPoints(input.percent));
    }
    case "percentPerMonth": {
      if (input.percent === undefined) {
        throw new Error("percent is required for percentPerMonth");
      }
      if (months <= 0) return 0;
      const perMonth = applyBasisPoints(input.amountCents, percentToBasisPoints(input.percent));
      return perMonth * months;
    }
    default: {
      const _exhaustive: never = input.mode;
      void _exhaustive;
      throw new Error("unknown late fee mode");
    }
  }
}

function buildFormula(
  input: LateFeeInput,
  feeCents: Cents,
  newTotalCents: Cents,
  months: number,
  billableDays: number,
): string {
  const amount = centsToDollarString(input.amountCents);
  const fee = centsToDollarString(feeCents);
  const total = centsToDollarString(newTotalCents);
  if (billableDays <= 0 || feeCents === 0) {
    return `No late fee yet (within grace or not past due). Amount owed ${amount}.`;
  }
  switch (input.mode) {
    case "flatOnce":
      return `Amount ${amount} + late fee ${fee} = ${total}.`;
    case "percentOnce":
      return `${input.percent}% of ${amount} = late fee ${fee}; ${amount} + ${fee} = ${total}.`;
    case "percentPerMonth":
      return `${input.percent}% of ${amount} x ${months} month(s) = late fee ${fee}; ${amount} + ${fee} = ${total}.`;
  }
}

/**
 * Compute late fee. Grace days, maximum, and paid so far are engine-only
 * (not shown as suggested rates in the UI).
 */
export function computeLateFee(input: LateFeeInput): LateFeeResult {
  if (!Number.isInteger(input.amountCents) || input.amountCents < 0) {
    throw new Error("amountCents must be a non-negative integer");
  }
  const graceDays = input.graceDays ?? 0;
  const paidSoFar = input.paidSoFarCents ?? 0;
  if (!Number.isInteger(graceDays) || graceDays < 0) {
    throw new Error("graceDays must be a non-negative integer");
  }
  if (!Number.isInteger(paidSoFar) || paidSoFar < 0) {
    throw new Error("paidSoFarCents must be a non-negative integer");
  }

  const daysLate = Math.max(0, wholeDaysBetween(input.dueDate, input.asOfDate));
  const billableDays = Math.max(0, daysLate - graceDays);
  const months = billableDays > 0 ? completedMonthsBetween(input.dueDate, input.asOfDate) : 0;

  let fee = rawFeeCents(input, billableDays, months);

  if (input.maximumCents !== undefined) {
    if (!Number.isInteger(input.maximumCents) || input.maximumCents < 0) {
      throw new Error("maximumCents must be a non-negative integer");
    }
    fee = Math.min(fee, input.maximumCents);
  }

  fee = Math.max(0, fee - paidSoFar);

  const newTotal = input.amountCents + fee;
  const formulaLine = buildFormula(input, fee, newTotal, months, billableDays);
  const letterLine =
    fee > 0
      ? `A late fee of ${formatCentsUsd(fee)} brings the total to ${formatCentsUsd(newTotal)}.`
      : "";

  return {
    daysLate,
    feeCents: fee,
    newTotalCents: newTotal,
    formulaLine,
    letterLine,
  };
}
