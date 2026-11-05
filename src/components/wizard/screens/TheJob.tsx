/*
 * Copyright (c) 2026 Advanced Software and AI Solutions LLC. All rights reserved.
 */

import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import { useState } from "react";
import { StepChrome } from "../StepChrome";
import { FIELD_CAPS, type WizardState } from "../types";
import { parseAmountCents } from "../buildTokens";

type TheJobProps = {
  state: WizardState;
  onBack: () => void;
  onChange: (patch: Partial<WizardState>) => void;
  onNext: () => void;
};

export function TheJob({ state, onBack, onChange, onNext }: TheJobProps) {
  const [errors, setErrors] = useState<string[]>([]);

  function validateAndNext() {
    const nextErrors: string[] = [];
    if (!state.customerName.trim()) nextErrors.push("Customer name is required.");
    const cents = parseAmountCents(state.amountText);
    if (cents === null) nextErrors.push("Enter a valid amount with at most 2 decimals.");
    if (!state.dueDateIso.trim()) nextErrors.push("Due date is required.");
    setErrors(nextErrors);
    if (nextErrors.length === 0) onNext();
  }

  return (
    <StepChrome step={2} title="The job" onBack={onBack}>
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
          label="Customer name"
          required
          value={state.customerName}
          onChange={(e) =>
            onChange({ customerName: e.target.value.slice(0, FIELD_CAPS.customerName) })
          }
          slotProps={{
            htmlInput: { maxLength: FIELD_CAPS.customerName, autoComplete: "name" },
          }}
          fullWidth
        />
        <TextField
          label="Amount due"
          required
          value={state.amountText}
          onChange={(e) => onChange({ amountText: e.target.value })}
          slotProps={{
            htmlInput: { inputMode: "decimal", "aria-describedby": "amount-hint" },
            formHelperText: { id: "amount-hint" },
          }}
          helperText="Dollars and cents, for example 2400.00"
          fullWidth
        />
        <TextField
          label="Due date"
          type="date"
          value={state.dueDateIso}
          onChange={(e) => onChange({ dueDateIso: e.target.value })}
          slotProps={{ inputLabel: { shrink: true } }}
          fullWidth
        />
        <TextField
          label="Invoice number"
          value={state.invoiceNumber}
          onChange={(e) =>
            onChange({ invoiceNumber: e.target.value.slice(0, FIELD_CAPS.invoiceNumber) })
          }
          slotProps={{ htmlInput: { maxLength: FIELD_CAPS.invoiceNumber } }}
          fullWidth
        />
        <TextField
          label="Job"
          value={state.job}
          onChange={(e) => onChange({ job: e.target.value.slice(0, FIELD_CAPS.job) })}
          slotProps={{ htmlInput: { maxLength: FIELD_CAPS.job } }}
          fullWidth
        />

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
