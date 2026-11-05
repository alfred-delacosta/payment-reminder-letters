/*
 * Copyright (c) 2026 Advanced Software and AI Solutions LLC. All rights reserved.
 */

import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useState } from "react";
import { PAYMENT_METHODS, type PaymentMethod } from "../../../lib/detailsFile";
import { downloadDetails } from "../buildTokens";
import { StepChrome } from "../StepChrome";
import { FIELD_CAPS, PAYMENT_METHOD_LABELS, type WizardState } from "../types";

type YouAndPayProps = {
  state: WizardState;
  onBack: () => void;
  onChange: (patch: Partial<WizardState>) => void;
  onNext: () => void;
};

const METHOD_UI_LABELS: Record<PaymentMethod, string> = {
  check: "Check",
  cash: "Cash",
  card: "Card",
  bankTransfer: "Bank transfer",
  paymentApp: "Payment app",
  other: "Other",
};

export function YouAndPay({ state, onBack, onChange, onNext }: YouAndPayProps) {
  const [errors, setErrors] = useState<string[]>([]);

  function toggleMethod(method: PaymentMethod) {
    const has = state.methods.includes(method);
    const methods = has
      ? state.methods.filter((m) => m !== method)
      : [...state.methods, method];
    onChange({
      methods,
      otherMethod: method === "other" && has ? "" : state.otherMethod,
    });
  }

  function validateAndNext() {
    const nextErrors: string[] = [];
    if (!state.ownerName.trim()) nextErrors.push("Your name is required.");
    if (state.methods.includes("other") && !state.otherMethod.trim()) {
      nextErrors.push("Describe the Other payment method.");
    }
    setErrors(nextErrors);
    if (nextErrors.length === 0) onNext();
  }

  return (
    <StepChrome
      step={3}
      title="You and how to pay"
      onBack={onBack}
      trailing={
        <Button
          variant="text"
          onClick={() => downloadDetails(state)}
          sx={{ minHeight: 48 }}
          disabled={!state.ownerName.trim()}
        >
          Save my details
        </Button>
      }
    >
      {state.filledFromFile ? (
        <Alert severity="info" role="status">
          Filled from your saved file
        </Alert>
      ) : null}

      <Box
        component="form"
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          validateAndNext();
        }}
        sx={{ display: "flex", flexDirection: "column", gap: 2 }}
      >
        <TextField
          label="Your name"
          required
          value={state.ownerName}
          onChange={(e) =>
            onChange({ ownerName: e.target.value.slice(0, FIELD_CAPS.ownerName) })
          }
          slotProps={{
            htmlInput: { maxLength: FIELD_CAPS.ownerName, autoComplete: "name" },
          }}
          fullWidth
        />
        <TextField
          label="Business name"
          value={state.businessName}
          onChange={(e) =>
            onChange({ businessName: e.target.value.slice(0, FIELD_CAPS.businessName) })
          }
          slotProps={{
            htmlInput: {
              maxLength: FIELD_CAPS.businessName,
              autoComplete: "organization",
            },
          }}
          fullWidth
        />
        <TextField
          label="Phone"
          value={state.phone}
          onChange={(e) => onChange({ phone: e.target.value.slice(0, FIELD_CAPS.phone) })}
          slotProps={{
            htmlInput: {
              maxLength: FIELD_CAPS.phone,
              inputMode: "tel",
              autoComplete: "tel",
            },
          }}
          fullWidth
        />

        <Box>
          <Typography component="h2" variant="h3" sx={{ mb: 1 }}>
            Payment methods
          </Typography>
          <Box
            role="group"
            aria-label="Payment methods"
            sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}
          >
            {PAYMENT_METHODS.map((method) => {
              const selected = state.methods.includes(method);
              return (
                <Chip
                  key={method}
                  label={METHOD_UI_LABELS[method]}
                  clickable
                  color={selected ? "primary" : "default"}
                  variant={selected ? "filled" : "outlined"}
                  onClick={() => toggleMethod(method)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      toggleMethod(method);
                    }
                  }}
                  sx={{
                    minHeight: 48,
                    px: 0.5,
                    fontSize: "1rem",
                    transition: (t) =>
                      t.transitions.create("transform", {
                        duration: t.transitions.duration.shorter,
                      }),
                    "&:active": { transform: "scale(0.97)" },
                    "@media (prefers-reduced-motion: reduce)": {
                      transition: "none",
                      "&:active": { transform: "none" },
                    },
                  }}
                  aria-pressed={selected}
                />
              );
            })}
          </Box>
          <Typography variant="caption" color="text.secondary" component="p" sx={{ mt: 1 }}>
            Shown in the reminder as:{" "}
            {state.methods.length
              ? state.methods
                  .map((m) =>
                    m === "other" ? state.otherMethod.trim() || "other" : PAYMENT_METHOD_LABELS[m],
                  )
                  .filter(Boolean)
                  .join(", ")
              : "none yet"}
          </Typography>
        </Box>

        {state.methods.includes("other") ? (
          <TextField
            label="Other payment method"
            required
            value={state.otherMethod}
            onChange={(e) =>
              onChange({ otherMethod: e.target.value.slice(0, FIELD_CAPS.otherMethod) })
            }
            slotProps={{ htmlInput: { maxLength: FIELD_CAPS.otherMethod } }}
            fullWidth
          />
        ) : null}

        {errors.length > 0 ? (
          <Alert severity="error" role="alert">
            {errors.join(" ")}
          </Alert>
        ) : null}

        <Button type="submit" variant="contained" sx={{ minHeight: 48 }}>
          Continue
        </Button>
      </Box>
    </StepChrome>
  );
}
