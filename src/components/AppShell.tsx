/*
 * Copyright (c) 2026 Advanced Software and AI Solutions LLC. All rights reserved.
 */

import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import type { ReactNode } from "react";
import { CTA_PULSE_FOOTER_CONTACT } from "../config/cta";

export const DISCLAIMER =
  "Reminders are drafts you control. This tool does not send messages, give legal advice, or store your details in the browser.";

export const PRIVACY_LINE =
  "Privacy: nothing is stored in this browser. Save and load a details file if you want to reuse your info.";

export function copyrightLine(year = new Date().getFullYear()): string {
  return `Copyright (c) ${year} Advanced Software and AI Solutions LLC`;
}

type AppShellProps = {
  children: ReactNode;
};

export default function AppShell({ children }: AppShellProps) {
  const base = import.meta.env.BASE_URL;
  const markSrc = `${base}brand/header-mark-light.svg`;

  return (
    <Box
      sx={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        minHeight: "100%",
      }}
    >
      <Box
        component="header"
        sx={{
          borderBottom: 1,
          borderColor: "divider",
          bgcolor: "background.paper",
          px: 2,
          py: 1.5,
        }}
      >
        <Container maxWidth="sm" disableGutters>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box
              component="img"
              src={markSrc}
              alt=""
              width={36}
              height={36}
              sx={{ display: "block" }}
            />
            <Typography component="p" variant="subtitle1" sx={{ fontWeight: 600, m: 0 }}>
              Payment Reminder Letters
            </Typography>
          </Box>
        </Container>
      </Box>

      <Box component="main" sx={{ flex: 1, px: 2, py: 3 }}>
        <Container maxWidth="sm" disableGutters>
          {children}
        </Container>
      </Box>

      <Box
        component="footer"
        sx={{
          borderTop: 1,
          borderColor: "divider",
          bgcolor: "background.paper",
          px: 2,
          py: 2,
          pb: "calc(16px + env(safe-area-inset-bottom, 0px))",
        }}
      >
        <Container maxWidth="sm" disableGutters>
          {/* Empty CTA slot for Phase 2 (DEFAULT 10). */}
          <Box
            id={CTA_PULSE_FOOTER_CONTACT}
            data-cta-slot="footer"
            aria-hidden="true"
            sx={{ minHeight: 0 }}
          />
          <Typography variant="caption" color="text.secondary" component="p" sx={{ m: 0 }}>
            {copyrightLine()}. Built by Advanced Software and AI Solutions LLC.
          </Typography>
          <Typography variant="caption" color="text.secondary" component="p" sx={{ mt: 0.75, mb: 0 }}>
            {DISCLAIMER}
          </Typography>
          <Typography variant="caption" color="text.secondary" component="p" sx={{ mt: 0.75, mb: 0 }}>
            {PRIVACY_LINE}
          </Typography>
          <Typography variant="caption" color="text.secondary" component="p" sx={{ mt: 0.75, mb: 0 }}>
            <Link
              href="https://advancedsoftwareandaisolutions.com/"
              rel="noopener noreferrer"
              underline="hover"
            >
              advancedsoftwareandaisolutions.com
            </Link>
          </Typography>
        </Container>
      </Box>
    </Box>
  );
}
