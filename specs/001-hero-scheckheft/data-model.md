# Data Model: Hero Scheckheft

**Feature**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md) | **Date**: 2026-09-30

All data is client-side. There are two kinds:

- **Fixtures** (`src/mocks`): read-only, rebuilt on every load relative to today.
- **Demo state** (`src/store`): what happened during the demo; persisted to `localStorage`.

Everything the UI shows is fixtures plus demo state, combined by selectors. Dates are ISO
strings (`YYYY-MM-DD`); timestamps are ISO date-times. Money is integer cents.

## Enumerations

| Name | Values |
|------|--------|
| `Gewerk` | `strom`, `heizung`, `wasser`, `sicherheit`, `dach` |
| `DokumentTyp` | `protokoll`, `rechnung`, `foto`, `garantie` |
| `Plan` | `kostenlos`, `advanced`, `pro` |
| `DueStatus` | `overdue`, `due30`, `due90`, `ok` |
| `GewerkStatus` | `ueberfaellig`, `bald_faellig`, `in_ordnung` |
| `EntryOrigin` | `betrieb` (from a connected company), `upload` (added by the owner) |
| `Feature` | `multi_object`, `object_graph`, `pdf_export`, `portfolio`, `portfolio_graph`, `filters`, `dashboard`, `chat`, `bulk_export` |
| `ShareSection` | `historie`, `dokumente`, `kosten`, `faelligkeiten` |
| `NodeKind` | `dokument`, `anlage`, `betrieb`, `kosten`, `objekt` |

Display labels (German) live next to the enums: Strom, Heizung, Wasser, Sicherheit, Dach;
Protokoll, Rechnung, Foto, Garantie; "in Ordnung", "bald fällig", "überfällig".

## Fixture entities

### Betrieb

| Field | Type | Notes |
|-------|------|-------|
| `id` | string | `elektro-stosic`, `shk-becker`, `schornsteinfeger-wolf`, `dachdecker-kraemer` |
| `name` | string | |
| `gewerke` | Gewerk[] | |
| `hasWorkspace` | boolean | true for Elektro Stosic and SHK Becker (FR-011a) |

### OwnerWorkspace

| Field | Type | Notes |
|-------|------|-------|
| `id` | `familie-schneider` \| `rheinblick` | |
| `name` | string | |
| `objektIds` | string[] | Rheinblick: 12 own objects; Schneider: 2 |

The plan of a workspace is demo state (see `plan` slice), not a fixture.

### Objekt

| Field | Type | Notes |
|-------|------|-------|
| `id` | string | `lindenstrasse-12`, `venloer-8-whg-3`, `rb-01` … `rb-12` |
| `workspaceId` | string | |
| `title` | string | e.g. "Einfamilienhaus" |
| `address` | { street, zip, city } | |
| `baujahr` | number | |
| `nutzung` | `eigennutzung` \| `vermietet` | |
| `requiredPlan` | Plan | `kostenlos` for Lindenstraße 12, `advanced` for Venloer Straße 8 |

### Anlage

| Field | Type | Notes |
|-------|------|-------|
| `id` | string | |
| `objektId` | string | |
| `name` | string | e.g. "Wärmepumpe" |
| `gewerk` | Gewerk | |
| `einbaujahr` | number? | |
| `detail` | string? | e.g. "9,8 kWp mit Speicher", "6 Stück" |

### Rule (maintenance recommendation)

| Field | Type | Notes |
|-------|------|-------|
| `id` | string | |
| `anlageId` | string | |
| `title` | string | e.g. "Heizungswartung", "Prüfung elektrischer Anlagen" |
| `intervalMonths` | number | default recommendation; always labelled "Empfehlung" |

The six calendar reminder topics of FR-015 (heating, water, electricity, smoke detectors,
chimney, roof) are each covered by at least one rule on Lindenstraße 12.

### Entry (Scheckheft-Eintrag)

