/*
 * Copyright (c) 2026 Advanced Software and AI Solutions LLC. All rights reserved.
 */

export const DETAILS_FILE_NAME = "payment-reminder-details.json";
export const DETAILS_SCHEMA_VERSION = 1;
export const DETAILS_MAX_BYTES = 100 * 1024;

/** DEFAULT (pending Jay) 8 caps. */
export const DETAILS_CAPS = {
  ownerName: 80,
  businessName: 100,
  phone: 30,
  otherMethod: 40,
} as const;

export const PAYMENT_METHODS = [
  "check",
  "cash",
  "card",
  "bankTransfer",
  "paymentApp",
  "other",
] as const;

export type PaymentMethod = (typeof PAYMENT_METHODS)[number];
export type PreferredTone = "friendly" | "firm" | "final";

export type SavedDetails = {
  schemaVersion: typeof DETAILS_SCHEMA_VERSION;
  ownerName: string;
  businessName: string;
  phone: string;
  methods: PaymentMethod[];
  /** Free text when methods includes "other". */
  otherMethod: string;
  preferredTone: PreferredTone;
};

export type LoadDetailsResult =
  | { ok: true; value: SavedDetails }
  | { ok: false; error: string };

const HOSTILE_KEYS = new Set(["__proto__", "constructor", "prototype"]);

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asString(value: unknown, cap: number, field: string): string {
  if (value === undefined || value === null) return "";
  if (typeof value !== "string") {
    throw new Error(`${field} must be text.`);
  }
  if (value.length > cap) {
    throw new Error(`${field} is too long.`);
  }
  return value;
}

function asTone(value: unknown): PreferredTone {
  if (value === undefined || value === null || value === "") return "friendly";
  if (value === "friendly" || value === "firm" || value === "final") return value;
  throw new Error("preferredTone must be friendly, firm, or final.");
}

function asMethods(value: unknown): PaymentMethod[] {
  if (value === undefined || value === null) return [];
  if (!Array.isArray(value)) {
    throw new Error("methods must be a list.");
  }
  const out: PaymentMethod[] = [];
  for (const item of value) {
    if (typeof item !== "string") {
      throw new Error("methods must be text values.");
    }
    if (!(PAYMENT_METHODS as readonly string[]).includes(item)) {
      continue; // ignore unknown method strings
    }
    const method = item as PaymentMethod;
    if (!out.includes(method)) out.push(method);
  }
  return out;
}

function rejectHostileKeys(value: unknown, path: string): void {
  if (!isPlainObject(value) && !Array.isArray(value)) return;
  if (Array.isArray(value)) {
    value.forEach((item, i) => rejectHostileKeys(item, `${path}[${i}]`));
    return;
  }
  for (const key of Object.keys(value)) {
    if (HOSTILE_KEYS.has(key)) {
      throw new Error("File contains a disallowed key.");
    }
    rejectHostileKeys(value[key], `${path}.${key}`);
  }
}

/** Build a fresh details object for save. */
export function createDetails(partial: Partial<SavedDetails> = {}): SavedDetails {
  return {
    schemaVersion: DETAILS_SCHEMA_VERSION,
    ownerName: (partial.ownerName ?? "").slice(0, DETAILS_CAPS.ownerName),
    businessName: (partial.businessName ?? "").slice(0, DETAILS_CAPS.businessName),
    phone: (partial.phone ?? "").slice(0, DETAILS_CAPS.phone),
    methods: partial.methods ? [...partial.methods] : [],
    otherMethod: (partial.otherMethod ?? "").slice(0, DETAILS_CAPS.otherMethod),
    preferredTone: partial.preferredTone ?? "friendly",
  };
}

export function serializeDetails(details: SavedDetails): string {
  const fresh = createDetails(details);
  return `${JSON.stringify(fresh, null, 2)}\n`;
}

/**
 * Load details from a file text. Cap 100 KB. JSON.parse only.
 * Known fields copied to a fresh object; extras ignored; hostile keys rejected.
 */
export function loadDetailsFromText(text: string, byteLength = text.length): LoadDetailsResult {
  try {
    if (byteLength > DETAILS_MAX_BYTES) {
      return { ok: false, error: "File is too large." };
    }
    const parsed: unknown = JSON.parse(text);
    if (!isPlainObject(parsed)) {
      return { ok: false, error: "File must be a JSON object." };
    }
    rejectHostileKeys(parsed, "root");

    if (parsed.schemaVersion !== DETAILS_SCHEMA_VERSION) {
      return { ok: false, error: "Unsupported file version." };
    }

    const value = createDetails({
      ownerName: asString(parsed.ownerName, DETAILS_CAPS.ownerName, "ownerName"),
      businessName: asString(parsed.businessName, DETAILS_CAPS.businessName, "businessName"),
      phone: asString(parsed.phone, DETAILS_CAPS.phone, "phone"),
      methods: asMethods(parsed.methods),
      otherMethod: asString(parsed.otherMethod, DETAILS_CAPS.otherMethod, "otherMethod"),
      preferredTone: asTone(parsed.preferredTone),
    });

    return { ok: true, value };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not read file.";
    return { ok: false, error: message };
  }
}
