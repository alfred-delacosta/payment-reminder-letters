/*
 * Copyright (c) 2026 Advanced Software and AI Solutions LLC. All rights reserved.
 *
 * Tool-specific letter print surface on the ReportPrint portal pattern.
 * 1 inch margins, black on white, no credit, no disclaimer, no link URLs.
 * Signature lines live in the rendered body and stay together via CSS.
 */

import { createPortal } from "react-dom";
import "./letterPrint.css";

export type LetterPrintProps = {
  /** Already-formatted long US date for the letter date line. */
  letterDate: string;
  ownerName: string;
  businessName: string;
  phone: string;
  /** Pre-rendered letter body (plain text, includes closing). */
  body: string;
};

export function LetterPrint({
  letterDate,
  ownerName,
  businessName,
  phone,
  body,
}: LetterPrintProps) {
  if (typeof document === "undefined") return null;

  return createPortal(
    <div className="lp-root" aria-hidden="true" inert>
      <header className="lp-letterhead">
        {businessName.trim() ? <p className="lp-business">{businessName.trim()}</p> : null}
        {ownerName.trim() ? <p className="lp-owner">{ownerName.trim()}</p> : null}
        {phone.trim() ? <p className="lp-phone">{phone.trim()}</p> : null}
      </header>
      <p className="lp-date">{letterDate}</p>
      <div className="lp-body lp-signature">{body}</div>
    </div>,
    document.body,
  );
}

export default LetterPrint;
