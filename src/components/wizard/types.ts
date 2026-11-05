/*
 * Copyright (c) 2026 Advanced Software and AI Solutions LLC. All rights reserved.
 */

import type { LateFeeMode } from "../../lib/latefee";
import type { PaymentMethod, PreferredTone } from "../../lib/detailsFile";
import type { Channel, Stage } from "../../lib/letters";

/** Wizard step ids. Landing is outside the numbered screens. */
export type WizardStep = "landing" | 1 | 2 | 3 | 4 | 5;

export type HowLateChoice = "justDue" | "aboutAWeek" | "twoWeeks" | "aMonth" | "twoMonthsOrMore";

export const FIELD_CAPS = {
  customerName: 80,
  ownerName: 80,
  businessName: 100,
  phone: 30,
  invoiceNumber: 40,
  job: 120,
  otherMethod: 40,
  draft: 5000,
} as const;

/** Max amount in cents: 99,999,999.99 */
export const AMOUNT_MAX_CENTS = 9_999_999_999;

export type WizardState = {
  step: WizardStep;
  stage: Stage;
  howLate: HowLateChoice | null;
  tone: PreferredTone;
  customerName: string;
  amountText: string;
  dueDateIso: string;
  invoiceNumber: string;
  job: string;
  ownerName: string;
  businessName: string;
  phone: string;
  methods: PaymentMethod[];
  otherMethod: string;
  filledFromFile: boolean;
  workTogetherOften: boolean;
  lateFeeEnabled: boolean;
  lateFeeMode: LateFeeMode;
  lateFeeFlatText: string;
  lateFeePercentText: string;
  includeLateFeeInMessage: boolean;
  payByDateIso: string;
  resultChannel: Channel;
  draftText: string;
  draftSubject: string;
  draftDirty: boolean;
  toast: string | null;
  loadError: string | null;
  announce: string;
};

export const HOW_LATE_OPTIONS: Array<{
  id: HowLateChoice;
  label: string;
  daysAgo: 0 | 7 | 14 | 30 | 60;
  stage: Stage;
  tone: PreferredTone;
}> = [
  { id: "justDue", label: "Just due", daysAgo: 0, stage: 1, tone: "friendly" },
  { id: "aboutAWeek", label: "About a week", daysAgo: 7, stage: 2, tone: "friendly" },
  { id: "twoWeeks", label: "2 weeks", daysAgo: 14, stage: 3, tone: "firm" },
  { id: "aMonth", label: "A month", daysAgo: 30, stage: 4, tone: "firm" },
  { id: "twoMonthsOrMore", label: "2 months or more", daysAgo: 60, stage: 5, tone: "final" },
];

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  check: "check",
  cash: "cash",
  card: "card",
  bankTransfer: "bank transfer",
  paymentApp: "payment app",
  other: "other",
};

export const STEP_LABELS: Record<Exclude<WizardStep, "landing">, string> = {
  1: "How late",
  2: "The job",
  3: "You and how to pay",
  4: "Tone",
  5: "Result",
};
