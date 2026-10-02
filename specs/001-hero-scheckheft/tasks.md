---

description: "Task list for the Hero Scheckheft prototype"
---

# Tasks: Hero Scheckheft

**Input**: Design documents from `/specs/001-hero-scheckheft/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Included where the constitution and plan require them: unit tests for the pure
domain logic, and one Playwright smoke test for story 1. No other tests.

**Organization**: Tasks are grouped by user story. The order follows the requested demo
order: S1 end to end first, then S2, S3, S4, S5. Story labels map to the spec:

| Label | Spec story | Demo story |
|-------|-----------|------------|
| US1 | Completed inspection appears in the owner's Scheckheft | S1 |
| US2 | Owner requests the next appointment | S2 |
| US3 | Owner shares a Verkaufsmappe | S3 |
| US7 | Owner browses the Scheckheft (documents, Eigentümer Web) | prerequisite for S4 |
| US4 | Upgrade path | S4 |
| US5 | Owner adds an invoice from another company | S5 |
| US6 | Presenter steers the demo (scenario triggers, plan setting) | — |
| US8 | Betrieb sees what is due at its customers | — |

US7 sits between S3 and S4 because S4 is shown in Eigentümer Web, which US7 builds. A minimal
Demo-Steuerung (switch view, reset) is foundational; US6 adds the rest.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: Which user story the task belongs to
- All paths are relative to the repository root

## Conventions for every task

- UI text German, du-Form; code and comments English.
- Colours, radii and font sizes only from `src/styles/tokens.css`. No hex values elsewhere.
- Every interval shown is followed by "· Empfehlung". No "konform" anywhere.
- Reference images: `docs/reference-ui/reference-ui/ph-ui-01.png` … `ph-ui-26.png`.
- Data shapes: `specs/001-hero-scheckheft/data-model.md`. Function signatures, feature gate
  and store actions: `specs/001-hero-scheckheft/contracts/domain.md`. Routes:
  `specs/001-hero-scheckheft/contracts/routes.md`.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization

- [X] T001 Scaffold a Vite + React 18 + TypeScript project at the repository root (`package.json`, `index.html`, `vite.config.ts`, `tsconfig.json`, `src/app/main.tsx`), keeping the existing `.claude/`, `.specify/`, `docs/` and `specs/` directories untouched; set `"strict": true` and the `@/` → `src/` path alias
- [X] T002 Install dependencies in `package.json`: react-router, tailwindcss v4 with `@tailwindcss/vite`, zustand, date-fns, sonner, lucide-react, the Radix packages for dialog, sheet, tabs, switch, tooltip and dropdown-menu, class-variance-authority, clsx, tailwind-merge, qrcode.react, @xyflow/react, @dagrejs/dagre, @fontsource-variable/inter, vite-plugin-pwa; dev: vitest, @playwright/test, eslint, prettier, typescript-eslint
- [X] T003 [P] Add scripts `dev`, `build`, `preview`, `typecheck`, `lint`, `test`, `test:e2e` to `package.json` and create `eslint.config.js` and `.prettierrc`, including a lint rule that reports hex colour literals and Tailwind arbitrary colour values in `src/**/*.tsx`
- [X] T004 [P] Create `vercel.json` with a catch-all rewrite to `/index.html`, and add `<meta name="robots" content="noindex">`, `lang="de"` and the title "Hero Scheckheft" to `index.html`
- [X] T005 [P] Configure Vitest in `vite.config.ts` (include `src/**/*.test.ts`) and Playwright in `playwright.config.ts` (test dir `tests/e2e`, web server `npm run preview`, viewport 1440 × 900)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Tokens, shell, domain logic, fixtures and store that every story needs

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Tokens and primitives (foundational)

- [X] T006 Create `src/styles/tokens.css`: CSS variables and Tailwind `@theme` tokens for text `#111111`, muted `#6B6B6B`, border `#E5E5E5`, sidebar `#FAFAFA`, primary `#171717`, gold `#C2B27A`, gold tint `#F6F2E3`, success bg `#E7F6EC`, success text `#17703C`, success icon `#1F8A4C`, danger `#D93F3F`, danger text `#C23030`, card radius 12 px, base font size 14 px, a soft card shadow, and a visible focus ring; import self-hosted Inter from `@fontsource-variable/inter` and set it as the body font
- [X] T007 [P] Create restyled primitives in `src/components/ui/`: `button.tsx` (variants primary black, outline, ghost, gold, gold-dark-text; sizes default and `touch` with min-height 48 px), `pill.tsx` (active black / inactive grey, optional count), `badge.tsx` (success "Kostenlos", gold "Neu", gold crown), `dialog.tsx`, `sheet.tsx`, `tabs.tsx` (segmented style as in ph-ui-25), `switch.tsx`, `tooltip.tsx`, `dropdown-menu.tsx`; plus `src/lib/cn.ts`
- [X] T008 [P] Create `src/lib/simulate.ts` (`simulate(ms)` promise with a module-level override to zero for tests) and `src/lib/format.ts` (German date formats with date-fns `de`, euro from cents, relative "fällig in N Tagen" / "seit N Tagen überfällig", months to "4 Jahren" / "6 Monaten")

