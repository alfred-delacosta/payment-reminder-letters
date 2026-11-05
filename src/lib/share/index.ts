/*
 * Copyright (c) 2026 Advanced Software and AI Solutions LLC. All rights reserved.
 */

const MAILTO_BODY_LIMIT = 1800;

export type CopyResult = { ok: true } | { ok: false; reason: string };

/** Copy text to the clipboard, with a selected-text execCommand fallback. */
export async function copyText(text: string): Promise<CopyResult> {
  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return { ok: true };
    } catch {
      // fall through to selection fallback
    }
  }
  return copyTextViaSelection(text);
}

function copyTextViaSelection(text: string): CopyResult {
  if (typeof document === "undefined") {
    return { ok: false, reason: "Clipboard is not available." };
  }
  const ta = document.createElement("textarea");
  ta.value = text;
  ta.setAttribute("readonly", "");
  ta.style.position = "fixed";
  ta.style.left = "-9999px";
  document.body.appendChild(ta);
  ta.select();
  let ok = false;
  try {
    ok = document.execCommand("copy");
  } catch {
    ok = false;
  }
  document.body.removeChild(ta);
  return ok ? { ok: true } : { ok: false, reason: "Could not copy. Select the text and copy it." };
}

/**
 * Build a mailto URL with encoded subject and body (CRLF).
 * No recipient. Returns null when the body is hidden above 1,800 characters.
 */
export function buildMailtoUrl(subject: string, body: string): string | null {
  if (body.length > MAILTO_BODY_LIMIT) {
    return null;
  }
  const crlfBody = body.replace(/\r?\n/g, "\r\n");
  const params = new URLSearchParams();
  params.set("subject", subject);
  params.set("body", crlfBody);
  // URLSearchParams uses + for spaces; mailto prefers %20.
  const query = params.toString().replace(/\+/g, "%20");
  return `mailto:?${query}`;
}

export function canUseWebShare(): boolean {
  return typeof navigator !== "undefined" && typeof navigator.share === "function";
}

export async function shareText(args: {
  title?: string;
  text: string;
}): Promise<CopyResult> {
  if (!canUseWebShare()) {
    return { ok: false, reason: "Share is not available on this device." };
  }
  try {
    await navigator.share({ title: args.title, text: args.text });
    return { ok: true };
  } catch {
    return { ok: false, reason: "Share was cancelled or failed." };
  }
}

export const MAILTO_HIDDEN_OVER = MAILTO_BODY_LIMIT;
