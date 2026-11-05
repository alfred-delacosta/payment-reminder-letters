/*
 * Copyright (c) 2026 Advanced Software and AI Solutions LLC. All rights reserved.
 */

import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";
import AppShell, { copyrightLine, DISCLAIMER, PRIVACY_LINE } from "./components/AppShell";
import Wizard from "./components/wizard/Wizard";
import { appTheme } from "./theme";

export { copyrightLine, DISCLAIMER, PRIVACY_LINE };

export default function App() {
  return (
    <ThemeProvider theme={appTheme} defaultMode="system" noSsr>
      <CssBaseline />
      <AppShell>
        <Wizard />
      </AppShell>
    </ThemeProvider>
  );
}