### Shell (foundational)

- [X] T009 Create `src/components/shell/Sidebar.tsx`, `WorkspaceSwitcher.tsx`, `PlanCard.tsx` and `AppShell.tsx` matching ph-ui-05, ph-ui-14 and ph-ui-25: text wordmark "ProtocolHero" with collapse icon, workspace switcher (avatar tile, name, plan line, chevrons, dropdown), nav items with lucide outline icons and expandable sub-items, "Mehr" section (Vorlagen, Papierkorb, Hilfe), plan card with usage bar and gold "Upgrade" button with crown, user row; nav items come from a config prop so Betrieb and Eigentümer can differ; below 768 px the sidebar becomes a slide-in sheet opened from a header button
- [X] T010 [P] Create `src/components/shell/PageHeader.tsx` (title, pill filter slot, right-side actions, search field) and `src/components/shell/PrototypeChip.tsx` showing "Konzept-Prototyp · fiktive Daten"; render the chip in the AppShell header
- [X] T011 [P] Create `src/components/shell/MobileShell.tsx` and `BottomTabs.tsx`: header with object name and the prototype chip, content area, three bottom tabs Übersicht / Historie / Dokumente as links with icon and label, each at least 48 px high, safe-area padding
- [X] T012 [P] Create shared components in `src/components/scheckheft/`: `Card.tsx`, `PillFilter.tsx`, `StatTile.tsx` (as "Tagesüberblick" in ph-ui-25), `EmptyState.tsx` (as ph-ui-02), `GewerkStatusPill.tsx` (text + icon + colour for "in Ordnung", "bald fällig", "überfällig")

### Domain logic with unit tests (foundational)

- [X] T013 [P] Define all types and enums from data-model.md in `src/domain/types.ts`, with German display-label maps for Gewerk, DokumentTyp, GewerkStatus and Plan
- [X] T014 [P] Implement `nextDueDate`, `dueStatus`, `gewerkStatus` and `validateIntervalMonths` in `src/domain/due.ts` and cover every case listed in contracts/domain.md in `src/domain/due.test.ts` (`today` always passed in)
- [X] T015 [P] Implement `featureGate(plan, feature)` in `src/domain/featureGate.ts` per the table in contracts/domain.md and test every feature × plan combination in `src/domain/featureGate.test.ts`

### Fixtures and store (foundational)

- [X] T016 Create `src/mocks/index.ts` exporting `buildFixtures(today)` with modules `src/mocks/betriebe.ts`, `workspaces.ts` (Familie Schneider only for now), `lindenstrasse.ts` (object, 7 Anlagen, rules covering heating, water, electricity, smoke detectors, chimney, roof, and about 25 entries over 3–4 years with costs and documents from the four companies); dates relative to `today`, with the last Heizungswartung by SHK Becker at `today + 21 days − 12 months` and the last "Prüfung elektrischer Anlagen" at `today + 14 days − 48 months`
- [X] T017 Create the store in `src/store/`: `initialState.ts`, `index.ts` (Zustand with persist, key `hero-scheckheft`, schema version, fall back to `initialState` on parse failure or version mismatch, rehydrate on the window `storage` event), slices `plan`, `entries`, `einreichungen`, `termine`, `shareLinks`, `notifications`, `demo` per data-model.md, and actions `resetDemo`, `setActiveBetrieb`, `setActiveOwnerWorkspace`, `setPreviewVisible`, `markNotificationsRead`
- [X] T018 Create `src/store/selectors.ts`: `allEntries`, `dueItems`, `gewerkStatusByObjekt`, `visibleObjekte`, `effectivePlan`, using `buildFixtures(today)` memoised per day and the domain functions
- [X] T019 Create `src/app/router.tsx` (lazy route groups `/betrieb/*`, `/eigentuemer/*`, `/m/*`, `/share/:token`, `/` and unknown paths redirect to `/betrieb`, shared "Nicht Teil dieser Demo" empty-state route for other sidebar targets) and `src/app/providers.tsx` (sonner Toaster, tooltip provider); wire both in `src/app/main.tsx`
- [X] T020 Create `src/features/demo/DemoControl.tsx`: round black floating button bottom-right with an original "P"-style glyph (as ph-ui-14, not the ProtocolHero logo file), opening a "Demo-Steuerung" panel with view switch (Betrieb Elektro Stosic / Betrieb SHK Becker / Eigentümer Web / Eigentümer Mobile) and "Demo zurücksetzen" with confirmation; hidden on `/share/*` and when the URL has `embed=1`; mount it in `src/app/providers.tsx`