| Field | Type | Notes |
|-------|------|-------|
| `id` | string | |
| `objektId` | string | |
| `anlageId` | string | |
| `ruleId` | string? | set when the entry fulfils a rule |
| `betriebId` | string? | null when `betriebName` is a company outside the fixtures |
| `betriebName` | string | |
| `date` | date | |
| `title` | string | |
| `description` | string | |
| `costCents` | number | |
| `origin` | EntryOrigin | |
| `intervalMonths` | number? | overrides the rule's interval for the next due date |
| `dokumente` | Dokument[] | |

`gewerk` is taken from the Anlage.

### Dokument

| Field | Type | Notes |
|-------|------|-------|
| `id` | string | |
| `typ` | DokumentTyp | |
| `title` | string | |
| `date` | date | |
| `imageUrl` | string? | owner's uploaded photo as object URL / data URL, else rendered |

### Einreichung

| Field | Type | Notes |
|-------|------|-------|
| `id` | string | |
| `betriebId` | string | |
| `title` | string | e.g. "Prüfung elektrischer Anlagen – Lindenstraße 12" |
| `bezugspunkt` | { kind: `objekt`, objektId } \| { kind: `sonstiges`, label } | |
| `kunde` | string | |
| `result` | Entry template | entry, documents and rule produced on completion |

Fixtures contain the story-1 Einreichung for Elektro Stosic, at least one further open
Einreichung with a non-object Bezugspunkt (toggle default off), and a few for SHK Becker.

### Relation (graph edge)

| Field | Type | Notes |
|-------|------|-------|
| `id` | string | |
| `from`, `to` | { kind: NodeKind, id } | |
| `label` | string? | e.g. "abgerechnet in" |

Relations between an entry and its Anlage, company, documents and cost are derived. Only
cross-links (for example invoice → Nebenkostenabrechnung) are listed explicitly in fixtures.

### Scenario

Prepared results that a demo action activates:

| Id | Activated by | Produces |
|----|--------------|----------|
| `s1-elektro` | completing the story-1 Einreichung, or the Demo-Steuerung | Entry (Protokoll, 3 Fotos, Rechnung), notification |
| `shk-incoming` | Demo-Steuerung | Entry (Wartungsbericht, Rechnung) for Heizungswartung, notification; marks an open request for that rule as done |
| `s5-upload` | "Übernehmen" on the suggestion card | Entry (Rechnung) from a company outside the fixtures |
| `chat-intents` | chat | prepared questions, keywords, answers, source document ids |

### Seed volume

Lindenstraße 12: 7 Anlagen, about 25 entries over 3–4 years, 4 companies. Venloer Straße 8:
3–4 Anlagen, about 8 entries. Rheinblick: 12 objects with 2–4 Anlagen and 3–6 entries each,
spread so that the dashboard shows overdue, due-in-30 and due-in-90 counts above zero.

### Date anchoring

