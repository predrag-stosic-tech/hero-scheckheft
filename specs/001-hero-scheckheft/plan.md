# Implementation Plan: Hero Scheckheft

**Branch**: `001-hero-scheckheft` | **Date**: 2026-09-30 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-hero-scheckheft/spec.md`

## Summary

A clickable, frontend-only prototype that shows a building service book as a native part of
ProtocolHero. A craftsman company completes an Einreichung; the protocol, photos, invoice and
the recommended next due date appear in the owner's Scheckheft. The owner requests the next
appointment with one tap, shares a read-only Verkaufsmappe, and can move through three plans.

Technical approach: a single-page React application with four route groups (Betrieb,
Eigentümer Web, Eigentümer Mobile, share view), typed fixtures built relative to today, and a
small persisted store that holds only what happened during the demo. Everything the screens
show is derived from fixtures plus that state by pure, unit-tested functions, so one write
(adding an entry) produces the new history entry, the green status and the next due date
together. The phone preview beside the Betrieb view is an iframe of the mobile route kept in
step through the browser's storage event. Share links carry their own contents in the token.
The app is precached by a service worker for offline use and deployed as static files.

## Technical Context

**Language/Version**: TypeScript 5.x, strict mode; Node.js 22+ for tooling

**Primary Dependencies**: Vite, React 18, React Router (library mode), Tailwind CSS v4,
shadcn/ui on Radix primitives (Dialog, Sheet, Tabs, Switch, Tooltip, DropdownMenu), sonner,
lucide-react, Zustand with persist, date-fns (de locale), @xyflow/react, @dagrejs/dagre,
qrcode.react, vite-plugin-pwa, @fontsource-variable/inter

**Storage**: Browser `localStorage` (one key, versioned) for demo state; no server storage

**Testing**: Vitest for `src/domain`; Playwright smoke test for story 1; ESLint + Prettier

**Target Platform**: Current Chrome, Edge, Safari and Firefox on desktop; Chrome on Android
and Safari on iOS for `/m`; static hosting on Vercel

**Project Type**: Single-project web application (frontend only)

**Performance Goals**: First contentful paint under 1.5 s on a mid-range phone; story 1 in
under 60 seconds and 3 clicks; QR link opens on a second phone within 5 seconds

**Constraints**: No backend, no auth, no external requests at runtime; works offline after
first load; usable at 360, 768 and 1440 px; WCAG AA; touch targets at least 48 px on `/m`;
simulated delays 600–1500 ms; all colours from tokens; one code-split chunk per route group,
graph in its own chunk; images as original SVG or optimised WebP

**Scale/Scope**: 4 surfaces, about 15 routes, 14 objects, about 90 fixture entries, 3
prepared scenarios, 8 user stories, one presenter, one day of build time

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| # | Gate | Before research | After design |
|---|------|-----------------|--------------|
| I | Native, not foreign | Pass. Tokens and shell components mirror the reference; the phone preview and Demo-Steuerung sit outside the AppShell and are marked as demo aids. | Pass. Component inventory in research R1 maps to reference patterns. Open point: plan names (see below). |
| II | Frontend only, mock data | Conflict: Inter from Google Fonts is a runtime network dependency. | Pass. Font is self-hosted (R2). No runtime requests. State in localStorage, reset action, `simulate()` within 600–1500 ms (R16). |
| III | The aha comes first | Pass. | Pass. Click budget fixed in contracts/routes.md; asserted by the Playwright test. |
| IV | Radical simplicity for owners | Pass. | Pass. Three tabs; everything else in sheets; upload has a no-camera, no-typing path (R13). |
| V | Honesty in the UI | Pass. | Pass. Global chip; "Empfehlung" on every interval; suggestion + source for extraction and chat (R11, R13); share token documented as not being access control (R9). |
| VI | Responsive and accessible | Conflict: white on gold `#C2B27A` is about 2.1:1; success and danger text are slightly under 4.5:1. | Pass with one recorded deviation (R3, Complexity Tracking). |
| VII | Small and deliberate | Pass. | Pass. Sidebar items outside the demo share one empty state; no PDF library; one smoke test. |
| — | Code gate | Pass. Strict TypeScript; domain logic pure and unit-tested. | Pass. Test cases listed in contracts/domain.md. |

**Differences between the plan request and the spec or constitution, and how each was
resolved:**

| Plan request | Conflict | Resolution |
|--------------|----------|------------|
| Inter via Google Fonts | Principle II, FR-040 (offline, no requests) | Self-hosted Inter (R2) |
| One `plan` slice with three values | Clarification 4: plan belongs to a workspace | Per-workspace plan state; effective plan derived (R5) |
| Graph "readable on mobile via pan/zoom" | Clarification 5 and FR-029a excluded zooming and panning | Nodes fixed, viewport pan/zoom enabled, list below 768 px; FR-029a amended (R10) |
| Slices `objects`, `anlagen`, `rules` in the persisted store | Fixture dates are relative to today | These are read-only selectors over fixtures; only demo events are persisted (R6) |
| Success pill text `#1F8A4C`, danger `#D93F3F` as text | Principle VI (AA) | Text variants `#17703C` and `#C23030`; given values kept for icons and dots (R3) |
| Routes `/betrieb/*` only | FR-011a: two companies | Active Betrieb in the store, switched by workspace switcher and Demo-Steuerung (R15) |