**Checkpoint**: `npm run typecheck`, `npm run lint` and `npm run test` pass; empty shells render at `/betrieb` and `/m` and look like the reference

---

## Phase 3: User Story 1 — Completed inspection appears in the owner's Scheckheft (Priority: P1) 🎯 MVP — demo story S1

**Goal**: From `/betrieb`, three clicks complete the Einreichung "Prüfung elektrischer Anlagen – Lindenstraße 12" and the entry, the green "Strom" status, the next due date and the toast appear in the owner's phone preview.

**Independent Test**: Reset the demo at 1440 px, click the Einreichung, "Abschließen", confirm. The preview shows the new entry at the top of Historie with Protokoll, Fotos and Rechnung, "Strom" reads "in Ordnung", a due date four years out exists, and the toast "Elektro Stosic hat einen Eintrag hinzugefügt" appears.

### Tests for User Story 1

- [X] T021 [P] [US1] Write the Playwright smoke test `tests/e2e/s1.spec.ts`: open `/betrieb` with cleared storage at 1440 px, perform exactly three clicks (Einreichung, "Abschließen", confirm), then assert inside the preview iframe that the toast text and the new entry title are visible and the Strom status reads "in Ordnung"

### Implementation for User Story 1

- [X] T022 [P] [US1] Add Einreichungen to `src/mocks/einreichungen.ts` (the story-1 Einreichung for Elektro Stosic with Bezugspunkt object Lindenstraße 12, one open Einreichung with a non-object Bezugspunkt, two for SHK Becker) and the scenario `s1-elektro` to `src/mocks/scenarios.ts` (entry with Protokoll, three Fotos, Rechnung, cost, rule "Prüfung elektrischer Anlagen" with 48 months)
- [X] T023 [US1] Add the action `completeEinreichung(id, { transfer, intervalMonths })` to `src/store/index.ts`: await `simulate(900)`, then in one write mark the Einreichung completed and, if `transfer`, add the entry with absolute date and interval override and an owner notification "Elektro Stosic hat einen Eintrag hinzugefügt"; no-op if already completed
- [X] T024 [P] [US1] Create `src/features/betrieb/BetriebLayout.tsx` (AppShell with the Betrieb nav config: Startseite, Einreichungen, Aufgaben → Kalender / Einsatzplanung with crown / Board, Chat → Allgemein, Protokolle, Datenbanken) and `src/features/betrieb/Startseite.tsx` at `/betrieb` modelled on ph-ui-25: greeting row, "Tagesüberblick" stat tiles, a "Heute" card listing the open Einreichungen of the active Betrieb as links (the story-1 Einreichung first), and the "Benachrichtigungen" panel
- [X] T025 [P] [US1] Create `src/features/betrieb/Einreichungen.tsx` at `/betrieb/einreichungen` (pill filters Alle / Offen / Abgeschlossen with counts, list of cards) and `src/features/betrieb/EinreichungDetail.tsx` at `/betrieb/einreichungen/:id` (title, Bezugspunkt, Kunde, protocol summary, photo thumbnails, invoice line, black "Abschließen" button; completed state shows a success pill and no button)
- [X] T026 [US1] Create `src/features/betrieb/ClosingDialog.tsx`: switch "Ins Scheckheft des Kunden übertragen" (default on when the Bezugspunkt is an object, else off), editable interval shown as "Nächste Prüfung in 4 Jahren · Empfehlung" with validation through `validateIntervalMonths` (invalid input keeps the previous value), confirm button "Abschließen und übertragen" / "Abschließen" with loader during the delay; on narrow screens the success toast offers "Im Scheckheft ansehen" linking to `/m/historie`
- [X] T027 [P] [US1] Create `src/components/scheckheft/EntryCard.tsx` (date, company, title, cost, Gewerk, document type chips, "automatisch übertragen" / "selbst hinzugefügt" marker), `Timeline.tsx` (entries grouped by Gewerk Strom, Heizung, Wasser, Sicherheit, Dach, newest first, with the Gewerk status pill per group) and `DueItemCard.tsx` (title, "fällig in N Tagen", "zuletzt: company", "Empfehlung" label, action slot)
- [X] T028 [US1] Create `src/features/mobile/Historie.tsx` at `/m/historie` and `src/features/mobile/Uebersicht.tsx` at `/m` (object summary, Gewerk status row, next due items by urgency) inside `MobileShell`, with all targets at least 48 px
- [X] T029 [US1] Create `src/features/mobile/useIncomingToasts.ts` and use it in `MobileShell`: show a sonner toast for every owner notification that arrives after the surface loaded, and when the notification is a new entry, navigate to `/m/historie` and scroll the entry into view with a brief highlight
- [X] T030 [US1] Create `src/features/demo/PhonePreview.tsx`: an iframe of `/m?embed=1` in a phone frame with the caption "Demo-Vorschau · Eigentümer-Handy", rendered beside the AppShell on `/betrieb/*` at viewport widths ≥ 1440 px when `demo.previewVisible` is true; add a "Vorschau ein/aus" switch to `src/features/demo/DemoControl.tsx`; the AppShell keeps its reference layout next to it
- [X] T031 [US1] Run `npm run build && npm run test:e2e` and the S1 steps in quickstart.md by hand; fix until the three-click flow passes and completing the Einreichung again is impossible

