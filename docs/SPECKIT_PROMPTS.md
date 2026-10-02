# Hero Scheckheft – Spec Kit prompts

Order: `/speckit.constitution` → `/speckit.specify` → `/speckit.clarify` (optional) → `/speckit.plan` → `/speckit.tasks` → `/speckit.analyze` → `/speckit.implement`

Before starting:
1. `specify init hero-scheckheft --ai claude` and open the folder in Claude Code.
2. Unpack `reference-ui.zip` to `docs/reference-ui/` (26 ProtocolHero screenshots). Every prompt below references this folder.
3. Paste each block below as-is.

---

## 1. `/speckit.constitution`

```
/speckit.constitution Create the constitution for "Hero Scheckheft", a clickable frontend prototype for a CTO product challenge at ProtocolHero (Köln). The prototype must be shown to investors and customers tomorrow. Principles, in priority order:

I. Native, not foreign (NON-NEGOTIABLE). The prototype must look and feel 1:1 like the existing ProtocolHero web app. Reference: docs/reference-ui/*.png. Reuse their layout (left sidebar, workspace switcher top-left, plan card bottom-left, white content area with bordered rounded cards, pill filters, black primary buttons, gold upgrade/Hero accents, green "Kostenlos" pills), their German UI vocabulary (Startseite, Einreichungen, Aufgaben, Kalender, Board, Protokolle, Datenbanken, Vorlagen, Bezugspunkt, Freigabe, Upgrade) and their interaction patterns (upgrade modal with text left and illustration right, "Nicht jetzt" + gold upgrade button; approval cards). New features appear as native additions, never as a separate product.

II. Frontend only, mock data. No backend, no auth, no external APIs, no real AI calls. All data lives in typed mock fixtures; state lives in the client (persisted to localStorage so a demo survives reload, with a "Demo zurücksetzen" action). Anything that would need a server is simulated with a short, realistic delay (600–1500 ms) and a loader.

III. The aha comes first. The core demo ("a craftsman closes an inspection → the document, invoice and next due date appear automatically in the owner's service book") must be reachable in under 60 seconds and at most 3 clicks from the start screen.

IV. Radical simplicity for owners. The owner experience is a mobile-first PWA: max. 3 bottom tabs, big touch targets (min. 48 px), no typing required for core flows, plain language, no software jargon.

V. Honesty in the UI. All data is fictitious and labelled "Konzept-Prototyp · fiktive Daten". Maintenance intervals are always labelled "Empfehlung"; the product never claims norm or legal compliance (no "DGUV-konform", no "EPBD-konform"). AI output is always shown as a suggestion with its source document.

VI. Responsive and accessible. Works at 360 px, 768 px and 1440 px. WCAG AA contrast, keyboard navigable, semantic HTML, visible focus.

VII. Small and deliberate. Build only what serves the demo story. Prefer composition of a few well-made components over breadth. No feature without a mock scenario that shows it.

Conventions: UI text in German (du-Form, like ProtocolHero). Code, comments, specs and commit messages in English. TypeScript strict mode. Deterministic business logic (due-date calculation) is covered by unit tests.
```

---

## 2. `/speckit.specify`

