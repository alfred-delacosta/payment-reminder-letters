/*
 * Copyright (c) 2026 Advanced Software and AI Solutions LLC. All rights reserved.
 */

import { afterEach, describe, expect, it, vi } from "vitest";
import {
  MAILTO_HIDDEN_OVER,
  buildMailtoUrl,
  canUseWebShare,
  copyText,
  shareText,
} from "./index";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("share", () => {
  it("builds mailto with encoded subject and CRLF body, no recipient", () => {
    const url = buildMailtoUrl("Hello there", "Line 1\nLine 2");
    expect(url).toMatch(/^mailto:\?/);
    expect(url).not.toMatch(/^mailto:[^?]/);
    expect(url).toContain("subject=Hello%20there");
    expect(url).toContain("body=Line%201%0D%0ALine%202");
  });

  it("hides mailto above 1800 characters", () => {
    const body = "a".repeat(MAILTO_HIDDEN_OVER + 1);
    expect(buildMailtoUrl("S", body)).toBeNull();
    expect(buildMailtoUrl("S", "a".repeat(MAILTO_HIDDEN_OVER))).not.toBeNull();
  });

  it("copies via clipboard API when available", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal("navigator", { clipboard: { writeText } });
    const result = await copyText("hello");
    expect(result).toEqual({ ok: true });
    expect(writeText).toHaveBeenCalledWith("hello");
  });

  it("falls back when clipboard write rejects", async () => {
    const writeText = vi.fn().mockRejectedValue(new Error("denied"));
    vi.stubGlobal("navigator", { clipboard: { writeText } });
    const exec = vi.fn().mockReturnValue(true);
    Object.defineProperty(document, "execCommand", {
      configurable: true,
      value: exec,
    });
    const result = await copyText("hello");
    expect(result).toEqual({ ok: true });
  });

  it("falls back to execCommand copy", async () => {
    vi.stubGlobal("navigator", {});
    const exec = vi.fn().mockReturnValue(true);
    Object.defineProperty(document, "execCommand", {
      configurable: true,
      value: exec,
    });
    const result = await copyText("fallback");
    expect(result).toEqual({ ok: true });
    expect(exec).toHaveBeenCalledWith("copy");
  });

  it("reports failure when execCommand fails", async () => {
    vi.stubGlobal("navigator", {});
    Object.defineProperty(document, "execCommand", {
      configurable: true,
      value: () => {
        throw new Error("nope");
      },
    });
    const result = await copyText("fallback");
    expect(result.ok).toBe(false);
  });

  it("detects and uses web share", async () => {
    expect(canUseWebShare()).toBe(false);
    const share = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal("navigator", { share });
    expect(canUseWebShare()).toBe(true);
    expect(await shareText({ title: "T", text: "Body" })).toEqual({ ok: true });
    expect(share).toHaveBeenCalled();
  });

  it("handles missing and failed web share", async () => {
    vi.stubGlobal("navigator", {});
    expect(await shareText({ text: "Body" })).toEqual({
      ok: false,
      reason: "Share is not available on this device.",
    });
    const share = vi.fn().mockRejectedValue(new Error("cancel"));
    vi.stubGlobal("navigator", { share });
    expect(await shareText({ text: "Body" })).toEqual({
      ok: false,
      reason: "Share was cancelled or failed.",
    });
  });
});
