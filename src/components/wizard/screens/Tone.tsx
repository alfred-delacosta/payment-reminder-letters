/*
 * Copyright (c) 2026 Advanced Software and AI Solutions LLC. All rights reserved.
 */

import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Fade from "@mui/material/Fade";
import FormControlLabel from "@mui/material/FormControlLabel";
import MenuItem from "@mui/material/MenuItem";
import Switch from "@mui/material/Switch";
import TextField from "@mui/material/TextField";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Typography from "@mui/material/Typography";
import { LATE_FEE_MODES, type LateFeeMode } from "../../../lib/latefee";
import type { PreferredTone } from "../../../lib/detailsFile";
import {
  computeLateFeeFromState,
  daysLateLabel,
  parseAmountCents,
  previewChannelForStage,
  renderFromState,
} from "../buildTokens";
import { StepChrome } from "../StepChrome";
import type { WizardState } from "../types";

type ToneProps = {
  state: WizardState;
  onBack: () => void;
  onChange: (patch: Partial<WizardState>) => void;
  onNext: () => void;
};

const TONE_LABELS: Record<PreferredTone, string> = {
  friendly: "Friendly",
  firm: "Firm",
  final: "Final",
};

const MODE_LABELS: Record<LateFeeMode, string> = {
  flatOnce: "Flat one time",
  percentOnce: "Percent one time",
  percentPerMonth: "Percent per month",
};

export function Tone({ state, onBack, onChange, onNext }: ToneProps) {
  const previewChannel = previewChannelForStage(state.stage);
  let previewText = "";
  let drafted = false;
  try {
    const rendered = renderFromState(state, previewChannel);
    previewText = rendered.preview;
    drafted = rendered.drafted;
  } catch {
    previewText = "Fill required fields to preview.";
  }

  const amountCents = parseAmountCents(state.amountText);
  let formulaLine = "";
  let daysLate = daysLateLabel(state);
  if (state.lateFeeEnabled && amountCents !== null) {
    try {
      const fee = computeLateFeeFromState(state, amountCents);
      formulaLine = fee.formulaLine;
      daysLate = fee.daysLate;
    } catch {
      formulaLine = "Check the late fee values.";
    }
  }

  return (
    <StepChrome step={4} title="Tone and late fee" onBack={onBack}>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <ToggleButtonGroup
          exclusive
          fullWidth
          value={state.tone}
          onChange={(_e, value: PreferredTone | null) => {
            if (value) onChange({ tone: value });
          }}
          aria-label="Tone"
          sx={{
            "& .MuiToggleButton-root": {
              minHeight: 48,
              textTransform: "none",
              flex: 1,
            },
          }}
        >
          {(Object.keys(TONE_LABELS) as PreferredTone[]).map((tone) => (
            <ToggleButton key={tone} value={tone} aria-label={TONE_LABELS[tone]}>
              {TONE_LABELS[tone]}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>

        <Box>
          <Typography component="h2" variant="h3" sx={{ mb: 1 }}>
            Live preview
          </Typography>
          <Fade
            in
            key={`${state.tone}-${previewChannel}-${state.workTogetherOften}-${state.includeLateFeeInMessage}`}
            timeout={{ enter: 220, exit: 150 }}
          >
            <Box
              sx={{
                p: 2,
                border: 1,
                borderColor: "divider",
                borderRadius: 1,
                bgcolor: "background.paper",
                whiteSpace: "pre-wrap",
                "@media (prefers-reduced-motion: reduce)": {
                  transition: "none",
                },
              }}
              aria-live="polite"
            >
              <Typography component="pre" sx={{ m: 0, fontFamily: "inherit", whiteSpace: "pre-wrap" }}>
                {previewText}
              </Typography>
            </Box>
          </Fade>
          {drafted ? (
            <Typography variant="caption" color="text.secondary" component="p" sx={{ mt: 0.75 }}>
              Draft wording pending Product Owner review.
            </Typography>
          ) : null}
        </Box>

        <FormControlLabel
          control={
            <Switch
              checked={state.workTogetherOften}
              onChange={(e) => onChange({ workTogetherOften: e.target.checked })}
            />
          }
          label="We work together often"
        />

        <FormControlLabel
          control={
            <Switch
              checked={state.lateFeeEnabled}
              onChange={(e) => onChange({ lateFeeEnabled: e.target.checked })}
            />
          }
          label="Add a late fee"
        />

        {state.lateFeeEnabled ? (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pl: 0.5 }}>
            <TextField
              select
              label="Late fee type"
              value={state.lateFeeMode}
              onChange={(e) => onChange({ lateFeeMode: e.target.value as LateFeeMode })}
              fullWidth
            >
              {LATE_FEE_MODES.map((mode) => (
                <MenuItem key={mode} value={mode}>
                  {MODE_LABELS[mode]}
                </MenuItem>
              ))}
            </TextField>

            {state.lateFeeMode === "flatOnce" ? (
              <TextField
                label="Flat fee amount"
                value={state.lateFeeFlatText}
                onChange={(e) => onChange({ lateFeeFlatText: e.target.value })}
                slotProps={{ htmlInput: { inputMode: "decimal" } }}
                fullWidth
              />
            ) : (
              <TextField
                label="Percent rate"
                value={state.lateFeePercentText}
                onChange={(e) => onChange({ lateFeePercentText: e.target.value })}
                slotProps={{ htmlInput: { inputMode: "decimal" } }}
                helperText="Up to 100. No suggested rates."
                fullWidth
              />
            )}

            <Typography variant="body2">Days late (from due date): {daysLate}</Typography>
            {formulaLine ? (
              <Alert severity="info" role="status">
                {formulaLine}
              </Alert>
            ) : null}
            <Typography variant="caption" color="text.secondary">
              Estimate only. Confirm any fee with your own policy before you send.
            </Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={state.includeLateFeeInMessage}
                  onChange={(e) => onChange({ includeLateFeeInMessage: e.target.checked })}
                />
              }
              label="Include this in my message"
            />
          </Box>
        ) : null}

        <TextField
          label="Please pay by"
          type="date"
          value={state.payByDateIso}
          onChange={(e) => onChange({ payByDateIso: e.target.value })}
          slotProps={{ inputLabel: { shrink: true } }}
          fullWidth
        />

        <Button variant="contained" sx={{ minHeight: 48 }} onClick={onNext}>
          See my reminder
        </Button>
      </Box>
    </StepChrome>
  );
}
