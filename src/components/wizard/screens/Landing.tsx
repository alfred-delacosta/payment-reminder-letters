/*
 * Copyright (c) 2026 Advanced Software and AI Solutions LLC. All rights reserved.
 */

import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useRef } from "react";
import { loadDetailsFromText } from "../../../lib/detailsFile";
import type { SavedDetails } from "../../../lib/detailsFile";

type LandingProps = {
  loadError: string | null;
  onStart: () => void;
  onLoaded: (details: SavedDetails) => void;
  onLoadError: (message: string) => void;
};

export function Landing({ loadError, onStart, onLoaded, onLoadError }: LandingProps) {
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    try {
      const text = await file.text();
      const result = loadDetailsFromText(text, file.size);
      if (!result.ok) {
        onLoadError(result.error);
        return;
      }
      onLoaded(result.value);
    } catch {
      onLoadError("Could not read that file.");
    }
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
      <Typography component="h1" variant="h1" tabIndex={-1} id="landing-heading">
        Get paid without the awkward conversation.
      </Typography>
      <Typography>
        Answer a few quick questions and get a polite reminder as a text, email, printed letter,
        or lines to say. Optional late fee in whole cents. Nothing leaves this device unless you
        copy, share, or print it.
      </Typography>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
        <Button
          variant="contained"
          size="large"
          onClick={onStart}
          sx={{ minHeight: 48, alignSelf: "stretch" }}
        >
          Start a reminder
        </Button>
        <Button
          variant="outlined"
          size="large"
          onClick={() => fileRef.current?.click()}
          sx={{ minHeight: 48, alignSelf: "stretch" }}
        >
          Load my details
        </Button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          hidden
          aria-label="Load my details file"
          onChange={(e) => {
            const file = e.target.files?.[0];
            void handleFile(file);
            e.target.value = "";
          }}
        />
      </Box>

      {loadError ? (
        <Alert severity="error" role="alert">
          {loadError}
        </Alert>
      ) : null}

      <Typography variant="body2" color="text.secondary">
        Privacy: nothing is stored in this browser. Save and load a details file if you want to
        reuse your name, phone, and payment methods.
      </Typography>

      <Box>
        <Typography component="h2" variant="h2" sx={{ mb: 1 }}>
          FAQ
        </Typography>
        <Accordion disableGutters elevation={0} sx={{ border: 1, borderColor: "divider" }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="faq-send-content">
            <Typography>Does this send messages for me?</Typography>
          </AccordionSummary>
          <AccordionDetails id="faq-send-content">
            <Typography>
              No. You copy, share, open your email app, or print. The tool never sends anything.
            </Typography>
          </AccordionDetails>
        </Accordion>
        <Accordion disableGutters elevation={0} sx={{ border: 1, borderColor: "divider", borderTop: 0 }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="faq-store-content">
            <Typography>Where are my details stored?</Typography>
          </AccordionSummary>
          <AccordionDetails id="faq-store-content">
            <Typography>
              Nowhere in the browser. Optional save downloads a JSON file you keep. Load it later
              to refill owner fields.
            </Typography>
          </AccordionDetails>
        </Accordion>
        <Accordion disableGutters elevation={0} sx={{ border: 1, borderColor: "divider", borderTop: 0 }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="faq-offline-content">
            <Typography>Does it work offline?</Typography>
          </AccordionSummary>
          <AccordionDetails id="faq-offline-content">
            <Typography>
              Yes after the page has loaded. You can build, copy, and print with the network off.
            </Typography>
          </AccordionDetails>
        </Accordion>
      </Box>
    </Box>
  );
}
