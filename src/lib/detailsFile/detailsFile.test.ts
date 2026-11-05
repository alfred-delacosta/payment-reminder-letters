/*
 * Copyright (c) 2026 Advanced Software and AI Solutions LLC. All rights reserved.
 */

import { describe, expect, it } from "vitest";
import {
  DETAILS_FILE_NAME,
  DETAILS_MAX_BYTES,
  createDetails,
  loadDetailsFromText,
  serializeDetails,
} from "./index";

describe("detailsFile", () => {
  it("uses the expected file name and schema", () => {
    expect(DETAILS_FILE_NAME).toBe("payment-reminder-details.json");
    const details = createDetails({
      ownerName: "Sam",
      methods: ["check", "cash"],
      preferredTone: "firm",
    });
    expect(details.schemaVersion).toBe(1);
    const loaded = loadDetailsFromText(serializeDetails(details));
    expect(loaded.ok).toBe(true);
    if (loaded.ok) {
      expect(loaded.value.ownerName).toBe("Sam");
      expect(loaded.value.preferredTone).toBe("firm");
    }
  });

  it("ignores extras and unknown methods", () => {
    const text = JSON.stringify({
      schemaVersion: 1,
      ownerName: "Sam",
      businessName: "Biz",
      phone: "555",
      methods: ["check", "venmo", "cash"],
      preferredTone: "friendly",
      extraField: "nope",
    });
    const loaded = loadDetailsFromText(text);
    expect(loaded.ok).toBe(true);
    if (loaded.ok) {
      expect(loaded.value.methods).toEqual(["check", "cash"]);
      expect(loaded.value).not.toHaveProperty("extraField");
    }
  });

  it("accepts empty optional fields and default tone", () => {
    const text = JSON.stringify({ schemaVersion: 1 });
    const loaded = loadDetailsFromText(text);
    expect(loaded.ok).toBe(true);
    if (loaded.ok) {
      expect(loaded.value.ownerName).toBe("");
      expect(loaded.value.preferredTone).toBe("friendly");
      expect(loaded.value.methods).toEqual([]);
    }

    const blank = createDetails();
    expect(blank.methods).toEqual([]);
    expect(blank.preferredTone).toBe("friendly");

    const dup = loadDetailsFromText(
      JSON.stringify({
        schemaVersion: 1,
        methods: ["check", "check", "card"],
        preferredTone: "final",
      }),
    );
    expect(dup.ok).toBe(true);
    if (dup.ok) {
      expect(dup.value.methods).toEqual(["check", "card"]);
      expect(dup.value.preferredTone).toBe("final");
    }
  });

  it("rejects oversize, hostile keys, bad types, and bad version", () => {
    expect(loadDetailsFromText("{}", DETAILS_MAX_BYTES + 1).ok).toBe(false);
    expect(loadDetailsFromText("[]").ok).toBe(false);
    expect(loadDetailsFromText("not-json").ok).toBe(false);

    const hostile = '{"schemaVersion":1,"__proto__":{"x":1},"ownerName":"A"}';
    expect(loadDetailsFromText(hostile).ok).toBe(false);

    const ctor = '{"schemaVersion":1,"constructor":{},"ownerName":"A"}';
    expect(loadDetailsFromText(ctor).ok).toBe(false);

    const proto = '{"schemaVersion":1,"prototype":{},"ownerName":"A"}';
    expect(loadDetailsFromText(proto).ok).toBe(false);

    const nested = '{"schemaVersion":1,"ownerName":"A","nested":{"__proto__":{"x":1}}}';
    expect(loadDetailsFromText(nested).ok).toBe(false);

    const hostileInArray = '{"schemaVersion":1,"methods":[{"__proto__":1}]}';
    expect(loadDetailsFromText(hostileInArray).ok).toBe(false);

    const badType = JSON.stringify({ schemaVersion: 1, ownerName: 12 });
    expect(loadDetailsFromText(badType).ok).toBe(false);

    const badTone = JSON.stringify({ schemaVersion: 1, preferredTone: "loud" });
    expect(loadDetailsFromText(badTone).ok).toBe(false);

    const badMethods = JSON.stringify({ schemaVersion: 1, methods: "check" });
    expect(loadDetailsFromText(badMethods).ok).toBe(false);

    const badMethodItem = JSON.stringify({ schemaVersion: 1, methods: [1] });
    expect(loadDetailsFromText(badMethodItem).ok).toBe(false);

    const badVer = JSON.stringify({ schemaVersion: 99, ownerName: "A" });
    expect(loadDetailsFromText(badVer).ok).toBe(false);

    const tooLong = JSON.stringify({
      schemaVersion: 1,
      ownerName: "x".repeat(81),
    });
    expect(loadDetailsFromText(tooLong).ok).toBe(false);
  });
});