```
/speckit.specify Build "Hero Scheckheft" – a digital service book (like the "Scheckheft" of a car) for every building and installation, integrated natively into ProtocolHero. When a craftsman's company completes an Einreichung (inspection or service protocol) whose Bezugspunkt is an object, the protocol PDF, photos, the invoice and the recommended next due date appear automatically in the owner's Scheckheft. The owner gets reminders and books the next appointment with one tap, which lands as a card on the company's board. Owners can share the Scheckheft read-only with an estate agent (Makler) or buyer when selling ("scheckheftgepflegt").

Look and feel: identical to the existing ProtocolHero app – see docs/reference-ui/*.png (sidebar, cards, pills, buttons, gold upgrade modal, plan card bottom-left). German UI.

Users and surfaces:
1. Betrieb (craftsman company, e.g. "Elektro Stosic"): the existing ProtocolHero desktop app shell. New: in the Einreichung detail, closing dialog with toggle "Ins Scheckheft des Kunden übertragen" (default on when Bezugspunkt is an object) and an editable interval suggestion ("Nächste Prüfung in 4 Jahren · Empfehlung"). A new sidebar entry "Scheckheft" with gold "Neu" badge shows the company's customer objects with upcoming due dates ("Fällig beim Kunden").
2. Eigentümer web (desktop/tablet): the same ProtocolHero shell, workspace "Familie Schneider", sidebar entry "Scheckheft".
3. Eigentümer mobile PWA (route /m): installable, super simple, three bottom tabs: Übersicht (next due items, big "Termin anfragen" button), Historie (timeline grouped by Gewerk: Strom, Heizung, Wasser, Sicherheit, Dach), Dokumente (list with type chips: Protokoll, Rechnung, Foto, Garantie).
4. Share view (route /share/:token): public read-only "Verkaufsmappe" with badge "scheckheftgepflegt", object summary, maintenance history, expiry date.

Three plans, switchable in the prototype with no backend (click "Upgrade" → gold modal in ProtocolHero style → loader ~1.2 s "Dein Scheckheft wird erweitert…" → new features appear, highlighted with a gold "Neu" pulse for a few seconds):
- Kostenlos: 1 object. All documents of the house linked to it (automatically from connected companies plus own uploads). Calendar with reminders for maintenance: heating, water, electricity, smoke detectors, chimney, roof. Termin anfragen. Simple read-only share link.
- Advanced: everything in Kostenlos plus multiple objects (e.g. own house + rented apartment) and a small document graph per object that shows relations, e.g. the electrical inspection is linked to the heat pump (Anlage), to the invoice and to the annual utility cost statement (Nebenkostenabrechnung). Verkaufsmappe as PDF export.
- Pro (for companies, landlords, property managers, facility management): many objects (portfolio of ~12), a graph that connects all documents, installations, companies and costs across objects, filters by Gewerk and due status, portfolio dashboard (overdue, due in 30/90 days, cost per object), AI chat "Frag dein Scheckheft" (scripted mock answers with source-document chips, e.g. "Wann war die letzte Heizungswartung?"), bulk export.
Locked features are visible with a lock/crown icon and open the upgrade modal.

Key demo stories (must all work):
S1 (aha, Betrieb → Eigentümer): In the Betrieb view, open Einreichung "Prüfung elektrischer Anlagen – Lindenstraße 12", click "Abschließen", keep the Scheckheft toggle on, confirm. Switch to the owner view (or the demo control does it): a new entry appears at the top of Historie with protocol, photos and invoice, the "Strom" status turns green, and the next due date is created in the calendar. A toast says "Elektro Stosic hat einen Eintrag hinzugefügt".
S2 (reminder → re-booking): On the owner's Übersicht a due item "Heizungswartung · fällig in 21 Tagen · zuletzt: SHK Becker" has a big "Termin anfragen" button. Tap → confirmation sheet → success; in the Betrieb view the request appears as a card in board column "Anfragen aus dem Scheckheft".
S3 (sale): Owner taps "Verkaufsmappe teilen", chooses contents and expiry (30 days), gets a link and QR; opening it shows the public share view.
S4 (upgrade path): Kostenlos → Advanced (second object and graph appear) → Pro (portfolio, full graph, AI chat).
S5 (foreign upload): Owner uploads a photo of an invoice from another company; a mock extraction shows suggested Gewerk, Anlage, date, cost and interval as an editable suggestion card; "Übernehmen" adds the entry.

Demo control: a floating round button bottom-right (like ProtocolHero's help button) opens "Demo-Steuerung" with: switch view (Betrieb / Eigentümer Web / Eigentümer Mobile), trigger S1 and a second incoming entry ("SHK Becker sendet Wartungsbericht + Rechnung"), set plan, reset demo.

Mock data (fictitious, German, realistic): object "Einfamilienhaus, Lindenstraße 12, 50823 Köln", built 1998, owner Familie Schneider; Anlagen: Elektroinstallation with Unterverteilung, Wärmepumpe (2021), Photovoltaik 9,8 kWp with Speicher, Wallbox, Rauchwarnmelder (6), Trinkwasser-Enthärtung, Dach. Companies: Elektro Stosic, SHK Becker GmbH, Schornsteinfeger Meister Wolf, Dachdecker Krämer. 3–4 years of history, ~25 entries with dates, costs and document types. Advanced adds "ETW Venloer Straße 8, Wohnung 3" (rented). Pro adds a portfolio of 12 objects of "Rheinblick Hausverwaltung".

Out of scope: real authentication, payments, real AI, backend, native apps, integrations with estate-agent portals, notification delivery (simulate with in-app toasts and a notification list).

Success criteria: S1 demonstrable in under 60 seconds; every screen visually indistinguishable in style from docs/reference-ui; mobile PWA scores ≥ 90 in Lighthouse PWA/accessibility; no console errors; works offline after first load.
```

---

## 3. `/speckit.clarify` (optional, if Claude Code asks)