**Checkpoint**: S1 works end to end in three clicks and survives a reload

---

## Phase 4: User Story 2 — Owner requests the next appointment (Priority: P2) — demo story S2

**Goal**: The owner taps "Termin anfragen" on the Heizungswartung item, confirms, and a card appears on SHK Becker's board in "Anfragen aus dem Scheckheft".

**Independent Test**: On `/m`, request the appointment for "Heizungswartung · fällig in 21 Tagen · zuletzt: SHK Becker" in two taps without typing; switch to Betrieb SHK Becker → Board and see the card; switch to Elektro Stosic → Board and see none.

- [X] T032 [US2] Add the action `requestTermin(ruleId)` to `src/store/index.ts` (await `simulate(700)`, add a Terminanfrage addressed to the company of the latest entry, add a Betrieb notification, no-op if one is open) and the selector `boardCards(betriebId)` to `src/store/selectors.ts`; mark due items with an open request as `requested`
- [X] T033 [P] [US2] Create `src/features/mobile/TerminSheet.tsx`: bottom sheet naming the work, the object and the company, one large "Anfrage senden" button with loader, then a success state "Anfrage gesendet – SHK Becker meldet sich bei dir"; no text input
- [X] T034 [US2] Add the large "Termin anfragen" button to due items in `src/features/mobile/Uebersicht.tsx` opening the sheet; requested items show "Termin angefragt" and no button; items whose last company has no workspace still confirm but create no board card
- [X] T035 [P] [US2] Create `src/features/betrieb/Board.tsx` at `/betrieb/board` modelled on ph-ui-14: toolbar, board tab, column "Anfragen aus dem Scheckheft" with count and request cards (customer, object, requested work, date), plus one empty standard column; cards only of the active Betrieb
- [X] T036 [US2] Make the Betrieb shell follow `demo.activeBetrieb` in `src/components/shell/WorkspaceSwitcher.tsx` and `src/features/betrieb/Startseite.tsx` (name, avatar, Einreichungen, board and notifications of Elektro Stosic or SHK Becker GmbH) and verify the S2 steps in quickstart.md

**Checkpoint**: S1 and S2 both work; the request survives a reload

---

## Phase 5: User Story 3 — Owner shares a Verkaufsmappe (Priority: P3) — demo story S3

**Goal**: The owner creates a share link with chosen contents and expiry, gets a link and QR code, and the link opens a public read-only view on any device.

**Independent Test**: Create a link on `/m`, open it in a private window: badge "scheckheftgepflegt", object summary, history limited to the chosen contents, expiry date, no navigation. Alter the token: "nicht mehr verfügbar".

- [X] T037 [P] [US3] Implement `encodeShareToken` and `decodeShareToken` in `src/domain/shareToken.ts` per contracts/share-token.md (base64url JSON, version check, field validation, `undefined` instead of throwing) with tests in `src/domain/shareToken.test.ts` for round trip, garbage, wrong version and missing field
- [X] T038 [US3] Add the action `createShareLink(objektId, sections, days)` to `src/store/index.ts`: await `simulate(700)`, build the payload including the demo-added entries of that object, store and return the ShareLink
- [X] T039 [P] [US3] Create `src/features/mobile/ShareSheet.tsx`: content choices as large toggles (Historie, Dokumente, Kosten, Fälligkeiten; all preselected), expiry choice 7 / 30 / 90 Tage with 30 preselected, "Link erstellen" with loader, then the link with "Kopieren", a QR code from `qrcode.react` and the expiry date; at least one section must stay selected
- [X] T040 [US3] Create `src/features/share/ShareView.tsx` and `Unavailable.tsx` at `/share/:token`: decode the token, rebuild data from `buildFixtures(payload.c)` plus the token's entries without reading the store, and render the badge "scheckheftgepflegt" (plain pill, not a seal), the prototype chip, object summary, Anlagen, maintenance history per Gewerk, optional documents, costs and due dates, and "Gültig bis …"; expired or undecodable tokens render the unavailable message with no object data and no console error; no shell, no Demo-Steuerung, no editing
- [X] T041 [US3] Add the entry point "Verkaufsmappe teilen" to `src/features/mobile/Uebersicht.tsx` and verify the S3 steps in quickstart.md at 360 px and 1440 px

