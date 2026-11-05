/*
 * Copyright (c) 2026 Advanced Software and AI Solutions LLC. All rights reserved.
 */

import {
  defaultPayByDate,
  formatIsoDate,
  formatLongUsDate,
  localToday,
  parseIsoDate,
  wholeDaysBetween,
} from "../../lib/dates";
import {
  DETAILS_FILE_NAME,
  PAYMENT_METHODS,
  createDetails,
  serializeDetails,
  type PaymentMethod,
  type SavedDetails,
} from "../../lib/detailsFile";
import { computeLateFee, type LateFeeMode } from "../../lib/latefee";
import {
  WORK_TOGETHER_OFTEN_LINE,
  findTemplate,
  renderReminder,
  type Channel,
  type Stage,
  type TokenValues,
} from "../../lib/letters";
import { formatCentsUsd, parseMoneyTextToCents } from "../../lib/money";
import {
  AMOUNT_MAX_CENTS,
  FIELD_CAPS,
  PAYMENT_METHOD_LABELS,
  type WizardState,
} from "./types";

export function channelsForStage(stage: Stage): Channel[] {
  const channels: Channel[] = [];
  if (findTemplate(stage, "friendly", "text")) channels.push("text");
  if (findTemplate(stage, "friendly", "email")) channels.push("email");
  if (findTemplate(stage, "friendly", "letter")) channels.push("letter");
  channels.push("sayIt");
  return channels;
}

export function defaultChannelForStage(stage: Stage): Channel {
  const available = channelsForStage(stage);
  return available[0] ?? "sayIt";
}

export function previewChannelForStage(stage: Stage): Channel {
  const available = channelsForStage(stage).filter((c) => c !== "sayIt");
  return available[0] ?? "sayIt";
}

export function formatPaymentMethods(
  methods: PaymentMethod[],
  otherMethod: string,
): string {
  const parts: string[] = [];
  for (const method of methods) {
    if (method === "other") {
      const other = otherMethod.trim();
      if (other) parts.push(other);
    } else {
      parts.push(PAYMENT_METHOD_LABELS[method]);
    }
  }
  return parts.join(", ");
}

export function parseAmountCents(amountText: string): number | null {
  try {
    const cents = parseMoneyTextToCents(amountText);
    if (cents < 0 || cents > AMOUNT_MAX_CENTS) return null;
    return cents;
  } catch {
    return null;
  }
}

export function buildTokenValues(state: WizardState): TokenValues {
  const amountCents = parseAmountCents(state.amountText);
  const due = parseIsoDate(state.dueDateIso || formatIsoDate(localToday()));
  const payBy = parseIsoDate(state.payByDateIso || formatIsoDate(defaultPayByDate()));

  let lateFeeLine = "";
  if (state.lateFeeEnabled && amountCents !== null && state.includeLateFeeInMessage) {
    const result = computeLateFeeFromState(state, amountCents);
    lateFeeLine = result.letterLine;
  }

  return {
    customerName: state.customerName.trim(),
    ownerName: state.ownerName.trim(),
    businessName: state.businessName.trim(),
    amount: amountCents !== null ? formatCentsUsd(amountCents) : state.amountText.trim(),
    dueDate: formatLongUsDate(due),
    payByDate: formatLongUsDate(payBy),
    invoiceNumber: state.invoiceNumber.trim(),
    job: state.job.trim(),
    phone: state.phone.trim(),
    paymentMethods: formatPaymentMethods(state.methods, state.otherMethod),
    lateFeeLine,
    workTogetherLine: state.workTogetherOften ? WORK_TOGETHER_OFTEN_LINE : "",
  };
}

export function computeLateFeeFromState(state: WizardState, amountCents: number) {
  const due = parseIsoDate(state.dueDateIso || formatIsoDate(localToday()));
  const asOf = localToday();
  const mode: LateFeeMode = state.lateFeeMode;
  const input = {
    mode,
    amountCents,
    dueDate: due,
    asOfDate: asOf,
    flatFeeCents:
      mode === "flatOnce" ? (parseAmountCents(state.lateFeeFlatText) ?? 0) : undefined,
    percent:
      mode === "percentOnce" || mode === "percentPerMonth"
        ? Number.parseFloat(state.lateFeePercentText || "0")
        : undefined,
  };
  return computeLateFee(input);
}

export function daysLateLabel(state: WizardState): number {
  try {
    const due = parseIsoDate(state.dueDateIso);
    return Math.max(0, wholeDaysBetween(due, localToday()));
  } catch {
    return 0;
  }
}

export function renderFromState(
  state: WizardState,
  channel: Channel = state.resultChannel,
) {
  return renderReminder({
    stage: state.stage,
    tone: state.tone,
    channel,
    values: buildTokenValues(state),
  });
}

export function detailsFromState(state: WizardState): SavedDetails {
  return createDetails({
    ownerName: state.ownerName.slice(0, FIELD_CAPS.ownerName),
    businessName: state.businessName.slice(0, FIELD_CAPS.businessName),
    phone: state.phone.slice(0, FIELD_CAPS.phone),
    methods: state.methods.filter((m) => (PAYMENT_METHODS as readonly string[]).includes(m)),
    otherMethod: state.otherMethod.slice(0, FIELD_CAPS.otherMethod),
    preferredTone: state.tone,
  });
}

export function downloadDetails(state: WizardState): void {
  const text = serializeDetails(detailsFromState(state));
  const blob = new Blob([text], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = DETAILS_FILE_NAME;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function applySavedDetails(
  state: WizardState,
  details: SavedDetails,
): WizardState {
  return {
    ...state,
    ownerName: details.ownerName,
    businessName: details.businessName,
    phone: details.phone,
    methods: [...details.methods],
    otherMethod: details.otherMethod,
    tone: details.preferredTone,
    filledFromFile: true,
    loadError: null,
    announce: "Details loaded from your file.",
  };
}
