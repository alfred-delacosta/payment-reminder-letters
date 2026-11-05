/*
 * Copyright (c) 2026 Advanced Software and AI Solutions LLC. All rights reserved.
 *
 * DEFAULT (pending Jay) 10: CTA shape only. Nothing renders in Phase 1 PR 1.
 */

export const CTA_HOME_URL = "https://advancedsoftwareandaisolutions.com/";
export const CTA_CONTACT_URL = "https://advancedsoftwareandaisolutions.com/contact/";

export const UTM_SOURCE = "payment-reminder";
export const UTM_MEDIUM = "cta";

/** data-pulse-cta on results contact (Phase 2). */
export const CTA_PULSE_RESULTS_CONTACT = "pr-results-contact";
/** data-pulse-cta on footer contact (Phase 2). */
export const CTA_PULSE_FOOTER_CONTACT = "pr-footer-contact";

/** Pulse site id for Phase 2. */
export const PULSE_SITE = "pr";

export type CtaTarget = "contact" | "home";
export type CtaPlacement = "result-card" | "footer";

export function ctaUrl(target: CtaTarget, placement: CtaPlacement): string {
  const url = new URL(target === "contact" ? CTA_CONTACT_URL : CTA_HOME_URL);
  url.searchParams.set("utm_source", UTM_SOURCE);
  url.searchParams.set("utm_medium", UTM_MEDIUM);
  url.searchParams.set("utm_content", placement);
  // No utm_campaign (DEFAULT pending Jay 10).
  return url.toString();
}