**Checkpoint**: S1–S3 work; a share link created before a reset still opens

---

## Phase 6: User Story 7 — Owner browses the Scheckheft (Priority: P3) — prerequisite for S4

**Goal**: Documents with previews and type filters on the phone, and the full Scheckheft in Eigentümer Web.

**Independent Test**: With initial data only, filter Dokumente by type and open a preview on `/m/dokumente`; at `/eigentuemer` see the same object, history, documents, due dates and calendar inside the ProtocolHero shell.

- [X] T042 [P] [US7] Create `src/components/scheckheft/DocumentPreview.tsx` (dialog on desktop, full-height sheet on phone) rendering a paper-like page from entry data for Protokoll, Rechnung and Garantie and an original SVG placeholder for Foto, each with a "Konzept-Prototyp · fiktive Daten" watermark, and `DocumentList.tsx` with type chips Protokoll / Rechnung / Foto / Garantie
- [X] T043 [US7] Create `src/features/mobile/Dokumente.tsx` at `/m/dokumente` using `DocumentList`, make the document chips in `src/components/scheckheft/EntryCard.tsx` open the preview, and create `src/features/mobile/NotificationSheet.tsx` opened from a bell button in `MobileShell` listing reminders and incoming entries
- [X] T044 [US7] Create `src/features/eigentuemer/EigentuemerLayout.tsx` (AppShell with owner nav: Startseite, Scheckheft, Kalender, plus locked items for Dokumenten-Graph, Portfolio, "Frag dein Scheckheft" with crown pills; workspace "Familie Schneider"; plan card showing the workspace plan) and `src/features/eigentuemer/ScheckheftHome.tsx` at `/eigentuemer` (object cards with Gewerk status, next due items, "Benachrichtigungen" panel)
- [X] T045 [US7] Create `src/features/eigentuemer/ObjektDetail.tsx` at `/eigentuemer/objekte/:objektId` with tabs Übersicht (Anlagen, status, due items with "Termin anfragen"), Historie (`Timeline`), Dokumente (`DocumentList`), reusing the shared components and showing incoming-entry toasts
- [X] T046 [P] [US7] Create `src/features/eigentuemer/Kalender.tsx` at `/eigentuemer/kalender` modelled on ph-ui-16: month grid with due items as chips labelled "Empfehlung", a side list of upcoming items, month navigation

**Checkpoint**: Eigentümer Web shows everything the phone shows

---

## Phase 7: User Story 4 — Upgrade path (Priority: P4) — demo story S4

**Goal**: Locked features open the gold upgrade modal; upgrading reveals Advanced (second object, object graph, PDF export) and then Pro (Rheinblick workspace, dashboard, portfolio graph with filters, chat, bulk export) with a gold "Neu" pulse.

**Independent Test**: From Kostenlos at `/eigentuemer`, upgrade twice and check at each step which features appeared and were highlighted; switch back to Familie Schneider and see Advanced with Pro items locked.

