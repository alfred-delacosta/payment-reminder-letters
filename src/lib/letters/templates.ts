/*
 * Copyright (c) 2026 Advanced Software and AI Solutions LLC. All rights reserved.
 *
 * Template data keyed by stage x tone x channel.
 * All cells are drafted pending Product Owner workflow section 4 wording
 * (DEFAULT pending Jay 3). Listed in DRAFTED_CELLS for PO and Legal review.
 */

export type Stage = 1 | 2 | 3 | 4 | 5;
export type Tone = "friendly" | "firm" | "final";
export type Channel = "text" | "email" | "letter" | "sayIt";

export type TemplateCell = {
  stage: Stage;
  tone: Tone;
  channel: Channel;
  /** Plain ASCII body with {{token}} and optional {{#token}}...{{/token}} parts. */
  body: string;
  /** Email subject when channel is email. */
  subject?: string;
  /** True when wording is not yet from the Product Owner workflow. */
  drafted: boolean;
};

const STAGES: Stage[] = [1, 2, 3, 4, 5];
const TONES: Tone[] = ["friendly", "firm", "final"];

function emailSubject(_stage: Stage, tone: Tone): string {
  if (tone === "friendly") return `Quick note about your invoice{{#invoiceNumber}} {{invoiceNumber}}{{/invoiceNumber}}`;
  if (tone === "firm") return `Payment reminder{{#invoiceNumber}} for invoice {{invoiceNumber}}{{/invoiceNumber}}`;
  return `Past due balance{{#invoiceNumber}} on invoice {{invoiceNumber}}{{/invoiceNumber}}`;
}

function textBody(stage: Stage, tone: Tone): string {
  const late = "{{#lateFeeLine}} {{lateFeeLine}}{{/lateFeeLine}}";
  const inv = "{{#invoiceNumber}} Invoice {{invoiceNumber}}.{{/invoiceNumber}}";
  const job = "{{#job}} Job: {{job}}.{{/job}}";
  const pay = "{{#paymentMethods}} You can pay by {{paymentMethods}}.{{/paymentMethods}}";
  const work =
    stage === 3
      ? "{{#workTogetherLine}} {{workTogetherLine}}{{/workTogetherLine}}"
      : "";

  if (tone === "friendly") {
    return `Hi {{customerName}}, just a friendly reminder that {{amount}} was due on {{dueDate}}.${inv}${job} Please pay by {{payByDate}}.${pay}${work}${late} Thanks, {{ownerName}}{{#businessName}} at {{businessName}}{{/businessName}}{{#phone}}, {{phone}}{{/phone}}.`;
  }
  if (tone === "firm") {
    return `Hi {{customerName}}, this is a reminder that {{amount}} was due on {{dueDate}} and is still open.${inv}${job} Please send payment by {{payByDate}}.${pay}${work}${late} - {{ownerName}}{{#businessName}}, {{businessName}}{{/businessName}}{{#phone}}, {{phone}}{{/phone}}.`;
  }
  return `{{customerName}}, your balance of {{amount}} was due on {{dueDate}} and needs attention now.${inv}${job} Please pay by {{payByDate}}.${pay}${work}${late} {{ownerName}}{{#businessName}}, {{businessName}}{{/businessName}}{{#phone}}, {{phone}}{{/phone}}.`;
}

function emailBody(stage: Stage, tone: Tone): string {
  // Stages 1-5 email; stage 4 also has letter. Reuse text style with a greeting line.
  return `Hello {{customerName}},\n\n${textBody(stage, tone)}\n\nThank you.`;
}

