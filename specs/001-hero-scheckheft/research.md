# Research: Hero Scheckheft

**Feature**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md) | **Date**: 2026-09-30

The stack was given with the plan request. This document records the decisions that were still
open, and the places where the given stack had to be reconciled with the spec or the
constitution. Library versions are pinned at install time (latest stable of the named major);
none of the decisions below depends on a specific minor version.

## R1. Reference UI findings

Reviewed `docs/reference-ui/reference-ui/ph-ui-{01,02,05,13,14,16,20,22,25}.png`.

- **Decision**: The given tokens are adopted as the single source of colour, radius and type.
  Observed patterns that the components must reproduce:
  - Sidebar (~190 px, `#FAFAFA`, right border): wordmark + collapse icon, workspace switcher
    (avatar tile, name, plan as muted second line, chevrons), nav items with outline icons,
    expandable groups with indented sub-items (Aufgaben → Kalender, Einsatzplanung, Board),
    a small gold crown pill on locked items, "Mehr" section, plan card, user row.
  - Plan card: title ("Free Plan"), usage line with a thin progress bar, renewal line, full
    width gold "Upgrade" button with crown icon.
  - Content: toolbar row with pill filters (active pill black with white text, inactive grey
    tint, count inside the pill) on the left; "Filter", view icon, search field and a black
    primary button on the right.
  - Cards: white, 1 px `#E5E5E5` border, 12 px radius, very soft shadow. Empty states are a
    centred card with a round grey icon tile, title, muted text and a black button.
  - Startseite: greeting row with action buttons, "Tagesüberblick" card with four stat tiles
    (tinted icon tile, small label, large number), segmented tabs, and a "Benachrichtigungen"
    panel on the right with "Ungelöst / Erledigt" tabs.
  - Upgrade modal: two columns; left has a round tinted icon, bold title, muted text, a crown
    line "Verfügbar ab dem Hero-Tarif.", and "Nicht jetzt" + gold button with crown icon;
    right has a warm-tinted panel with a schematic illustration and a round close button.
  - Gold is used with white text on the "Upgrade" buttons and with dark text on "Jetzt kaufen"
    and the "Beliebt" pill.
  - Floating round black button with a white "P" glyph at the bottom right.
- **Rationale**: Principle I makes these screenshots binding.
- **Alternatives considered**: Sampling more exact colours from the images; rejected because
  the given tokens are within a few units of what the images show and a single token list is
  easier to keep consistent.
- **Not in the reviewed screenshots**: an Einreichung detail screen and an approval card were
  not among the nine reviewed images. The remaining 17 images must be checked for them before
  the Einreichung detail is built; if absent, the detail is composed from the card, pill and
  toolbar patterns above.

## R2. Font delivery

- **Decision**: Inter is self-hosted (`@fontsource-variable/inter`, latin subset, preloaded,
  `font-display: swap`), not loaded from Google Fonts.
- **Rationale**: The constitution (II) forbids a network dependency at demo time and the spec
  (FR-040, SC-005) requires offline operation. A Google Fonts request fails offline on first
  paint of a new device and would need cross-origin runtime caching.
- **Alternatives considered**: Google Fonts with service-worker runtime caching; rejected, it
  only works after a successful first online load of the font CSS and adds a third-party
  request to a prototype that must send nothing anywhere.

## R3. Contrast of the given tokens

- **Decision**:
  - White text on gold `#C2B27A` is about 2.1:1 and fails AA. It is kept only where the
    reference shows it (plan-card "Upgrade" button, upgrade-modal CTA) in the desktop shells.
    Everywhere else, and on all of `/m`, text on gold is `#111111` (about 8.9:1), a pairing the
    reference also uses ("Jetzt kaufen", "Beliebt").
  - Success pill text is darkened from `#1F8A4C` (about 3.9:1 on `#E7F6EC`) to `#17703C`
    (about 5.5:1). `#1F8A4C` stays available as the success icon/dot colour.
  - Danger `#D93F3F` is about 4.4:1 on white; it is used for icons, dots and borders. Danger
    text uses `#C23030`.
  - Muted `#6B6B6B` passes on white and on `#FAFAFA`.
