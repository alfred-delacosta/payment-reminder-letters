/*
 * Copyright (c) 2026 Advanced Software and AI Solutions LLC. All rights reserved.
 *
 * Placeholder shell for PR 1. Screens arrive in PR 2 (feat/wizard-ui).
 */

import Box from "@mui/material/Box";
import CssBaseline from "@mui/material/CssBaseline";
import Typography from "@mui/material/Typography";
import { ThemeProvider } from "@mui/material/styles";
import { appTheme } from "./theme";

export const DISCLAIMER =
  "Reminders are drafts you control. This tool does not send messages, give legal advice, or store your details in the browser.";

export function copyrightLine(year = new Date().getFullYear()): string {
  return `Copyright (c) ${year} Advanced Software and AI Solutions LLC`;
}

export default function App() {
  return (
    <ThemeProvider theme={appTheme} defaultMode="system" noSsr>
      <CssBaseline />
      <Box
        component="main"
        sx={{
          flex: 1,
          px: 2,
          py: 4,
          maxWidth: 720,
          mx: "auto",
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        <Typography component="h1" variant="h1">
          Payment Reminder Letters
        </Typography>
        <Typography>
          Get paid without the awkward conversation. The wizard screens arrive in the next
          update. Core reminder logic is ready offline after load.
        </Typography>
        <Typography variant="caption" color="text.secondary" component="p">
          {copyrightLine()}. Built by Advanced Software and AI Solutions LLC.
        </Typography>
        <Typography variant="caption" color="text.secondary" component="p">
          {DISCLAIMER}
        </Typography>
        <Typography variant="caption" color="text.secondary" component="p">
          Privacy: nothing is stored in this browser. Save and load a details file when the
          wizard ships.
        </Typography>
      </Box>
    </ThemeProvider>
  );
}
