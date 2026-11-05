/*
 * Copyright (c) 2026 Advanced Software and AI Solutions LLC. All rights reserved.
 *
 * document.title swap for PDF file names, with afterprint + timeout restore.
 */

import { buildReportDocumentTitle } from "../print/ReportPrint";

const IOS_TITLE_RESTORE_MS = 2000;

let restoreTimer: ReturnType<typeof setTimeout> | null = null;
let previousTitle: string | null = null;
let afterPrintHandler: (() => void) | null = null;

function clearTitleSession(): void {
  if (restoreTimer !== null) {
    clearTimeout(restoreTimer);
    restoreTimer = null;
  }
  if (afterPrintHandler) {
    window.removeEventListener("afterprint", afterPrintHandler);
    afterPrintHandler = null;
  }
  if (previousTitle !== null) {
    document.title = previousTitle;
    previousTitle = null;
  }
}

/** Set document.title for the print job and restore on afterprint (iOS timeout fallback). */
export function beginPrintTitle(date: Date | string = new Date()): void {
  clearTitleSession();
  previousTitle = document.title;
  document.title = buildReportDocumentTitle(date);
  afterPrintHandler = () => {
    clearTitleSession();
  };
  window.addEventListener("afterprint", afterPrintHandler);
  restoreTimer = setTimeout(() => {
    clearTitleSession();
  }, IOS_TITLE_RESTORE_MS);
}

export function isStandaloneDisplay(): boolean {
  if (typeof window === "undefined") return false;
  if (window.matchMedia("(display-mode: standalone)").matches) return true;
  const nav = navigator as Navigator & { standalone?: boolean };
  return nav.standalone === true;
}

/**
 * Call window.print(). Returns false when standalone iOS is likely to no-op
 * (caller should show Share -> Print hint). Heuristic only.
 */
export function requestBrowserPrint(): { printed: boolean; needsShareHint: boolean } {
  const standalone = isStandaloneDisplay();
  const isIos =
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

  beginPrintTitle();
  try {
    window.print();
  } catch {
    return { printed: false, needsShareHint: standalone || isIos };
  }

  if (standalone && isIos) {
    return { printed: true, needsShareHint: true };
  }
  return { printed: true, needsShareHint: false };
}

export const SHARE_PRINT_HINT =
  "On iPhone from the Home Screen app, use Share, then Print (or Save PDF).";