- **Rationale**: Principle I outranks VI, but only where the reference actually shows the
  failing pairing. The `/m` surface must reach an accessibility score of at least 90 (SC-004).
- **Alternatives considered**: Dark text on all gold buttons; rejected, the plan-card button
  is the most recognisable element of the reference.

## R4. Tailwind and token setup

- **Decision**: Tailwind CSS v4 with tokens declared once in `src/styles/tokens.css` as CSS
  variables and exposed through `@theme`. An ESLint rule blocks hex literals and arbitrary
  colour values in class names outside `tokens.css`.
- **Rationale**: One file is the token source for both CSS variables and utilities, which is
  what "CSS variables and Tailwind theme tokens; no ad-hoc colors" asks for.
- **Alternatives considered**: Tailwind v3 with a JS config; works, but duplicates the token
  list in two places.

## R5. Workspaces and plans in the store

- **Decision**: The `plan` slice is per owner workspace, not a single global value:
  `familyPlan: 'kostenlos' | 'advanced'`, `proReached: boolean`, `activeOwnerWorkspace`. The
  effective plan is derived: Rheinblick Hausverwaltung is always `pro`. `featureGate(plan,
  feature)` stays as given and receives the effective plan.
- **Rationale**: Clarification 4 and FR-026a: upgrading to Pro switches to the Rheinblick
  workspace while Familie Schneider stays on Advanced.
- **Alternatives considered**: One global `plan`; rejected, it cannot show Familie Schneider on
  Advanced after Pro was reached.

## R6. What is persisted

- **Decision**: Fixtures are never persisted. The store persists only what happened in the
  demo (completed Einreichungen, added entries with absolute dates, appointment requests, share
  links, notifications, plan state, active workspaces, preview visibility). Objects, Anlagen,
  rules and the base history come from `src/mocks` on every load, built relative to today. Due
  items and board cards are derived by selectors. The slices named in the plan request remain,
  with `objects`, `anlagen` and `rules` as read-only selectors over the fixtures.
- **Rationale**: Fixture dates are relative to today (spec assumption). Persisting them would
  freeze "fällig in 21 Tagen" at the day of first load. Persisting only events also makes
  "Demo zurücksetzen" a single state replacement and keeps the persisted payload small.
- **Alternatives considered**: Persisting the full dataset after seeding; rejected for the
  stale-date problem.
- **Corrupt or outdated state**: the persisted payload carries a schema version; on mismatch
  or parse failure the store starts from the initial state.

## R7. Due dates are derived, not stored

- **Decision**: A due item is computed from a rule and the latest matching entry:
  `nextDueDate(rule, lastEntry)`. Completing an Einreichung adds an entry; the new due date,
  the green status of the Gewerk and the calendar item follow from that one write. An interval
  edited in the closing dialog or the suggestion card is stored on the entry and overrides the
  rule's default for that entry.
- **Rationale**: One write produces all three visible effects of story 1, which removes the
  chance of them disagreeing. It also makes the logic the constitution wants unit-tested the
  logic that actually drives the demo.
