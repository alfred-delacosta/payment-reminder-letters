/*
 * Copyright (c) 2026 Advanced Software and AI Solutions LLC. All rights reserved.
 */

/// <reference types="vite/client" />

declare module "*.css";

declare module "../scripts/csp.mjs" {
  export const CSP_POLICY: string;
}

declare module "./scripts/csp.mjs" {
  export const CSP_POLICY: string;
}
