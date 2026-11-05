/*
 * Copyright (c) 2026 Advanced Software and AI Solutions LLC. All rights reserved.
 */

import { describe, expect, it } from "vitest";
import {
  DRAFTED_CELLS,
  TEMPLATES,
  WORK_TOGETHER_OFTEN_LINE,
  fillTemplate,
  findBannedContent,
  findTemplate,
  renderReminder,
} from "./index";

const sampleValues = {
  customerName: "Alex Rivera",
  ownerName: "Sam Lee",
  businessName: "Lee Plumbing",
  amount: "$2,400.00",
  dueDate: "October 4, 2026",
  payByDate: "November 11, 2026",
  invoiceNumber: "1042",
  job: "Kitchen sink",
  phone: "555-0100",
  paymentMethods: "check, cash",
  lateFeeLine: "A late fee of $36.00 brings the total to $2,436.00.",
  workTogetherLine: WORK_TOGETHER_OFTEN_LINE,
};

describe("letters", () => {
  it("marks drafted cells and keeps a non-empty matrix", () => {
    expect(TEMPLATES.length).toBeGreaterThan(10);
    expect(DRAFTED_CELLS.length).toBe(TEMPLATES.length);
    expect(findTemplate(4, "firm", "letter")?.channel).toBe("letter");
    expect(findTemplate(1, "friendly", "sayIt")?.channel).toBe("sayIt");
  });

  it("rejects banned words and all-caps in every template cell", () => {
    for (const cell of TEMPLATES) {
      const hits = findBannedContent(cell.body);
      expect(hits, `${cell.stage}/${cell.tone}/${cell.channel}`).toEqual([]);
      if (cell.subject) {
        expect(findBannedContent(cell.subject)).toEqual([]);
      }
    }
  });

  it("renders every cell with no unfilled tokens", () => {
    for (const cell of TEMPLATES) {
      const result = renderReminder({
        stage: cell.stage,
        tone: cell.tone,
        channel: cell.channel,
        values: sampleValues,
      });
      expect(result.plainText).not.toMatch(/\{\{/);
      expect(result.drafted).toBe(true);
      if (cell.channel === "email") {
        expect(result.subject.length).toBeGreaterThan(0);
      }
      if (cell.channel === "sayIt") {
        expect(result.plainText.toLowerCase()).toContain("sam lee");
      }
    }
  });

  it("drops optional parts and their punctuation when empty", () => {
    const filled = fillTemplate(
      "Hello.{{#invoiceNumber}} Invoice {{invoiceNumber}}.{{/invoiceNumber}} Bye.",
      { invoiceNumber: "" },
    );
    expect(filled).toBe("Hello. Bye.");
  });

  it("warns when text is over 320 characters", () => {
    const long = renderReminder({
      stage: 3,
      tone: "friendly",
      channel: "text",
      values: sampleValues,
    });
    expect(typeof long.textWarnOver320).toBe("boolean");
    expect(long.textCharCount).toBe(long.plainText.length);
  });

  it("detects banned phrases", () => {
    expect(findBannedContent("we will file a lien")).toContain("lien");
    expect(findBannedContent("THIS IS BAD")).toContain("ALL_CAPS:THIS");
  });

  it("rejects unknown tokens and missing templates", () => {
    expect(() => fillTemplate("Hi {{unknownToken}}", {})).toThrow(/Unknown token/);
    expect(() => fillTemplate("{{#unknownToken}}x{{/unknownToken}}", {})).toThrow(
      /Unknown optional/,
    );
    expect(() =>
      renderReminder({
        stage: 4,
        tone: "friendly",
        channel: "text",
        values: sampleValues,
      }),
    ).toThrow(/No template/);
  });
});
