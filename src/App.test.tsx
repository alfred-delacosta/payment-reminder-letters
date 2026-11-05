/*
 * Copyright (c) 2026 Advanced Software and AI Solutions LLC. All rights reserved.
 */

import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import App from "./App";
import { serializeDetails, createDetails } from "./lib/detailsFile";
import * as share from "./lib/share";

const storageSetItem = vi.fn();
const cookieSetter = vi.fn();

function setField(label: RegExp, value: string) {
  const field = screen.getByLabelText(label) as HTMLInputElement;
  fireEvent.change(field, { target: { value } });
}

async function fillThroughTone(user: ReturnType<typeof userEvent.setup>) {
  render(<App />);
  await user.click(screen.getByRole("button", { name: /start a reminder/i }));
  await user.click(await screen.findByRole("button", { name: /just due/i }));

  await screen.findByRole("heading", { name: /^the job$/i });
  setField(/customer name/i, "Alex Rivera");
  setField(/amount due/i, "2400.00");
  await user.click(screen.getByRole("button", { name: /^continue$/i }));

  await screen.findByRole("heading", { name: /you and how to pay/i });
  setField(/your name/i, "Sam Lee");
  setField(/business name/i, "Lee Plumbing");
  await user.click(screen.getByRole("button", { name: /^check$/i }));
  await user.click(screen.getByRole("button", { name: /^continue$/i }));

  await screen.findByRole("heading", { name: /tone and late fee/i });
}

