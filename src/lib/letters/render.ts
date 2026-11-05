/*
 * Copyright (c) 2026 Advanced Software and AI Solutions LLC. All rights reserved.
 */

import { findTemplate, type Channel, type Stage, type Tone } from "./templates";
import {
  TOKEN_WHITELIST,
  type TokenName,
  type TokenValues,
} from "./tokens";

const OPTIONAL_BLOCK = /\{\{#(\w+)\}\}([\s\S]*?)\{\{\/\1\}\}/g;
const TOKEN = /\{\{(\w+)\}\}/g;

export type RenderResult = {
  plainText: string;
  preview: string;
  subject: string;
  sayIt: string;
  textCharCount: number;
  textWarnOver320: boolean;
  drafted: boolean;
};

function isWhitelisted(name: string): name is TokenName {
  return (TOKEN_WHITELIST as readonly string[]).includes(name);
}

function valueOf(values: TokenValues, name: TokenName): string {
  const v = values[name];
  return typeof v === "string" ? v.trim() : "";
}

/**
 * Drop optional {{#token}}...{{/token}} parts when the token is empty,
 * including surrounding punctuation inside the block. Then replace tokens.
 */
export function fillTemplate(body: string, values: TokenValues): string {
  let out = body.replace(OPTIONAL_BLOCK, (_full, name: string, inner: string) => {
    if (!isWhitelisted(name)) {
      throw new Error(`Unknown optional token: ${name}`);
    }
    return valueOf(values, name) ? inner : "";
  });

  out = out.replace(TOKEN, (_full, name: string) => {
    if (!isWhitelisted(name)) {
      throw new Error(`Unknown token: ${name}`);
    }
    return valueOf(values, name);
  });

  // Collapse leftover blank lines from dropped optional blocks.
  out = out.replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();

  const leftover = out.match(/\{\{[^}]+\}\}/g);
  if (leftover && leftover.length > 0) {
    throw new Error(`Unfilled token(s): ${leftover.join(", ")}`);
  }
  return out;
}

/** Build preview, plain text, subject, and Say it from one template pass. */
export function renderReminder(args: {
  stage: Stage;
  tone: Tone;
  channel: Channel;
  values: TokenValues;
}): RenderResult {
  const cell = findTemplate(args.stage, args.tone, args.channel);
  if (!cell) {
    throw new Error(
      `No template for stage ${args.stage} tone ${args.tone} channel ${args.channel}`,
    );
  }

  const plainText = fillTemplate(cell.body, args.values);
  const subject = cell.subject ? fillTemplate(cell.subject, args.values) : "";

  const sayCell = findTemplate(args.stage, args.tone, "sayIt");
  const sayIt = sayCell ? fillTemplate(sayCell.body, args.values) : "";

  return {
    plainText,
    preview: plainText,
    subject,
    sayIt,
    textCharCount: plainText.length,
    textWarnOver320: plainText.length > 320,
    drafted: cell.drafted,
  };
}
