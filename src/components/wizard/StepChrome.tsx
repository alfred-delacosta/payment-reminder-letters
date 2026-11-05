/*
 * Copyright (c) 2026 Advanced Software and AI Solutions LLC. All rights reserved.
 */

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import type { ReactNode } from "react";
import { STEP_LABELS, type WizardStep } from "./types";

type StepChromeProps = {
  step: Exclude<WizardStep, "landing">;
  title: string;
  children: ReactNode;
  onBack: () => void;
  backLabel?: string;
  trailing?: ReactNode;
};

export function StepChrome({
  step,
  title,
  children,
  onBack,
  backLabel = "Back",
  trailing,
}: StepChromeProps) {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <Box
        component="nav"
        aria-label="Wizard progress"
        sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}
      >
        {([1, 2, 3, 4, 5] as const).map((n) => {
          const current = n === step;
          const done = n < step;
          return (
            <Typography
              key={n}
              component="span"
              variant="caption"
              aria-current={current ? "step" : undefined}
              sx={{
                px: 1,
                py: 0.5,
                borderRadius: 1,
                bgcolor: current ? "primary.main" : done ? "action.selected" : "transparent",
                color: current ? "primary.contrastText" : "text.secondary",
                border: 1,
                borderColor: current ? "primary.main" : "divider",
                fontWeight: current ? 600 : 400,
              }}
            >
              {n}. {STEP_LABELS[n]}
            </Typography>
          );
        })}
      </Box>

      <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
        <Button onClick={onBack} variant="text" sx={{ minHeight: 48, px: 1.5 }}>
          {backLabel}
        </Button>
        {trailing}
      </Box>

      <Typography component="h1" variant="h1" tabIndex={-1} id={`step-${step}-heading`}>
        {title}
      </Typography>

      {children}
    </Box>
  );
}