- [X] T047 [US4] Add the actions `upgrade(target)` (await `simulate(1200)`, update the plan slice, for `pro` set `proReached` and switch to the Rheinblick workspace, register unlocked features for a 6-second non-persisted "Neu" highlight) and `setPlan(plan)` to `src/store/index.ts`
- [X] T048 [P] [US4] Create `src/components/scheckheft/UpgradeModal.tsx` modelled on ph-ui-01 (two columns; left: tinted round icon, title, text, crown line "Verfügbar ab Advanced" / "Verfügbar ab Pro", "Nicht jetzt" and gold button with crown; right: warm-tinted panel with an original schematic SVG illustration and round close button; loader state "Dein Scheckheft wird erweitert…"), `LockedFeature.tsx` (wrapper showing lock or crown and opening the modal) and `NeuBadge.tsx` (gold "Neu" pill with a pulse that respects `prefers-reduced-motion`)
- [X] T049 [US4] Apply `featureGate` in `src/features/eigentuemer/EigentuemerLayout.tsx`, `ScheckheftHome.tsx` and `src/components/shell/PlanCard.tsx`: locked nav items and the "Objekt hinzufügen" card open the modal, the plan card shows the workspace plan and its "Upgrade" button opens the modal for the next plan, newly unlocked items show `NeuBadge`
- [X] T050 [P] [US4] Add Advanced fixtures in `src/mocks/venloer.ts` (object "ETW Venloer Straße 8, Wohnung 3", rented, 3–4 Anlagen, about 8 entries, `requiredPlan: 'advanced'`) and cross-link relations in `src/mocks/relations.ts` (for example electrical inspection → Wärmepumpe → invoice → Nebenkostenabrechnung); register them in `src/mocks/index.ts`
- [X] T051 [P] [US4] Implement `buildGraph(scope)` in `src/domain/graph.ts` (nodes for Dokument, Anlage, Betrieb, Kosten and, for a workspace scope, Objekt; edges derived from entries plus explicit relations; optional Gewerk and due-status filter) with a test in `src/domain/graph.test.ts` for node and edge counts of a small fixture
- [X] T052 [US4] Create `src/components/scheckheft/Graph.tsx` (lazy chunk; `@xyflow/react` with custom node types, static dagre layout computed once, nodes not draggable or connectable, `fitView`, viewport pan/zoom with controls, selecting a node highlights it and its neighbours, dims the rest and offers "Dokument öffnen" / details; nodes are keyboard-focusable buttons) and `RelationList.tsx` (the same relations as a grouped list, used below 768 px)
- [X] T053 [US4] Add the "Graph" tab to `src/features/eigentuemer/ObjektDetail.tsx` (locked on Kostenlos) and a "Verkaufsmappe als PDF" action that creates a share link and opens `/share/:token?print=1`; add print styles and the `print=1` handling to `src/features/share/ShareView.tsx`; on `/m`, show an object switcher in `MobileShell` when the plan is Advanced
- [X] T054 [P] [US4] Add Pro fixtures in `src/mocks/rheinblick.ts` (workspace "Rheinblick Hausverwaltung" with 12 objects `rb-01` … `rb-12`, 2–4 Anlagen and 3–6 entries each, dated so that overdue, due-in-30 and due-in-90 counts are all above zero) and the selector `portfolioStats` in `src/store/selectors.ts`; list Rheinblick in `src/components/shell/WorkspaceSwitcher.tsx` only once `proReached` is true
- [X] T055 [US4] Create `src/features/eigentuemer/PortfolioDashboard.tsx` (shown at `/eigentuemer` for the Rheinblick workspace: stat tiles Überfällig / Fällig in 30 Tagen / Fällig in 90 Tagen / Kosten gesamt, pill filters by Gewerk and due status, object table with status and cost per object, "Sammelexport" button opening a simulated progress and a summary dialog) and `src/features/eigentuemer/PortfolioGraph.tsx` at `/eigentuemer/graph` using `Graph` with the same filters
- [X] T056 [P] [US4] Implement `matchIntent` in `src/domain/intent.ts` with tests in `src/domain/intent.test.ts`, and add `src/mocks/chat.ts` with five prepared questions (including "Wann war die letzte Heizungswartung?"), keywords, answers and source document ids
- [X] T057 [US4] Create `src/features/eigentuemer/Chat.tsx` at `/eigentuemer/frag`: banner "Antworten basieren nur auf Dokumenten dieses Objekts", prepared questions as chips, text field, 800 ms typing indicator, answers labelled "Vorschlag" with source-document chips opening `DocumentPreview`, fixed fallback for unmatched input; then verify the S4 steps in quickstart.md including switching back to Familie Schneider

**Checkpoint**: S1–S4 work; plan state survives a reload

---

## Phase 8: User Story 5 — Owner adds an invoice from another company (Priority: P5) — demo story S5

**Goal**: The owner adds a photo of a foreign invoice, gets an editable suggestion with its source, and "Übernehmen" adds the entry.

**Independent Test**: On `/m`, "Dokument hinzufügen" → "Beispielrechnung verwenden" → suggestion card → "Übernehmen"; the entry is in Historie and the invoice in Dokumente. Dismissing adds nothing.

- [X] T058 [US5] Add the scenario `s5-upload` to `src/mocks/scenarios.ts` (invoice from a company outside the fixtures, suggested Gewerk, Anlage, date, cost, interval) and the actions `extractUpload(file?)` (await `simulate(1200)`, return the suggestion, write nothing) and `acceptSuggestion(edited)` to `src/store/index.ts`
- [X] T059 [P] [US5] Create `src/components/scheckheft/SuggestionCard.tsx`: heading "Vorschlag – bitte prüfen", thumbnail of the source document, fields Gewerk and Anlage as choice chips, Datum, Kosten and Intervall ("· Empfehlung") as optional edits with validation, buttons "Übernehmen" and "Verwerfen"
- [X] T060 [US5] Create `src/features/mobile/UploadSheet.tsx` with "Foto aufnehmen oder auswählen" (file input, image used only as thumbnail) and "Beispielrechnung verwenden", a loader "Dokument wird gelesen…", then the `SuggestionCard`; add the entry point "Dokument hinzufügen" to `src/features/mobile/Dokumente.tsx` and `src/features/mobile/Uebersicht.tsx`; verify the S5 steps in quickstart.md

**Checkpoint**: All five demo stories work

---

## Phase 9: User Story 6 — Presenter steers the demo (Priority: P2)

**Goal**: The Demo-Steuerung can trigger story 1 and the second incoming entry, set the plan, and nothing duplicates.