- **Consequence for the demo order**: the prepared incoming entry from SHK Becker is a
  Heizungswartung. Triggering it before story 2 moves the heating due date a year out, and the
  "fällig in 21 Tagen" item is gone. Story 2 is shown first; triggering the SHK entry
  afterwards closes the loop (the request's board card is marked done). See quickstart.

## R8. Live phone preview beside the Betrieb view

- **Decision**: The preview (FR-035a) is an `<iframe>` of `/m?embed=1` in a phone frame,
  rendered by the demo layer outside the AppShell at viewport widths of 1440 px and above. The
  store listens to the `storage` event and rehydrates, so a write in the Betrieb frame reaches
  the preview immediately. Owner surfaces show a toast for every notification that arrives
  after they were loaded. `embed=1` hides the Demo-Steuerung button inside the frame.
- **Rationale**: Tailwind breakpoints follow the viewport. Rendering the phone components
  inline in a 1440 px page would apply desktop styles; an iframe gives them a real 390 px
  viewport, their own toast region and their own focus order with no extra code paths.
- **Alternatives considered**: Inline render with container queries; rejected, it needs every
  mobile component written twice over and a scoped toast system. BroadcastChannel; not needed,
  the `storage` event already fires across same-origin frames and tabs.

## R9. Share links that work on another device

- **Decision**: The token in `/share/:token` is a base64url-encoded, versioned JSON payload
  holding: object id, chosen sections, creation date, expiry date and the ids and dates of the
  entries added during the demo. The share view rebuilds the Verkaufsmappe from the bundled
  fixtures, anchored to the creation date in the token, plus those entries. Format in
  [contracts/share-token.md](./contracts/share-token.md). QR code rendered with `qrcode.react`.
- **Rationale**: Clarification 2 and FR-023a. Every device already has the fixtures in the
  bundle, so the link only needs to carry the choices and the few demo-created entries. That
  keeps the URL short enough for a QR code that scans easily from a projector.
- **Alternatives considered**: Embedding the full snapshot (too long for a comfortable QR
  code); a fixed prepared link (rejected in clarification).
- **Honest limit**: the token is not secret or tamper-proof. It is a prototype of the sharing
  flow, not of access control; the share view shows the prototype label like every surface.

## R10. Graph

- **Decision**: `@xyflow/react` with custom node types and a static layered layout computed
  once with `@dagrejs/dagre`. Nodes are not draggable and not connectable; selection highlights
  the node and its neighbours and dims the rest. Viewport pan and zoom are enabled with
  `fitView` and the standard controls. Below 768 px the same relations are rendered as a
  grouped list (FR-029c). Nodes are focusable buttons. The graph is its own lazy chunk.
- **Rationale**: The plan request asks for pan/zoom on mobile; the clarification ruled out
  dragging nodes and re-layout. Pan and zoom of the viewport are built into the library and
  cost nothing, so both are satisfied: fixed arrangement, movable viewport. The list keeps the
  relations reachable by keyboard and screen reader and avoids horizontal scrolling at 360 px.
- **Spec alignment**: the sentence in FR-029a that excluded zooming and panning was amended to
  exclude only node dragging and re-arrangement.
- **Alternatives considered**: Hand-placed SVG; cheaper for one object but does not scale to
  the Pro graph across 12 objects with filters.

## R11. Scripted chat

- **Decision**: A pure function `matchIntent(question)` maps keywords to one of a handful of
  prepared answers, each with source-document ids. The UI offers the prepared questions as
  tappable chips; a free-text field exists but unmatched input gets a fixed fallback ("Dazu
  finde ich nichts in deinen Dokumenten") with no sources. Typing indicator 800 ms. Banner
  "Antworten basieren nur auf Dokumenten dieses Objekts". Each answer is labelled "Vorschlag".
- **Rationale**: FR-033 and Principle V. Chips keep the demo on the scripted path.
- **Alternatives considered**: Chips only, no text field; rejected, a chat without an input
  does not read as a chat in the reference style.

## R12. Documents and exports

- **Decision**: Document previews are rendered by one `DocumentPreview` component that draws
  a paper-like page (Protokoll, Rechnung, Garantie) from the entry's data, with the prototype
  label as a watermark. Photos are original SVG placeholders. "Verkaufsmappe als PDF" opens
  the share view with a print stylesheet and calls the browser's print dialog. Bulk export
  shows a simulated progress and a summary dialog of what would be exported.
- **Rationale**: No binary assets to create or cache, every document stays consistent with its
  entry, and the PDF export produces a real file through the browser without a PDF library.
- **Alternatives considered**: Bundled sample PDFs; rejected, they would not match entries
  added during the demo and add weight to the offline cache.

## R13. Simulated upload extraction

- **Decision**: The upload sheet offers "Foto aufnehmen / auswählen" (a real file input whose
  content is only used as the thumbnail) and "Beispielrechnung verwenden". Either way
  `simulate(1200)` runs and the same prepared suggestion is shown.
- **Rationale**: Works without a camera, requires no typing, and the owner's own photo appears
  as the source document, which is what makes the suggestion believable.

## R14. PWA and offline

- **Decision**: `vite-plugin-pwa` in `generateSW` mode, precaching the full build output
  (all route chunks, fonts, icons), `registerType: 'autoUpdate'`, `navigateFallback` to
  `index.html`. One app-wide service worker; manifest `start_url: /m`, `display: standalone`,
  name "Hero Scheckheft", theme colour `#111111`, icons (192, 512, maskable) generated from an
  original glyph. `<meta name="robots" content="noindex">`.
- **Rationale**: Precaching every chunk is what makes "works offline after first load" true
  for routes the presenter has not visited yet. Lighthouse no longer reports a PWA score, so
  installability is verified through the browser's install prompt and manifest checks.
- **Alternatives considered**: Runtime caching only; rejected, unvisited lazy routes would
  fail offline.

## R15. Routing and hosting

- **Decision**: React Router (library mode, `createBrowserRouter`) with lazy route modules for
  `/betrieb/*`, `/eigentuemer/*`, `/m/*` and `/share/:token`; `/` redirects to `/betrieb`. The
  active Betrieb and owner workspace live in the store, not in the URL. Sidebar items that are
  not part of the demo lead to one shared empty-state page in the reference style. Static
  build on Vercel with a catch-all rewrite to `index.html`.
- **Rationale**: Public hosting is required for the QR scan (clarification 2). Keeping the
  workspace out of the URL lets the workspace switcher and the Demo-Steuerung share one action.
- **Alternatives considered**: Hash routing (no rewrites needed); rejected, the share link
  should look like a real link.

## R16. Simulated latency

- **Decision**: `simulate(ms)` returns a promise; callers pass a fixed value within 600–1500
  ms (complete Einreichung 900, upgrade 1200, extraction 1200, share link 700, appointment
  request 700, chat 800). State is written only after the delay resolves, in one store action.
  In tests the delay is replaced by zero through a module-level setting.
- **Rationale**: Principle II range; one write after the delay means a reload mid-delay leaves
  no half-finished state (edge case in the spec).

## R17. Testing scope

- **Decision**: Vitest for `src/domain` (due dates, status, feature gate, share token
  encode/decode, intent matching) with an injected `today`. One Playwright smoke test for
  story 1 at 1440 px that asserts the new entry inside the preview frame and counts clicks.
- **Rationale**: Constitution: deterministic logic is unit-tested; Principle VII: no more test
  surface than the demo needs.

## R18. Branding assets

- **Decision**: The wordmark is set as text in Inter. The floating button and the PWA icons
  use an original glyph drawn for the prototype. No ProtocolHero logo file is copied.
  Illustrations in upgrade modals are original schematic SVGs in the style of the reference.
- **Rationale**: Given constraint; also keeps the repository free of third-party assets.

## Open points for the project owner

- **Plan names**: ProtocolHero's own plans are Kostenlos, Standard, Hero and Enterprise, and
  its upgrade button reads "Auf Hero upgraden". The Scheckheft plans are named Kostenlos,
  Advanced and Pro as specified. If the Scheckheft tiers should map onto the existing plan
  names, only fixture strings and modal copy change.
- **Reference path**: the constitution names `docs/reference-ui/*.png`; the files are in
  `docs/reference-ui/reference-ui/`.
