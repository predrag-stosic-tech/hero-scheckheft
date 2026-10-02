# Quickstart: Hero Scheckheft

How to run the prototype and prove that it works. Details of data and interfaces are in
[data-model.md](./data-model.md) and [contracts/](./contracts/).

## Prerequisites

- Node.js 22 or newer and npm (checked on this machine: Node 24, npm 11)
- A Chromium-based browser for the install and offline checks
- A phone on any network, for the QR check against the deployed address

## Commands

| Purpose | Command |
|---------|---------|
| Install | `npm install` |
| Develop | `npm run dev` (http://localhost:5173) |
| Type-check | `npm run typecheck` |
| Lint | `npm run lint` |
| Unit tests | `npm run test` |
| Smoke test (story 1) | `npm run test:e2e` |
| Production build | `npm run build` |
| Serve the build locally | `npm run preview` (service worker active) |
| Deploy | `npx vercel --prod` |

Offline, install and QR checks are done against `npm run preview` or the deployed address,
not against the dev server.

## Demo order

Always start with "Demo zurücksetzen". Show the stories in this order; S2 must come before
the second incoming entry, because that entry is the Heizungswartung and moves its due date.

### S1 — aha (1440 px wide, `/betrieb`)

1. Click "Prüfung elektrischer Anlagen – Lindenstraße 12" on the Startseite.
2. Click "Abschließen". Expect the toggle "Ins Scheckheft des Kunden übertragen" on and
   "Nächste Prüfung in 4 Jahren · Empfehlung".
3. Confirm.

Expect in the phone preview, after a short loader and with no further click: toast "Elektro
Stosic hat einen Eintrag hinzugefügt"; new entry at the top of Historie with Protokoll, Fotos
and Rechnung; "Strom" changes from "bald fällig" to "in Ordnung"; a new due date four years
out. Three clicks, under 60 seconds.

### S2 — re-booking (`/m` or the preview)

1. On Übersicht, "Heizungswartung · fällig in 21 Tagen · zuletzt: SHK Becker" → "Termin
   anfragen" → confirm.
2. Demo-Steuerung → "Betrieb SHK Becker" → Board.

Expect a card in "Anfragen aus dem Scheckheft". Switch to Elektro Stosic: no such card.

Then Demo-Steuerung → "SHK Becker sendet Wartungsbericht + Rechnung". Expect a new Heizung
entry, a toast, the card marked done, and the heating due date one year out.

### S3 — sale (`/m`)

1. "Verkaufsmappe teilen" → keep the preselected contents and 30 days → create.
2. Open the link in a new tab; scan the QR code with a phone (deployed address only).

Expect the badge "scheckheftgepflegt", object summary, history, expiry date, no navigation.
Change one character of the token: expect "nicht mehr verfügbar".

### S4 — upgrade (`/eigentuemer`)

1. Click a locked item (crown) → gold modal → upgrade. Expect the loader "Dein Scheckheft
   wird erweitert…", then "ETW Venloer Straße 8, Wohnung 3" and the graph with a gold "Neu"
   pulse. Click a graph node: neighbours highlighted, document opens.
2. Click a Pro item → upgrade. Expect the workspace "Rheinblick Hausverwaltung" with 12
   objects, dashboard, cross-object graph with filters, "Frag dein Scheckheft".
3. Ask "Wann war die letzte Heizungswartung?". Expect an answer marked as suggestion with
   source chips that open documents.
4. Workspace switcher → "Familie Schneider": two objects, plan Advanced, Pro items locked.

### S5 — foreign upload (`/m`)

1. "Dokument hinzufügen" → "Beispielrechnung verwenden".
2. Expect a loader, then a suggestion card (Gewerk, Anlage, Datum, Kosten, Intervall ·
   Empfehlung) with the source document. "Übernehmen".

Expect the entry in Historie and the invoice in Dokumente.

## Acceptance checks

| Check | How | Pass |
|-------|-----|------|
| Types, lint, unit tests | `npm run typecheck && npm run lint && npm run test` | no errors |
| S1 click budget | `npm run test:e2e` | 3 clicks, entry visible in the preview frame |
| Reload keeps state | reload after each story | nothing lost |
| Reset | "Demo zurücksetzen" after all stories | initial state; S1 works again |
| No duplicates | trigger both scenarios twice in the Demo-Steuerung | one entry each |
| Offline | load the build once, switch the network off in DevTools, reload, run S1–S5 | all work |
| Install | Chrome on Android or desktop at `/m` | install offered; opens standalone on Übersicht |
| Accessibility | Lighthouse (mobile) on `/m`, `/m/historie`, `/m/dokumente` | accessibility ≥ 90 each |
| Console | DevTools console during S1–S5 | no errors |
| Widths | 360, 768, 1440 px on every route in [contracts/routes.md](./contracts/routes.md) | no horizontal scroll, nothing clipped |
| Keyboard | Tab through S1 and S2 without a mouse | every step reachable, focus visible |
| Touch targets | `/m` at 360 px | every control at least 48 × 48 px |
| Honesty | search the UI and fixtures for "konform" | no hit; every interval reads "Empfehlung"; prototype chip on every route |
| Native look | each screen beside `docs/reference-ui/reference-ui/*.png` | no visible deviation in layout, colour, shape, wording |
| Corrupt state | set the `hero-scheckheft` key in localStorage to `x`, reload | starts from the initial state |
| First paint | Lighthouse (mobile) on `/m` | first contentful paint under 1.5 s |
| QR on a second device | scan the S3 code from the deployed address | same Verkaufsmappe within 5 s |

## Before the presentation

- Deploy, then open the deployed address once on the presentation machine while online.
- Run "Demo zurücksetzen".
- Set the browser window to at least 1440 px wide so the phone preview is visible.