/** All letters use the stage 4 layout (DEFAULT pending Jay 3). */
function letterBody(tone: Tone): string {
  const late = "{{#lateFeeLine}}\n{{lateFeeLine}}\n{{/lateFeeLine}}";
  const inv = "{{#invoiceNumber}}Invoice: {{invoiceNumber}}\n{{/invoiceNumber}}";
  const job = "{{#job}}Job: {{job}}\n{{/job}}";
  const pay = "{{#paymentMethods}}Payment methods: {{paymentMethods}}\n{{/paymentMethods}}";
  const phone = "{{#phone}}Phone: {{phone}}\n{{/phone}}";

  const opening =
    tone === "friendly"
      ? "I hope you are well. I am writing about the open balance below."
      : tone === "firm"
        ? "I am writing to remind you of the open balance below."
        : "I am writing about the past-due balance below and ask for payment right away.";

  return `{{customerName}},\n\n${opening}\n\nAmount due: {{amount}}\nOriginal due date: {{dueDate}}\nPlease pay by: {{payByDate}}\n${inv}${job}${pay}${late}\nSincerely,\n{{ownerName}}\n{{#businessName}}{{businessName}}\n{{/businessName}}${phone}`;
}

function sayItLine(tone: Tone): string {
  if (tone === "friendly") {
    return `Hi, this is {{ownerName}}. Just a quick reminder that {{amount}} was due on {{dueDate}}. Could you pay by {{payByDate}}?`;
  }
  if (tone === "firm") {
    return `Hi, this is {{ownerName}}. Calling about the {{amount}} that was due on {{dueDate}}. Please pay by {{payByDate}}.`;
  }
  return `Hi, this is {{ownerName}}. I need to settle the {{amount}} that was due on {{dueDate}}. Please pay by {{payByDate}}.`;
}

function buildTemplates(): TemplateCell[] {
  const cells: TemplateCell[] = [];

  for (const stage of STAGES) {
    for (const tone of TONES) {
      // text + email for stages 1, 2, 3, 5
      if (stage === 1 || stage === 2 || stage === 3 || stage === 5) {
        cells.push({
          stage,
          tone,
          channel: "text",
          body: textBody(stage, tone),
          drafted: true,
        });
        cells.push({
          stage,
          tone,
          channel: "email",
          body: emailBody(stage, tone),
          subject: emailSubject(stage, tone),
          drafted: true,
        });
      }

      // email + letter for stage 4
      if (stage === 4) {
        cells.push({
          stage,
          tone,
          channel: "email",
          body: emailBody(stage, tone),
          subject: emailSubject(stage, tone),
          drafted: true,
        });
        cells.push({
          stage,
          tone,
          channel: "letter",
          body: letterBody(tone),
          drafted: true,
        });
      }

      // letter also for stage 5 (uses stage 4 layout)
      if (stage === 5) {
        cells.push({
          stage,
          tone,
          channel: "letter",
          body: letterBody(tone),
          drafted: true,
        });
      }
    }
  }

  // Three Say it lines (one per tone); available for every stage via lookup fallback.
  for (const tone of TONES) {
    cells.push({
      stage: 1,
      tone,
      channel: "sayIt",
      body: sayItLine(tone),
      drafted: true,
    });
  }

  // Stage 3 work-together line is embedded via {{workTogetherLine}} token in text/email.
  return cells;
}

export const TEMPLATES: TemplateCell[] = buildTemplates();

/** Default work-together sentence for stage 3 (drafted). */
export const WORK_TOGETHER_OFTEN_LINE =
  "We work together often, so I wanted to keep this simple and clear.";

export const DRAFTED_CELLS: Array<{ stage: Stage; tone: Tone; channel: Channel }> = TEMPLATES.filter(
  (c) => c.drafted,
).map((c) => ({ stage: c.stage, tone: c.tone, channel: c.channel }));

export function findTemplate(
  stage: Stage,
  tone: Tone,
  channel: Channel,
): TemplateCell | undefined {
  if (channel === "sayIt") {
    return TEMPLATES.find((c) => c.channel === "sayIt" && c.tone === tone);
  }
  return TEMPLATES.find((c) => c.stage === stage && c.tone === tone && c.channel === channel);
}
