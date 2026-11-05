/*
 * Copyright (c) 2026 Advanced Software and AI Solutions LLC. All rights reserved.
 */

import { mkdtemp, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { afterEach, describe, expect, it } from "vitest";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const LINT_COPY = path.join(ROOT, "scripts", "lint-copy.mjs");

const tempDirs: string[] = [];

afterEach(async () => {
  while (tempDirs.length > 0) {
    const dir = tempDirs.pop();
    if (dir) await rm(dir, { recursive: true, force: true });
  }
});

describe("lint:copy", () => {
  it("fails on a dash fixture built at test time", async () => {
    const dir = await mkdtemp(path.join(tmpdir(), "pr-lint-copy-"));
    tempDirs.push(dir);

    // Fixture built at test time: includes em (U+2014) and en (U+2013) dashes.
    const fixturePath = path.join(dir, "dash-fixture.md");
    const fixture = ["em dash here: \u2014", "en dash here: \u2013", "ascii hyphen: -"].join("\n");
    await writeFile(fixturePath, fixture, "utf8");

    const result = spawnSync(process.execPath, [LINT_COPY, fixturePath], {
      encoding: "utf8",
      cwd: ROOT,
    });

    expect(result.status).not.toBe(0);
    expect(result.stderr).toMatch(/U\+2014|em/);
    expect(result.stderr).toMatch(/U\+2013|en/);
  });

  it("passes when the fixture has only ASCII hyphens", async () => {
    const dir = await mkdtemp(path.join(tmpdir(), "pr-lint-copy-ok-"));
    tempDirs.push(dir);

    const fixturePath = path.join(dir, "ok-fixture.md");
    await writeFile(fixturePath, "ascii hyphen only: a - b\n", "utf8");

    const result = spawnSync(process.execPath, [LINT_COPY, fixturePath], {
      encoding: "utf8",
      cwd: ROOT,
    });

    expect(result.status).toBe(0);
    expect(result.stdout).toMatch(/lint:copy ok/);
  });
});
