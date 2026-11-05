/*
 * Copyright (c) 2026 Advanced Software and AI Solutions LLC. All rights reserved.
 */

import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Snackbar from "@mui/material/Snackbar";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useMemo, useState } from "react";
import { CTA_PULSE_RESULTS_CONTACT } from "../../../config/cta";
import { formatLongUsDate, localToday } from "../../../lib/dates";
import type { Channel } from "../../../lib/letters";
import {
  MAILTO_HIDDEN_OVER,
  buildMailtoUrl,
  canUseWebShare,
  copyText,
  shareText,
} from "../../../lib/share";
import { DISCLAIMER } from "../../AppShell";
import { LetterPrint } from "../../print/LetterPrint";
import { requestBrowserPrint, SHARE_PRINT_HINT } from "../../report/printSession";
import { channelsForStage, renderFromState } from "../buildTokens";
import { StepChrome } from "../StepChrome";
import { FIELD_CAPS, type WizardState } from "../types";

type ResultProps = {
  state: WizardState;
  onBack: () => void;
  onChange: (patch: Partial<WizardState>) => void;
  onClear: () => void;
  onNextReminder: () => void;
  onRegenerateDraft: (channel?: Channel) => void;
};

const CHANNEL_LABELS: Record<Channel, string> = {
  text: "Text",
  email: "Email",
  letter: "Letter",
  sayIt: "Say it",
};