describe("Payment Reminder Letters wizard", () => {
  beforeEach(() => {
    window.history.replaceState({ step: "landing" }, "", "/");
    vi.stubGlobal(
      "matchMedia",
      vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    );

    vi.spyOn(share, "copyText").mockResolvedValue({ ok: true });
    vi.spyOn(share, "canUseWebShare").mockReturnValue(false);

    const localStorageMock = {
      getItem: vi.fn(),
      setItem: storageSetItem,
      removeItem: vi.fn(),
      clear: vi.fn(),
      key: vi.fn(),
      length: 0,
    };
    vi.stubGlobal("localStorage", localStorageMock);
    vi.stubGlobal("sessionStorage", localStorageMock);

    Object.defineProperty(document, "cookie", {
      configurable: true,
      get: () => "",
      set: cookieSetter,
    });
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    storageSetItem.mockClear();
    cookieSetter.mockClear();
  });

  it("walks landing through result for text channel", async () => {
    const user = userEvent.setup();
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockImplementation(() => {
      throw new Error("network should not be used");
    });
    const xhrOpen = vi.spyOn(XMLHttpRequest.prototype, "open");

    await fillThroughTone(user);
    await user.click(screen.getByRole("button", { name: /see my reminder/i }));

    expect(await screen.findByRole("heading", { name: /your reminder/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /text/i })).toBeInTheDocument();
    const draft = screen.getByLabelText(/^text$/i) as HTMLInputElement;
    expect(draft.value).toContain("Alex Rivera");
    expect(draft.value).toContain("Sam Lee");

    await user.click(screen.getByRole("button", { name: /^copy$/i }));
    expect(share.copyText).toHaveBeenCalledWith(expect.stringContaining("Alex Rivera"));

    expect(fetchSpy).not.toHaveBeenCalled();
    expect(xhrOpen).not.toHaveBeenCalled();
    expect(storageSetItem).not.toHaveBeenCalled();
    expect(cookieSetter).not.toHaveBeenCalled();
  });

  it("supports email and say it channels", async () => {
    const user = userEvent.setup();
    await fillThroughTone(user);
    await user.click(screen.getByRole("button", { name: /see my reminder/i }));
    await screen.findByRole("heading", { name: /your reminder/i });

    await user.click(screen.getByRole("tab", { name: /email/i }));
    expect(screen.getByLabelText(/subject/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /copy subject/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /open in email/i })).toBeInTheDocument();

    await user.click(screen.getByRole("tab", { name: /say it/i }));
    const sayIt = screen.getByLabelText(/say it/i) as HTMLInputElement;
    expect(sayIt.value).toContain("Sam Lee");
  });

  it("shows letter tab for later stages and late fee include toggle", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole("button", { name: /start a reminder/i }));
    await user.click(await screen.findByRole("button", { name: /a month/i }));

    await screen.findByRole("heading", { name: /^the job$/i });
    setField(/customer name/i, "Alex Rivera");
    setField(/amount due/i, "2400.00");
    await user.click(screen.getByRole("button", { name: /^continue$/i }));

    await screen.findByRole("heading", { name: /you and how to pay/i });
    setField(/your name/i, "Sam Lee");
    await user.click(screen.getByRole("button", { name: /^continue$/i }));

    await screen.findByRole("heading", { name: /tone and late fee/i });
    await user.click(screen.getByLabelText(/add a late fee/i));
    // Flat fee avoids month-boundary edge cases in jsdom "today".
    setField(/flat fee amount/i, "36.00");
    await user.click(screen.getByLabelText(/include this in my message/i));
    await user.click(screen.getByRole("button", { name: /see my reminder/i }));

    expect(await screen.findByRole("tab", { name: /letter/i })).toBeInTheDocument();
    await user.click(screen.getByRole("tab", { name: /letter/i }));
    const letter = screen.getByLabelText(/^letter$/i) as HTMLInputElement;
    expect(letter.value.toLowerCase()).toContain("late fee");
    expect(letter.value).toContain("$36.00");
  });

  it("validates required fields", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole("button", { name: /start a reminder/i }));
    await user.click(await screen.findByRole("button", { name: /just due/i }));
    await user.click(await screen.findByRole("button", { name: /continue/i }));
    expect(screen.getByRole("alert")).toHaveTextContent(/customer name is required/i);
  });

  it("loads details from a file and rejects hostile JSON", async () => {
    const user = userEvent.setup();
    render(<App />);

    const good = new File(
      [
        serializeDetails(
          createDetails({
            ownerName: "Pat Owner",
            businessName: "Pat Electric",
            phone: "555-0100",
            methods: ["cash"],
            preferredTone: "firm",
          }),
        ),
      ],
      "payment-reminder-details.json",
      { type: "application/json" },
    );

    const input = screen.getByLabelText(/load my details file/i);
    await user.upload(input, good);
    expect(await screen.findByText(/details loaded from your file/i)).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /start a reminder/i }));
    await user.click(await screen.findByRole("button", { name: /just due/i }));
    await screen.findByRole("heading", { name: /^the job$/i });
    setField(/customer name/i, "Alex");
    setField(/amount due/i, "10.00");
    await user.click(screen.getByRole("button", { name: /^continue$/i }));
    expect(await screen.findByText(/filled from your saved file/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/your name/i)).toHaveValue("Pat Owner");

    cleanup();
    window.history.replaceState({ step: "landing" }, "", "/");
    render(<App />);
    const hostile = new File(
      ['{"schemaVersion":1,"__proto__":{"x":1},"ownerName":"x"}'],
      "bad.json",
      { type: "application/json" },
    );
    const input2 = screen.getByLabelText(/load my details file/i);
    await user.upload(input2, hostile);
    expect(await screen.findByRole("alert")).toHaveTextContent(/disallowed key|could not/i);
  });

  it("clears all state", async () => {
    const user = userEvent.setup();
    await fillThroughTone(user);
    await user.click(screen.getByRole("button", { name: /see my reminder/i }));
    await screen.findByRole("heading", { name: /your reminder/i });
    await user.click(screen.getByRole("button", { name: /^clear$/i }));
    expect(
      await screen.findByRole("heading", {
        name: /get paid without the awkward conversation/i,
      }),
    ).toBeInTheDocument();
  });

  it("supports keyboard continue on the job step", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole("button", { name: /start a reminder/i }));
    await user.click(await screen.findByRole("button", { name: /about a week/i }));
    await screen.findByRole("heading", { name: /^the job$/i });
    setField(/customer name/i, "Alex Rivera");
    setField(/amount due/i, "100");
    await user.click(screen.getByRole("button", { name: /^continue$/i }));
    expect(
      await screen.findByRole("heading", { name: /you and how to pay/i }),
    ).toBeInTheDocument();
  });

  it("keeps empty CTA slots for Phase 2", async () => {
    const user = userEvent.setup();
    await fillThroughTone(user);
    await user.click(screen.getByRole("button", { name: /see my reminder/i }));
    await screen.findByRole("heading", { name: /your reminder/i });
    expect(document.getElementById("pr-footer-contact")).toBeTruthy();
    expect(document.getElementById("pr-results-contact")).toBeTruthy();
    expect(document.querySelector("[data-pulse-cta]")).toBeNull();
  });

  it("exposes FAQ on landing", () => {
    render(<App />);
    expect(screen.getByRole("heading", { name: /^faq$/i })).toBeInTheDocument();
    expect(within(document.body).getByText(/does this send messages/i)).toBeInTheDocument();
  });
});
