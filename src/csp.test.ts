/*
 * Copyright (c) 2026 Advanced Software and AI Solutions LLC. All rights reserved.
 */

import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function loadCspFromMjs(): string {
  const text = readFileSync(path.join(ROOT, "scripts/csp.mjs"), "utf8");
  const match = text.match(/export const CSP_POLICY =\s*\n?\s*"([^"]+)"/);
  if (!match) throw new Error("CSP_POLICY missing in scripts/csp.mjs");
  return match[1];
}

describe("CSP source", () => {
  it("matches in .htaccess, nginx, and index.html inject wiring from scripts/csp.mjs", () => {
    const CSP_POLICY = loadCspFromMjs();
    expect(CSP_POLICY).toContain("connect-src 'self'");
    expect(CSP_POLICY).not.toContain("pulse");

    const htaccess = readFileSync(path.join(ROOT, "public/.htaccess"), "utf8");
    const nginx = readFileSync(path.join(ROOT, "nginx/default.conf"), "utf8");
    const indexHtml = readFileSync(path.join(ROOT, "index.html"), "utf8");
    const viteConfig = readFileSync(path.join(ROOT, "vite.config.ts"), "utf8");

    expect(htaccess).toContain(`Content-Security-Policy "${CSP_POLICY}"`);
    expect(nginx).toContain(`Content-Security-Policy "${CSP_POLICY}"`);
    expect(indexHtml).toContain('content="__CSP__"');
    expect(viteConfig).toContain("loadCspPolicy");
    expect(viteConfig).toContain("scripts/csp.mjs");
  });
});
