/*
 * Copyright (c) 2026 Advanced Software and AI Solutions LLC. All rights reserved.
 */

/**
 * Fails if any scanned text file contains U+2014 (em dash) or U+2013 (en dash).
 * Windows-friendly: pure Node, no bash.
 */

import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const EM_DASH = "\u2014";
const EN_DASH = "\u2013";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const SKIP_DIRS = new Set([
  ".git",
  "node_modules",
  "dist",
  "coverage",
  ".vite",
]);

const TEXT_EXT = new Set([
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
  ".mjs",
  ".cjs",
  ".json",
  ".md",
  ".html",
  ".css",
  ".yml",
  ".yaml",
  ".svg",
  ".txt",
]);

/**
 * @param {string} dir
 * @returns {Promise<string[]>}
 */
async function walk(dir) {
  /** @type {string[]} */
  const out = [];
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) continue;
      out.push(...(await walk(full)));
      continue;
    }
    if (!entry.isFile()) continue;
    const ext = path.extname(entry.name).toLowerCase();
    if (!TEXT_EXT.has(ext) && entry.name !== "Dockerfile") continue;
    out.push(full);
  }
  return out;
}

/**
 * @param {string} filePath
 * @param {string} text
 * @returns {{ line: number, col: number, kind: string }[]}
 */
function findDashes(filePath, text) {
  /** @type {{ line: number, col: number, kind: string }[]} */
  const hits = [];
  const lines = text.split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    for (let j = 0; j < line.length; j++) {
      const ch = line[j];
      if (ch === EM_DASH) hits.push({ line: i + 1, col: j + 1, kind: "em (U+2014)" });
      if (ch === EN_DASH) hits.push({ line: i + 1, col: j + 1, kind: "en (U+2013)" });
    }
  }
  void filePath;
  return hits;
}

async function main() {
  const args = process.argv.slice(2);
  const targets = args.length > 0 ? args : [ROOT];

  /** @type {string[]} */
  const files = [];
  for (const target of targets) {
    const resolved = path.resolve(target);
    const info = await stat(resolved);
    if (info.isDirectory()) {
      files.push(...(await walk(resolved)));
    } else {
      files.push(resolved);
    }
  }

  let failed = false;
  for (const file of files) {
    const text = await readFile(file, "utf8");
    const hits = findDashes(file, text);
    if (hits.length === 0) continue;
    failed = true;
    const rel = path.relative(ROOT, file) || file;
    for (const hit of hits) {
      console.error(`${rel}:${hit.line}:${hit.col}: forbidden ${hit.kind} dash`);
    }
  }

  if (failed) {
    console.error("lint:copy failed: remove em/en dashes (use ASCII hyphen-minus).");
    process.exit(1);
  }

  console.log(`lint:copy ok (${files.length} file(s) scanned)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