export function Result({
  state,
  onBack,
  onChange,
  onClear,
  onNextReminder,
  onRegenerateDraft,
}: ResultProps) {
  const available = channelsForStage(state.stage);
  const activeChannel = available.includes(state.resultChannel)
    ? state.resultChannel
    : (available[0] ?? "sayIt");
  const [copiedFlash, setCopiedFlash] = useState(false);
  const [printHint, setPrintHint] = useState<string | null>(null);

  const letterBody = useMemo(() => {
    if (!available.includes("letter")) return "";
    try {
      return renderFromState(state, "letter").plainText;
    } catch {
      return "";
    }
  }, [state, available]);

  async function handleCopy(text: string, toast = "Copied. Paste it into your texts.") {
    const result = await copyText(text);
    if (result.ok) {
      setCopiedFlash(true);
      onChange({ toast, announce: toast });
      window.setTimeout(() => setCopiedFlash(false), 900);
    } else {
      onChange({ toast: result.reason, announce: result.reason });
    }
  }

  async function handleShare() {
    const result = await shareText({
      title: "Payment reminder",
      text: state.draftText,
    });
    if (!result.ok) {
      onChange({ toast: result.reason, announce: result.reason });
    }
  }

  function handleOpenEmail() {
    const url = buildMailtoUrl(state.draftSubject || "Payment reminder", state.draftText);
    if (!url) {
      onChange({
        toast: `Email body is over ${MAILTO_HIDDEN_OVER} characters. Copy instead.`,
        announce: "Email body is too long for Open in email. Copy instead.",
      });
      return;
    }
    window.location.href = url;
  }

  function handlePrint() {
    const result = requestBrowserPrint();
    if (result.needsShareHint) {
      setPrintHint(SHARE_PRINT_HINT);
    }
  }

  function handleChannelChange(_e: unknown, value: Channel) {
    if (!value || value === activeChannel) return;
    if (state.draftDirty) {
      const replace = window.confirm(
        "Replace your edited draft with a new reminder for this tab?",
      );
      if (!replace) return;
    }
    onRegenerateDraft(value);
  }

  return (
    <StepChrome step={5} title="Your reminder" onBack={onBack}>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <Tabs
          value={activeChannel}
          onChange={handleChannelChange}
          variant="scrollable"
          scrollButtons="auto"
          aria-label="Reminder channel"
        >
          {available.map((channel) => (
            <Tab
              key={channel}
              value={channel}
              label={CHANNEL_LABELS[channel]}
              sx={{ minHeight: 48 }}
            />
          ))}
        </Tabs>

        {activeChannel === "email" ? (
          <TextField
            label="Subject"
            value={state.draftSubject}
            onChange={(e) =>
              onChange({
                draftSubject: e.target.value.slice(0, FIELD_CAPS.draft),
                draftDirty: true,
              })
            }
            fullWidth
          />
        ) : null}

        <TextField
          label={CHANNEL_LABELS[activeChannel]}
          value={state.draftText}
          onChange={(e) =>
            onChange({
              draftText: e.target.value.slice(0, FIELD_CAPS.draft),
              draftDirty: true,
            })
          }
          multiline
          minRows={8}
          slotProps={{ htmlInput: { maxLength: FIELD_CAPS.draft } }}
          fullWidth
        />

        {state.draftText.length > 320 && activeChannel === "text" ? (
          <Alert severity="warning" role="status">
            This text is over 320 characters ({state.draftText.length}). Some carriers may split
            it.
          </Alert>
        ) : null}

        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
          <Button
            variant="contained"
            sx={{ minHeight: 48 }}
            onClick={() => void handleCopy(state.draftText)}
            endIcon={
              copiedFlash ? (
                <CheckCircleOutlineIcon
                  sx={{
                    "@keyframes lp-pop": {
                      "0%": { transform: "scale(0.6)", opacity: 0.4 },
                      "100%": { transform: "scale(1)", opacity: 1 },
                    },
                    animation: "lp-pop 180ms ease-out",
                    "@media (prefers-reduced-motion: reduce)": { animation: "none" },
                  }}
                />
              ) : undefined
            }
          >
            Copy
          </Button>
          {canUseWebShare() ? (
            <Button variant="outlined" sx={{ minHeight: 48 }} onClick={() => void handleShare()}>
              Share
            </Button>
          ) : null}
          {activeChannel === "email" ? (
            <>
              <Button
                variant="outlined"
                sx={{ minHeight: 48 }}
                onClick={() => void handleCopy(state.draftSubject, "Subject copied.")}
              >
                Copy subject
              </Button>
              <Button
                variant="outlined"
                sx={{ minHeight: 48 }}
                onClick={() =>
                  void handleCopy(
                    `Subject: ${state.draftSubject}\n\n${state.draftText}`,
                    "Email copied.",
                  )
                }
              >
                Copy email
              </Button>
              <Button variant="outlined" sx={{ minHeight: 48 }} onClick={handleOpenEmail}>
                Open in email
              </Button>
            </>
          ) : null}
          {activeChannel === "letter" || available.includes("letter") ? (
            <Button variant="outlined" sx={{ minHeight: 48 }} onClick={handlePrint}>
              Print or save as PDF
            </Button>
          ) : null}
        </Box>

        <Alert severity="info" role="note">
          {DISCLAIMER}
        </Alert>
        {printHint ? (
          <Alert severity="warning" role="status">
            {printHint}
          </Alert>
        ) : null}

        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
          <Button
            variant="contained"
            color="secondary"
            sx={{ minHeight: 48 }}
            onClick={onNextReminder}
          >
            Make the next reminder
          </Button>
          <Button variant="text" color="error" sx={{ minHeight: 48 }} onClick={onClear}>
            Clear
          </Button>
        </Box>

        <Box
          id={CTA_PULSE_RESULTS_CONTACT}
          data-cta-slot="result-card"
          aria-hidden="true"
          sx={{ minHeight: 0 }}
        />

        {letterBody ? (
          <LetterPrint
            letterDate={formatLongUsDate(localToday())}
            ownerName={state.ownerName}
            businessName={state.businessName}
            phone={state.phone}
            body={activeChannel === "letter" ? state.draftText : letterBody}
          />
        ) : null}

        <Typography variant="caption" color="text.secondary">
          Draft wording may still be pending Product Owner review.
        </Typography>
      </Box>

      <Snackbar
        open={Boolean(state.toast)}
        autoHideDuration={3500}
        onClose={() => onChange({ toast: null })}
        message={state.toast ?? ""}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      />
    </StepChrome>
  );
}
