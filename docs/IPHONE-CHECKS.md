<!--
  Copyright (c) 2026 Advanced Software and AI Solutions LLC. All rights reserved.
-->

# iPhone Safari checklist

Manual checks for Payment Reminder Letters on iPhone Safari (and desktop responsive mode at 390 px). Complete on a real device when reviewing PR 2.

## Viewport and layout

| Check | How | Expected |
| --- | --- | --- |
| 320-430 px width | Rotate / responsive mode | No page-level horizontal scroll |
| 390 px light | DevTools device mode | Landing H1 readable; primary CTA full width |
| 390 px dark | `prefers-color-scheme: dark` | Cobalt Saffron dark roles; AA contrast |
| 16 px inputs | Focus amount / phone | No Safari zoom on focus |
| 48 px targets | Tone toggles, chips, buttons | Comfortable tap targets |
| Reflow | 320 px and 200 percent zoom | Content stacks; no clipped controls |
| Pinned footer | Scroll long result | Focus and buttons not hidden by footer |
| Reduced motion | Accessibility setting on | Screens swap instantly; no chip scale / copy pop |

## Wizard flow

| Check | How | Expected |
| --- | --- | --- |
| How late chips | Tap each | Advances; tone and due date preset |
| Back | Header Back | Keeps prior entries |
| Swipe back | Swipe right | Same as Back; entries kept |
| Load details | JSON file | Prefills owner fields; shows filled banner |
| Save details | Screen 3 | Downloads `payment-reminder-details.json` only |
| Late fee | Enable + include | Formula shows; letter line only when included |
| Result tabs | Text / Email / Letter / Say it | Available tabs match stage; draft editable |
| Copy toast | Copy | "Copied. Paste it into your texts." |
| Clear | Clear | Returns to landing; fields wiped |

## Privacy and offline

| Check | How | Expected |
| --- | --- | --- |
| Storage | Safari Web Inspector | No localStorage / sessionStorage / cookies from the app |
| Network after load | Airplane mode | Reminder still builds, copies, and prints |
| History | Inspect state | Step number only; no form values in URL or history |

## Print

| Check | How | Expected |
| --- | --- | --- |
| Print letter | Share -> Print / Save PDF | Clean letter, 1 in margins, black on white |
| No chrome | Printed page | No app UI, no credit, no disclaimer, no link URLs |
| Signature | Multi-page edge case | Closing block kept together |
| Home Screen | Standalone if added | Share -> Print hint when `window.print` is weak |

## Keyboard and VoiceOver smoke

| Check | How | Expected |
| --- | --- | --- |
| Keyboard only | Tab / Enter | Full path landing to result |
| Focus on step | Enter each step | Focus moves to the new heading |
| Errors | Submit empty required | Errors announced (alert / live region) |
| Labels | VoiceOver | Fields and chips have accessible names |
