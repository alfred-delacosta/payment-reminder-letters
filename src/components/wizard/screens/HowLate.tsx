/*
 * Copyright (c) 2026 Advanced Software and AI Solutions LLC. All rights reserved.
 */

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { StepChrome } from "../StepChrome";
import { HOW_LATE_OPTIONS, type HowLateChoice } from "../types";

type HowLateProps = {
  onBack: () => void;
  onChoose: (id: HowLateChoice) => void;
};

export function HowLate({ onBack, onChoose }: HowLateProps) {
  return (
    <StepChrome step={1} title="How late is the payment?" onBack={onBack}>
      <Typography>One tap sets the tone and a due date preset, then moves on.</Typography>
      <Box
        role="group"
        aria-label="How late"
        sx={{ display: "flex", flexDirection: "column", gap: 1.25 }}
      >
        {HOW_LATE_OPTIONS.map((opt) => (
          <Button
            key={opt.id}
            variant="outlined"
            onClick={() => onChoose(opt.id)}
            sx={{
              minHeight: 48,
              justifyContent: "flex-start",
              px: 2,
              transition: (t) =>
                t.transitions.create("transform", { duration: t.transitions.duration.shorter }),
              "&:active": { transform: "scale(0.98)" },
              "@media (prefers-reduced-motion: reduce)": {
                transition: "none",
                "&:active": { transform: "none" },
              },
            }}
          >
            {opt.label}
          </Button>
        ))}
      </Box>
    </StepChrome>
  );
}
