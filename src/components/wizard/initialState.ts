/*
 * Copyright (c) 2026 Advanced Software and AI Solutions LLC. All rights reserved.
 */

import { defaultPayByDate, formatIsoDate, localToday } from "../../lib/dates";
import type { WizardState } from "./types";

export function createInitialState(): WizardState {
  const today = localToday();
  return {
    step: "landing",
    stage: 1,
    howLate: null,
    tone: "friendly",
    customerName: "",
    amountText: "",
    dueDateIso: formatIsoDate(today),
    invoiceNumber: "",
    job: "",
    ownerName: "",
    businessName: "",
    phone: "",
    methods: [],
    otherMethod: "",
    filledFromFile: false,
    workTogetherOften: false,
    lateFeeEnabled: false,
    lateFeeMode: "flatOnce",
    lateFeeFlatText: "",
    lateFeePercentText: "",
    includeLateFeeInMessage: false,
    payByDateIso: formatIsoDate(defaultPayByDate(today)),
    resultChannel: "text",
    draftText: "",
    draftSubject: "",
    draftDirty: false,
    toast: null,
    loadError: null,
    announce: "",
  };
}
