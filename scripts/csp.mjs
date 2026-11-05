/*
 * Copyright (c) 2026 Advanced Software and AI Solutions LLC. All rights reserved.
 *
 * DEFAULT (pending Jay) 11: one CSP source for meta, .htaccess, and nginx.
 * connect-src is 'self' only in Phase 1 (no Pulse).
 */

/** Content-Security-Policy value shared by index.html, .htaccess, and nginx. */
export const CSP_POLICY =
  "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'";
