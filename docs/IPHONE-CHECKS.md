# iPhone Safari checklist

Manual checks for Payment Reminder Letters on iPhone Safari. Complete on a real device when reviewing PR 2 screens. Phase 1 ships core logic only.

## Viewport and layout (PR 2)

| Check | How | Expected |
| --- | --- | --- |
| 320-430 px width | Rotate / responsive mode | No page-level horizontal scroll |
| 16 px inputs | Focus amount / phone | No Safari zoom on focus |
| 48 px targets | Tone toggles, chips, buttons | Comfortable tap targets |
| Reduced motion | Accessibility setting on | Screens swap instantly |

## Privacy

| Check | How | Expected |
| --- | --- | --- |
| Storage | Safari Web Inspector | No localStorage / cookies from the app |
| Offline after load | Toggle airplane mode | Reminder still builds, copies, and prints |

## Print (PR 2)

| Check | How | Expected |
| --- | --- | --- |
| Print letter | Share -> Print / Save PDF | Clean letter, no app chrome, no credit or disclaimer on the page |
