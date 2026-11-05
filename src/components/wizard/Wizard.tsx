/*
 * Copyright (c) 2026 Advanced Software and AI Solutions LLC. All rights reserved.
 */

import Box from "@mui/material/Box";
import Fade from "@mui/material/Fade";
import { useEffect, useRef, useState, type TouchEvent } from "react";
import type { SavedDetails } from "../../lib/detailsFile";
import { dueDatePreset, formatIsoDate } from "../../lib/dates";
import type { Channel } from "../../lib/letters";
import {
  applySavedDetails,
  defaultChannelForStage,
  renderFromState,
} from "./buildTokens";
import { createInitialState } from "./initialState";
import { HowLate } from "./screens/HowLate";
import { Landing } from "./screens/Landing";
import { Result } from "./screens/Result";
import { TheJob } from "./screens/TheJob";
import { Tone } from "./screens/Tone";
import { YouAndPay } from "./screens/YouAndPay";
import {
  HOW_LATE_OPTIONS,
  type HowLateChoice,
  type WizardState,
  type WizardStep,
} from "./types";

type HistoryPayload = { step: WizardStep };

function focusStepHeading(step: WizardStep) {
  const id = step === "landing" ? "landing-heading" : `step-${step}-heading`;
  window.requestAnimationFrame(() => {
    document.getElementById(id)?.focus();
  });
}

function withDraft(state: WizardState, channel: Channel): WizardState {
  try {
    const rendered = renderFromState({ ...state, resultChannel: channel }, channel);
    return {
      ...state,
      resultChannel: channel,
      draftText: rendered.plainText.slice(0, 5000),
      draftSubject: rendered.subject.slice(0, 5000),
      draftDirty: false,
    };
  } catch {
    return { ...state, resultChannel: channel };
  }
}