**Independent Test**: Using only the Demo-Steuerung: reach every surface, trigger both entries twice (one entry each), set each plan, reset to the initial state.

- [X] T061 [US6] Add the scenario `shk-incoming` to `src/mocks/scenarios.ts` (Heizungswartung entry from SHK Becker with Wartungsbericht and Rechnung) and the action `triggerScenario(id)` to `src/store/index.ts`: idempotent through `demo.activatedScenarios`, `s1-elektro` produces the same state as `completeEinreichung`, `shk-incoming` also sets an open Terminanfrage for the same rule to `erledigt`
- [X] T062 [US6] Extend `src/features/demo/DemoControl.tsx` with "S1 auslösen", "SHK Becker sendet Wartungsbericht + Rechnung" (both disabled with "bereits ausgelöst" once used) and plan buttons Kostenlos / Advanced / Pro calling `setPlan`; show done request cards as "Erledigt" in `src/features/betrieb/Board.tsx`
- [X] T063 [US6] Verify reload and reset behaviour per quickstart.md: state survives a reload after each story, "Demo zurücksetzen" restores everything including plan, workspace and preview, and setting the `hero-scheckheft` key to an unreadable value starts from the initial state; fix what fails in `src/store/index.ts`

---

## Phase 10: User Story 8 — Betrieb sees what is due at its customers (Priority: P4)

**Goal**: A "Scheckheft" entry with gold "Neu" badge in the Betrieb sidebar lists customer objects with upcoming due dates.

**Independent Test**: Open `/betrieb/scheckheft` as Elektro Stosic after S1: Lindenstraße 12 shows the electrical inspection due in four years.

- [X] T064 [US8] Add the selector `customerDue(betriebId, today)` to `src/store/selectors.ts`, the sidebar entry "Scheckheft" with gold "Neu" badge to the Betrieb nav config in `src/features/betrieb/BetriebLayout.tsx`, and create `src/features/betrieb/KundenScheckheft.tsx` at `/betrieb/scheckheft` with the heading "Fällig beim Kunden", pill filters by due status, and a card per customer object with next due item, date and "Empfehlung" label

---

## Phase 11: Polish & Cross-Cutting Concerns

**Purpose**: Native look, offline, accessibility, deployment

- [X] T065 Compare every screen side by side with the reference images in `docs/reference-ui/reference-ui/` (all 26 files; check them first for an Einreichung detail and an approval card) at 1440 px: `/betrieb`, `/betrieb/einreichungen`, the Einreichung detail and closing dialog, `/betrieb/board`, `/betrieb/scheckheft`, `/eigentuemer`, object detail tabs, `/eigentuemer/kalender`, dashboard, graph, chat, the upgrade modal, the empty state, the plan card and the floating button; list each deviation in layout, spacing, colour, radius, typography, icon style and wording, and fix them in `src/styles/tokens.css`, `src/components/ui/`, `src/components/shell/` and `src/components/scheckheft/`
- [X] T066 [P] Configure `vite-plugin-pwa` in `vite.config.ts` (generateSW, precache all build output, `navigateFallback: 'index.html'`, autoUpdate; manifest name "Hero Scheckheft", `start_url: /m`, `display: standalone`, theme colour from the text token) and create original icons in `public/icons/` (192, 512, maskable) from the floating-button glyph
- [X] T067 [P] Responsive pass at 360, 768 and 1440 px over every route in contracts/routes.md: no horizontal scroll, nothing clipped, sidebar sheet works, tables collapse to cards; fix in the affected files under `src/features/` and `src/components/`
- [X] T068 [P] Accessibility pass: landmarks and one `h1` per route, labelled controls, dialogs and sheets trap and restore focus, visible focus ring everywhere, status never by colour alone, dark text on gold everywhere except the two reference buttons, every `/m` target at least 48 px; run Lighthouse (mobile) on `/m`, `/m/historie` and `/m/dokumente` and fix until accessibility is at least 90
- [X] T069 [P] Honesty pass: confirm the prototype chip on every route and on document previews, "Empfehlung" on every interval, "Vorschlag" and a source document on every extraction and chat answer, and no occurrence of "konform" in `src/`
- [ ] T070 Run `npm run typecheck && npm run lint && npm run test && npm run build && npm run test:e2e`, then the acceptance table in quickstart.md against `npm run preview`: offline run of S1–S5, install prompt on `/m`, no console errors, first contentful paint under 1.5 s, route chunks split with the graph in its own chunk; fix what fails
- [ ] T071 Deploy the static build to Vercel, open the deployed address once on the presentation machine, scan an S3 QR code with a second phone and confirm the Verkaufsmappe opens within 5 seconds; record the address in `README.md` together with the demo order from quickstart.md

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: no dependencies
- **Foundational (Phase 2)**: depends on Setup; blocks every story
- **US1 (Phase 3)**: depends on Foundational
- **US2 (Phase 4)**: depends on US1 (mobile Übersicht, `DueItemCard`)
- **US3 (Phase 5)**: depends on US1 (mobile Übersicht, `EntryCard`, `Timeline`)
- **US7 (Phase 6)**: depends on US1; its web due items reuse US2's request action
- **US4 (Phase 7)**: depends on US7 (Eigentümer Web) and US3 (share view, for the PDF export)
- **US5 (Phase 8)**: depends on US7 (`Dokumente`, `DocumentPreview`)
- **US6 (Phase 9)**: depends on US1, US2 and US4 (it triggers and sets what they built)
- **US8 (Phase 10)**: depends on US1
- **Polish (Phase 11)**: depends on all stories that are to be shown