`buildFixtures(today)` returns all fixtures. Fixed requirement: the last Heizungswartung entry
by SHK Becker is dated `today + 21 days − 12 months`, so the derived due item reads "fällig in
21 Tagen" (FR-048). The last "Prüfung elektrischer Anlagen" entry is dated `today + 14 days −
48 months`, so "Strom" reads "bald fällig" before story 1 and "in Ordnung" after it. The share
view calls `buildFixtures(token.createdAt)`.

## Demo state (persisted)

Persist key `hero-scheckheft`, with a schema `version`. A missing, unreadable or
older-versioned payload is replaced by `initialState`.

| Slice | Shape | Notes |
|-------|-------|-------|
| `plan` | `{ familyPlan: 'kostenlos' \| 'advanced', proReached: boolean, activeOwnerWorkspace: 'familie-schneider' \| 'rheinblick' }` | initial: `kostenlos`, `false`, `familie-schneider` |
| `entries` | `{ added: Entry[] }` | entries created in the demo, absolute dates |
| `einreichungen` | `{ completed: Record<id, { completedAt, transferred: boolean }> }` | |
| `termine` | `{ requests: Terminanfrage[] }` | |
| `shareLinks` | `ShareLink[]` | |
| `notifications` | `Benachrichtigung[]` | |
| `demo` | `{ activeBetrieb: 'elektro-stosic' \| 'shk-becker', previewVisible: boolean, activatedScenarios: string[] }` | initial: `elektro-stosic`, `true`, `[]` |

`objects`, `anlagen`, `rules` and `boardCards` are selectors, not stored.
Not persisted: pending/loading flags, the "Neu" highlight list, the ids already toasted.

### Terminanfrage

| Field | Type |
|-------|------|
| `id` | string |
| `ruleId`, `anlageId`, `objektId` | string |
| `betriebId` | string? |
| `requestedAt` | timestamp |
| `status` | `offen` \| `erledigt` |

### ShareLink

| Field | Type |
|-------|------|
| `token` | string (see [contracts/share-token.md](./contracts/share-token.md)) |
| `objektId` | string |
| `sections` | ShareSection[] |
| `createdAt`, `expiresAt` | date |

### Benachrichtigung

| Field | Type |
|-------|------|
| `id` | string |
| `kind` | `neuer_eintrag` \| `erinnerung` \| `terminanfrage` |
| `audience` | `owner` \| betrieb id |
| `text` | string |
| `createdAt` | timestamp |
| `read` | boolean |
| `link` | route string? |

## Derived data (selectors over fixtures + demo state)

| Selector | Definition |
|----------|------------|
| `allEntries(objektId)` | fixture entries + `entries.added`, newest first |
| `dueItems(objektId, today)` | per rule: latest entry with that `ruleId` → `nextDueDate`; status from `dueStatus`; `requested` if an open Terminanfrage exists |
| `gewerkStatus(objektId, today)` | worst status among the due items of the Gewerk |
| `boardCards(betriebId)` | Terminanfragen with that `betriebId`, column "Anfragen aus dem Scheckheft" |
| `customerDue(betriebId, today)` | due items whose latest entry was made by that company ("Fällig beim Kunden") |
| `visibleObjekte(workspaceId, plan)` | objects whose `requiredPlan` is covered by the plan |
| `graph(scope)` | nodes and edges for one object (Advanced) or a workspace (Pro) |
| `portfolioStats(workspaceId, today)` | counts overdue / due30 / due90, cost per object |

## Domain functions (`src/domain`, pure)

Signatures in [contracts/domain.md](./contracts/domain.md).

- `nextDueDate(rule, lastEntry)` → date: `lastEntry.date + (lastEntry.intervalMonths ??
  rule.intervalMonths)` months. No entry → no due date (rule is shown as "noch kein Eintrag").
- `dueStatus(dueDate, today)` → `overdue` if before today; `due30` if within 30 days;
  `due90` if within 90 days; otherwise `ok`.
- `gewerkStatus(dueItems)` → `ueberfaellig` if any item is `overdue`; `bald_faellig` if any is
  `due30`; otherwise `in_ordnung`. (`due90` counts as "in Ordnung" on the owner surfaces and is
  shown only in the Pro dashboard.)
- `featureGate(plan, feature)` → boolean.
- `encodeShareToken` / `decodeShareToken`.
- `matchIntent(question, intents)`.

## Validation rules

- Interval: integer months, 1–120. Empty, zero, negative or non-numeric input is rejected and
  the previous value kept (edge case in the spec). The dialog edits in years or months and
  stores months.
- Cost in the suggestion card: non-negative amount in euros with up to two decimals.
- Date in the suggestion card: not in the future.
- Share expiry: one of 7, 30 or 90 days; 30 preselected. At least one section selected.

## State transitions

**Einreichung**: `offen` → `abgeschlossen` (once; with `transferred` true or false). No way
back except "Demo zurücksetzen".

**Due item**: `ok` / `due90` / `due30` / `overdue` (derived from dates) → `requested` when a
Terminanfrage is created → replaced by a new due item when a new entry for the rule arrives.

**Terminanfrage**: `offen` → `erledigt` when an entry for the same rule arrives.

**Plan (Familie Schneider)**: `kostenlos` → `advanced` by upgrade. Upgrade to Pro sets
`proReached` and switches `activeOwnerWorkspace` to `rheinblick`; `familyPlan` stays
`advanced`. The Demo-Steuerung can set any of the three states directly, including downward.

**ShareLink**: valid → expired when `today > expiresAt`. No revocation.

**Scenario**: not activated → activated (idempotent; a second trigger does nothing).
