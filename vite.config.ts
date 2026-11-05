/*
 * Copyright (c) 2026 Advanced Software and AI Solutions LLC. All rights reserved.
 */

import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadEnv, type Plugin } from "vite";
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

const rootDir = path.dirname(fileURLToPath(import.meta.url));

/** Load CSP_POLICY from scripts/csp.mjs (single source). */
function loadCspPolicy(): string {
  const text = readFileSync(path.join(rootDir, "scripts/csp.mjs"), "utf8");
  const match = text.match(/export const CSP_POLICY =\s*\n?\s*"([^"]+)"/);
  if (!match) {
    throw new Error("Could not read CSP_POLICY from scripts/csp.mjs");
  }
  return match[1];
}

/**
 * Normalize a base path to a leading and trailing slash.
 * VITE_BASE_PATH=/ runs at the site root as "/".
 * DEFAULT (pending Jay) 1: default /paymentreminders/ for every mode.
 */
function normalizeBasePath(raw: string | undefined): string {
  const trimmed = (raw ?? "/paymentreminders/").trim();
  if (trimmed === "" || trimmed === "/") {
    return "/";
  }
  const withLeading = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  return withLeading.endsWith("/") ? withLeading : `${withLeading}/`;
}

function resolveSiteUrl(envValue: string | undefined, base: string): string {
  const fallback =
    base === "/"
      ? "https://advancedsoftwareandaisolutions.com"
      : `https://advancedsoftwareandaisolutions.com${base.replace(/\/+$/, "")}`;
  return (envValue?.trim() || fallback).replace(/\/+$/, "");
}

/** Replaces __SITE_URL__ and __CSP__ in index.html. */
function htmlInjectPlugin(siteUrl: string, csp: string): Plugin {
  return {
    name: "html-inject",
    transformIndexHtml: {
      order: "pre",
      handler: (html) =>
        html.replaceAll("__SITE_URL__", siteUrl).replaceAll("__CSP__", csp),
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const base = normalizeBasePath(env.VITE_BASE_PATH || process.env.VITE_BASE_PATH);
  const siteUrl = resolveSiteUrl(env.SITE_URL || process.env.SITE_URL, base);
  const csp = loadCspPolicy();

  return {
    base,
    plugins: [react(), htmlInjectPlugin(siteUrl, csp)],
    test: {
      environment: "jsdom",
      globals: true,
      setupFiles: ["./src/test/setup.ts"],
      coverage: {
        provider: "v8",
        include: ["src/lib/**/*.ts"],
        exclude: ["src/lib/**/*.test.ts", "src/lib/cspPolicy.ts"],
        thresholds: {
          lines: 95,
          functions: 95,
          branches: 95,
          statements: 95,
        },
        reporter: ["text", "json-summary"],
      },
    },
  };
});