**Open points that do not block planning** (research.md, last section): Scheckheft plan names
versus ProtocolHero's own plan names; the reference path in the constitution.

## Project Structure

### Documentation (this feature)

```text
specs/001-hero-scheckheft/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/
│   ├── routes.md        # Addresses, surfaces, click budget
│   ├── share-token.md   # Share link payload
│   └── domain.md        # Domain functions, feature gate, store actions
├── checklists/
│   └── requirements.md
└── tasks.md             # Phase 2 output (/speckit-tasks, not created here)
```

### Source Code (repository root)

```text
index.html                     # robots noindex, font preload
vite.config.ts                 # PWA plugin, route chunks
vercel.json                    # SPA rewrite
public/
└── icons/                     # PWA icons from an original glyph
src/
├── app/
│   ├── router.tsx             # lazy route groups
│   ├── providers.tsx          # toaster, tooltip provider, storage sync
│   └── main.tsx
├── components/
│   ├── ui/                    # restyled shadcn: dialog, sheet, tabs, switch, tooltip,
│   │                          #   dropdown-menu, button, pill, badge
│   ├── shell/                 # AppShell, Sidebar, WorkspaceSwitcher, PlanCard, PageHeader,
│   │                          #   PrototypeChip, MobileShell, BottomTabs
│   └── scheckheft/            # Card, PillFilter, StatTile, EmptyState, UpgradeModal,
│                              #   ApprovalCard, LockedFeature, NeuBadge, GewerkStatusPill,
│                              #   DueItemCard, EntryCard, Timeline, DocumentList,
│                              #   DocumentPreview, SuggestionCard, Graph, RelationList
├── features/
│   ├── betrieb/               # Startseite, Einreichungen, EinreichungDetail, ClosingDialog,
│   │                          #   Board, KundenScheckheft
│   ├── eigentuemer/           # ScheckheftHome, ObjektDetail, Kalender, PortfolioDashboard,
│   │                          #   PortfolioGraph, Chat
│   ├── mobile/                # Uebersicht, Historie, Dokumente, TerminSheet, ShareSheet,
│   │                          #   UploadSheet, NotificationSheet
│   ├── share/                 # ShareView, Unavailable, print styles
│   └── demo/                  # DemoControl (floating button + panel), PhonePreview
├── domain/                    # pure logic + *.test.ts
│   ├── types.ts
│   ├── due.ts                 # nextDueDate, dueStatus, gewerkStatus, validateIntervalMonths
│   ├── featureGate.ts
│   ├── shareToken.ts
│   ├── intent.ts
│   └── graph.ts               # nodes and edges from entries and relations
├── mocks/                     # buildFixtures(today): betriebe, workspaces, objekte, anlagen,
│                              #   rules, entries, einreichungen, relations, scenarios, chat
├── store/                     # zustand slices, selectors, persist config, initialState
├── lib/                       # simulate, format (dates, euro), cn
└── styles/
    └── tokens.css             # CSS variables + @theme
tests/
└── e2e/
    └── s1.spec.ts             # Playwright smoke test for story 1
```

**Structure Decision**: Single frontend project at the repository root, using the structure
given in the plan request. Additions to it: `src/lib` for the latency and formatting helpers,
`tests/e2e` for the one Playwright test, and `public/icons`. Unit tests sit next to the domain
modules they test.

### Build order

Ordered so that the core demo exists first (Principle III) and each later step adds one story:

1. Scaffold, tokens, restyled primitives, AppShell and MobileShell with the prototype chip.
2. Domain functions with tests; fixtures for Lindenstraße 12; store with persist and reset.
3. Story 1: Betrieb Startseite, Einreichung detail, closing dialog, mobile Historie and
   Übersicht, notifications and toast, phone preview, Demo-Steuerung. Playwright test.
4. Story 2: Termin anfragen, SHK Becker workspace, board column, second incoming entry.
5. Story 7 and 8: Dokumente, document preview, Eigentümer Web screens, Kalender, "Fällig beim
   Kunden".
6. Story 3: share sheet, token, QR, share view, print styles.
7. Story 4: feature gate in the UI, upgrade modal, Advanced (second object, graph), Pro
   (Rheinblick fixtures, dashboard, portfolio graph with filters, chat, bulk export).
8. Story 5: upload and suggestion card.
9. PWA, offline check, responsive and accessibility pass, deploy.

If time runs out, steps are cut from the end of step 7 backwards (bulk export, portfolio
graph filters, chat) before anything in steps 1–6.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Principle VI: white text on gold (about 2.1:1) on the plan-card "Upgrade" button and the upgrade-modal CTA in the desktop shells | Principle I: the reference shows exactly this pairing on exactly these two buttons, and they are the most recognisable gold elements | Dark text on these buttons would pass AA but makes the plan card visibly different from the reference. The deviation is limited to these two buttons; all other text on gold, and all of `/m`, uses dark text |
| An iframe for the phone preview | FR-035a needs the phone experience live beside a 1440 px Betrieb view | Inline rendering applies desktop breakpoints to the phone components and needs a second, scoped toast system |