export default function Wizard() {
  const [state, setState] = useState<WizardState>(() => createInitialState());
  const touchStartX = useRef<number | null>(null);
  const skipHistory = useRef(true);
  const hydrated = useRef(false);

  useEffect(() => {
    focusStepHeading(state.step);
  }, [state.step]);

  useEffect(() => {
    const onPopState = (event: PopStateEvent) => {
      const payload = event.state as HistoryPayload | null;
      skipHistory.current = true;
      if (!payload || payload.step === undefined) {
        setState((prev) => ({ ...prev, step: "landing", announce: "Back to start." }));
        return;
      }
      setState((prev) => ({
        ...prev,
        step: payload.step,
        announce: `Moved to ${payload.step === "landing" ? "start" : `step ${payload.step}`}.`,
      }));
    };
    window.addEventListener("popstate", onPopState);
    if (!hydrated.current) {
      hydrated.current = true;
      window.history.replaceState({ step: "landing" } satisfies HistoryPayload, "", window.location.pathname);
    }
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  useEffect(() => {
    if (skipHistory.current) {
      skipHistory.current = false;
      return;
    }
    const payload: HistoryPayload = { step: state.step };
    window.history.pushState(payload, "", window.location.pathname);
  }, [state.step]);

  function patch(partial: Partial<WizardState>) {
    setState((prev) => ({ ...prev, ...partial }));
  }

  function go(step: WizardStep, extra: Partial<WizardState> = {}) {
    setState((prev) => {
      let next: WizardState = {
        ...prev,
        ...extra,
        step,
        announce: step === "landing" ? "Start screen." : `Step ${step}.`,
      };
      if (step === 5) {
        const channel = (extra.resultChannel as Channel | undefined) ?? next.resultChannel;
        next = withDraft(next, channel);
      }
      return next;
    });
  }

  function regenerateDraft(channel?: Channel) {
    setState((prev) => {
      if (prev.draftDirty) {
        const ok = window.confirm(
          "You edited the draft. Replace it with an updated reminder?",
        );
        if (!ok) return prev;
      }
      return withDraft(prev, channel ?? prev.resultChannel);
    });
  }

  function handleHowLate(id: HowLateChoice) {
    const opt = HOW_LATE_OPTIONS.find((o) => o.id === id);
    if (!opt) return;
    const due = formatIsoDate(dueDatePreset(opt.daysAgo));
    go(2, {
      howLate: id,
      stage: opt.stage,
      tone: opt.tone,
      dueDateIso: due,
      resultChannel: defaultChannelForStage(opt.stage),
      draftDirty: false,
    });
  }

  function handleLoaded(details: SavedDetails) {
    setState((prev) => applySavedDetails(prev, details));
  }

  function handleClear() {
    skipHistory.current = true;
    setState({
      ...createInitialState(),
      announce: "All fields cleared.",
    });
    window.history.pushState({ step: "landing" }, "", window.location.pathname);
  }

  function handleNextReminder() {
    setState((prev) => {
      const nextStage = Math.min(5, prev.stage + 1) as 1 | 2 | 3 | 4 | 5;
      const channel = defaultChannelForStage(nextStage);
      const base: WizardState = {
        ...prev,
        stage: nextStage,
        step: 4,
        resultChannel: channel,
        draftDirty: false,
        toast: null,
        announce:
          nextStage === prev.stage
            ? "Already on the final stage. Adjust tone if you need another reminder."
            : `Advanced to stage ${nextStage}. Review tone, then see your reminder.`,
      };
      return base;
    });
  }

  function onTouchStart(e: TouchEvent) {
    touchStartX.current = e.changedTouches[0]?.clientX ?? null;
  }

  function onTouchEnd(e: TouchEvent) {
    const start = touchStartX.current;
    touchStartX.current = null;
    if (start === null) return;
    const end = e.changedTouches[0]?.clientX ?? start;
    const dx = end - start;
    if (dx > 80) {
      if (state.step === "landing") return;
      if (state.step === 1) go("landing");
      else if (state.step === 2) go(1);
      else if (state.step === 3) go(2);
      else if (state.step === 4) go(3);
      else if (state.step === 5) go(4);
    }
  }

  const screen = (() => {
    switch (state.step) {
      case "landing":
        return (
          <Landing
            loadError={state.loadError}
            onStart={() => go(1, { loadError: null })}
            onLoaded={(details) => {
              handleLoaded(details);
              patch({ loadError: null });
            }}
            onLoadError={(message) => patch({ loadError: message, announce: message })}
          />
        );
      case 1:
        return <HowLate onBack={() => go("landing")} onChoose={handleHowLate} />;
      case 2:
        return (
          <TheJob state={state} onBack={() => go(1)} onChange={patch} onNext={() => go(3)} />
        );
      case 3:
        return (
          <YouAndPay state={state} onBack={() => go(2)} onChange={patch} onNext={() => go(4)} />
        );
      case 4:
        return (
          <Tone
            state={state}
            onBack={() => go(3)}
            onChange={patch}
            onNext={() => {
              const channel = defaultChannelForStage(state.stage);
              go(5, { resultChannel: channel });
            }}
          />
        );
      case 5:
        return (
          <Result
            state={state}
            onBack={() => go(4)}
            onChange={patch}
            onClear={handleClear}
            onNextReminder={handleNextReminder}
            onRegenerateDraft={regenerateDraft}
          />
        );
      default:
        return null;
    }
  })();

  return (
    <Box onTouchStart={onTouchStart} onTouchEnd={onTouchEnd} sx={{ position: "relative" }}>
      <Box
        component="div"
        aria-live="polite"
        aria-atomic="true"
        sx={{
          position: "absolute",
          width: 1,
          height: 1,
          p: 0,
          m: -1,
          overflow: "hidden",
          clip: "rect(0,0,0,0)",
          whiteSpace: "nowrap",
          border: 0,
        }}
      >
        {state.announce}
      </Box>
      <Fade in key={String(state.step)} timeout={{ enter: 220, exit: 150 }} appear>
        <Box
          sx={{
            "@media (prefers-reduced-motion: reduce)": {
              transition: "none !important",
              animation: "none !important",
            },
          }}
        >
          {screen}
        </Box>
      </Fade>
    </Box>
  );
}