Answers to likely questions:
- Default start screen: Eigentümer mobile? **No.** Start in the Betrieb desktop view on the Einreichung for S1; the demo control switches views.
- Persistence: localStorage, key prefix `scheckheft-demo:`; reset restores fixtures.
- Currency and dates: EUR, `de-DE` formatting, today's date = real current date; mock history is relative to today.
- Illustrations in the upgrade modal: simple original SVG line illustrations in ProtocolHero's style; do not copy their images.

---

## 4. `/speckit.plan`

```
/speckit.plan Tech stack and architecture for the Hero Scheckheft prototype:

- Vite + React 18 + TypeScript (strict). React Router for routes: /betrieb/*, /eigentuemer/*, /m/* (mobile PWA), /share/:token.
- Tailwind CSS with design tokens extracted from docs/reference-ui: font Inter (Google Fonts), base 14 px, text #111111, muted #6B6B6B, borders #E5E5E5, sidebar background #FAFAFA, card radius 12 px, primary button black #171717 with white text, gold accent #C2B27A (upgrade button, Hero/Pro badges, plan card), gold tint #F6F2E3, success pill bg #E7F6EC text #1F8A4C, danger #D93F3F. Define them as CSS variables and Tailwind theme tokens; no ad-hoc colors.
- shadcn/ui (Radix primitives) restyled to the tokens: Dialog, Sheet, Tabs, Switch, Tooltip, DropdownMenu, Toast (sonner). Icons: lucide-react (same outline style as ProtocolHero).
- State: Zustand with persist middleware (localStorage). Slices: plan (kostenlos | advanced | pro), objects, entries, anlagen, rules, termine, shareLinks, boardCards, notifications, demo.
- Domain logic in /src/domain, pure and unit-tested with Vitest: nextDueDate(rule, lastEntry), dueStatus(termin, today) (overdue / due30 / due90 / ok), gewerkStatus(object), featureGate(plan, feature).
- Mock fixtures in /src/mocks as typed TS modules with dates relative to today (date-fns, de locale).
- Fake latency helper: simulate(ms) used for upgrade, upload extraction, share-link creation.
- Graph: @xyflow/react (React Flow) with custom node types (Dokument, Anlage, Betrieb, Kosten) and a static layout (dagre) – no physics, readable on mobile via pan/zoom.
- AI chat (Pro): scripted intents matched by keywords → answer text + source-document chips that open the document; typing indicator 800 ms; banner "Antworten basieren nur auf Dokumenten dieses Objekts".
- PWA: vite-plugin-pwa (manifest name "Hero Scheckheft", theme color #111111, icons generated from a simple original "P"-style glyph – do not copy the ProtocolHero logo file), offline cache of app shell and fixtures.
- Layout components mirroring ProtocolHero: AppShell (Sidebar with workspace switcher, nav items with sub-items, "Mehr" section, PlanCard bottom-left with "Upgrade" gold button, user row), PageHeader, Card, PillFilter, StatTile (like "Tagesüberblick"), EmptyState, UpgradeModal (two-column, text left, illustration right, "Nicht jetzt" + gold CTA), ApprovalCard. Mobile: MobileShell with bottom tab bar and large primary action.
- Global "Konzept-Prototyp · fiktive Daten" chip in the header; <meta name="robots" content="noindex">.
- Quality: ESLint + Prettier, Vitest for domain logic, Playwright smoke test for S1 (Betrieb closes Einreichung → owner Historie shows new entry).
- Deployment: static build to Vercel (vercel.json with SPA rewrites). No environment variables, no secrets.

Structure:
src/
  app/ (routes, providers)
  components/ui (restyled shadcn)  components/shell  components/scheckheft
  features/betrieb  features/eigentuemer  features/mobile  features/share  features/demo
  domain/ (pure logic + tests)
  mocks/ (fixtures)
  store/ (zustand slices)
  styles/ (tokens.css)

Constraints: first meaningful paint < 1.5 s on mid-range mobile; bundle split per route; images as optimized WebP placeholders or original SVG illustrations.
```

---

## 5. `/speckit.tasks`, `/speckit.analyze`, `/speckit.implement`

```
/speckit.tasks Order tasks so that story S1 (Betrieb closes Einreichung → entry appears in owner's Scheckheft) is working end-to-end first, then S2, S3, S4, S5. Mark tokens/shell tasks as foundational. Include a task to compare every screen side by side with docs/reference-ui and fix visual deviations.
```

```
/speckit.analyze
```

```
/speckit.implement Implement in the task order. After each story, run the app, click through the story, compare with docs/reference-ui and fix deviations before moving on.
```

---

## Deploy (after implement)

```
npm run build
npx vercel --prod
```
Test the link on a phone, install the PWA ("Zum Home-Bildschirm"), and generate a QR code for the memo/email.