### Within Foundational

T006 → T007, T009–T012. T013 → T014, T015, T016. T016 → T017 → T018. T019 after T009 and T011. T020 after T017 and T019.

### Within Each User Story

Fixtures and store actions before the screens that use them; shared components before the features that compose them; the verification task last.

### Parallel Opportunities

- Setup: T003, T004, T005
- Foundational: T007, T008 together; T010, T011, T012 together; T013, then T014 and T015 together
- US1: T021, T022 together; then T024, T025, T027 together
- US2: T033 and T035
- US3: T037 and T039
- US7: T042 and T046
- US4: T048, T050, T051, T054, T056
- US5: T059
- Polish: T066, T067, T068, T069

---

## Parallel Example: User Story 1

```text
After T023:
Task: "Create src/features/betrieb/Startseite.tsx at /betrieb"            (T024)
Task: "Create Einreichungen.tsx and EinreichungDetail.tsx"                 (T025)
Task: "Create EntryCard.tsx, Timeline.tsx and DueItemCard.tsx"             (T027)
```

## Parallel Example: User Story 4

```text
After T047:
Task: "Create UpgradeModal.tsx, LockedFeature.tsx and NeuBadge.tsx"       (T048)
Task: "Add Advanced fixtures in src/mocks/venloer.ts and relations.ts"    (T050)
Task: "Implement buildGraph in src/domain/graph.ts with test"             (T051)
Task: "Add Pro fixtures in src/mocks/rheinblick.ts"                       (T054)
Task: "Implement matchIntent and src/mocks/chat.ts"                       (T056)
```

---

## Implementation Strategy

### MVP First (S1 only)

1. Phase 1 and Phase 2
2. Phase 3 (US1)
3. **Stop and validate**: three clicks, under 60 seconds, survives reload, looks native
4. This alone is a showable demo

### Incremental Delivery

Each phase ends at a checkpoint where everything built so far can be shown:
S1 → S2 → S3 → browsing and Eigentümer Web → S4 → S5 → demo triggers → Betrieb Scheckheft → polish.

### If time runs short

- Pull T065 (reference comparison), T066 (PWA/offline) and T071 (deploy) forward before
  finishing Phase 7; they affect every story that is shown.
- Cut from the end of Phase 7 backwards: bulk export (in T055), portfolio graph filters
  (T055), chat (T056, T057), before anything in Phases 3–6.
- US8 (T064) can be dropped without affecting S1–S5.

---

## Implementation status (2026-09-30)

- T001–T069 are done and verified against the production build.
- **T070 open**: every check in the acceptance table passes except first contentful paint.
  Lighthouse (mobile, simulated slow 4G) measures 1.7 s on `/m` against the uncompressed local
  preview server; the 1.5 s target has to be re-measured on the deployed, compressed build.
  The install prompt was not tried on a real phone.
- **T071 open**: not deployed. Deploying publishes the prototype and needs the owner's Vercel
  account. The QR check on a second phone depends on it.
- Deviations from the task wording: the restyled primitives live in `button.tsx`, `pill.tsx`,
  `dialog.tsx` (dialog and sheet) and `controls.tsx` (tabs, switch, tooltip, dropdown);
  the mobile pages are in `features/mobile/pages.tsx` and `sheets.tsx`; shared hooks are in
  `src/lib/hooks.ts`. The object graph uses a fixed row arrangement and only the portfolio
  graph uses dagre, because dagre stacked one object's documents too tall to read.
- React Router 7 is used instead of the current major, which requires React 19.
- None of the 26 reference images shows an Einreichung detail or an approval card. The detail
  screen is composed from the reference's card, pill and dialog patterns; the Einreichungen
  list follows the table in `ph-ui-18.png`.

## Notes

- Show S2 before triggering "SHK Becker sendet Wartungsbericht + Rechnung"; that entry is the
  Heizungswartung and moves its due date a year out.
- The reference images are in `docs/reference-ui/reference-ui/`, not `docs/reference-ui/`.
- The repository is not under version control yet; run `git init` before starting if commits
  per task are wanted.
