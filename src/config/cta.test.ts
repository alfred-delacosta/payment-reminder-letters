/*
 * Copyright (c) 2026 Advanced Software and AI Solutions LLC. All rights reserved.
 */

import { describe, expect, it } from "vitest";
import {
  CTA_PULSE_FOOTER_CONTACT,
  CTA_PULSE_RESULTS_CONTACT,
  PULSE_SITE,
  UTM_MEDIUM,
  UTM_SOURCE,
  ctaUrl,
} from "./cta";

describe("cta config", () => {
  it("builds contact URLs with required UTM tags and no campaign", () => {
    const url = new URL(ctaUrl("contact", "result-card"));
    expect(url.searchParams.get("utm_source")).toBe(UTM_SOURCE);
    expect(url.searchParams.get("utm_medium")).toBe(UTM_MEDIUM);
    expect(url.searchParams.get("utm_content")).toBe("result-card");
    expect(url.searchParams.get("utm_campaign")).toBeNull();
    expect(url.pathname).toMatch(/contact/);
  });

  it("never carries form values in the URL", () => {
    const url = ctaUrl("contact", "footer");
    expect(url).not.toMatch(/customer|amount|invoice|phone|owner/i);
    expect(CTA_PULSE_RESULTS_CONTACT).toBe("pr-results-contact");
    expect(CTA_PULSE_FOOTER_CONTACT).toBe("pr-footer-contact");
    expect(PULSE_SITE).toBe("pr");
  });
});
