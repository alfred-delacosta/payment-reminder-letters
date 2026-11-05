/*
 * Copyright (c) 2026 Advanced Software and AI Solutions LLC. All rights reserved.
 */

/** Whitelist of replaceable tokens in templates. */
export const TOKEN_WHITELIST = [
  "customerName",
  "ownerName",
  "businessName",
  "amount",
  "dueDate",
  "payByDate",
  "invoiceNumber",
  "job",
  "phone",
  "paymentMethods",
  "lateFeeLine",
  "workTogetherLine",
] as const;

export type TokenName = (typeof TOKEN_WHITELIST)[number];

export type TokenValues = Partial<Record<TokenName, string>>;

export const BANNED_PHRASES = [
  "lien",
  "lawsuit",
  "court",
  "collections",
  "credit report",
  "legal action",
  "final notice",
] as const;

/** Fail if text contains a banned phrase or an all-caps word (2+ letters). */
export function findBannedContent(text: string): string[] {
  const hits: string[] = [];
  const lower = text.toLowerCase();
  for (const phrase of BANNED_PHRASES) {
    if (lower.includes(phrase)) hits.push(phrase);
  }
  for (const word of text.split(/\s+/)) {
    const cleaned = word.replace(/[^A-Za-z]/g, "");
    if (cleaned.length >= 2 && cleaned === cleaned.toUpperCase() && /[A-Z]/.test(cleaned)) {
      hits.push(`ALL_CAPS:${cleaned}`);
    }
  }
  return hits;
}
