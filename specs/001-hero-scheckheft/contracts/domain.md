# Contract: Domain functions and store actions

## Domain functions (`src/domain`)

Pure, no access to the store, the clock or the DOM. `today` is always a parameter. Each has
unit tests.

```ts
nextDueDate(rule: Rule, lastEntry: Entry | undefined): string | undefined
dueStatus(dueDate: string, today: string): DueStatus
gewerkStatus(items: DueItem[]): GewerkStatus
featureGate(plan: Plan, feature: Feature): boolean
encodeShareToken(payload: SharePayload): string
decodeShareToken(token: string): SharePayload | undefined
matchIntent(question: string, intents: Intent[]): Intent | undefined
validateIntervalMonths(input: unknown): number | undefined
```

### Required test cases

| Function | Cases |
|----------|-------|
| `nextDueDate` | rule interval; entry override wins; month-end (31 Jan + 1 month); leap day + 12 months; no entry → undefined |
| `dueStatus` | yesterday → overdue; today → due30; +30 → due30; +31 → due90; +90 → due90; +91 → ok |
| `gewerkStatus` | any overdue → ueberfaellig; else any due30 → bald_faellig; only due90/ok → in_ordnung; empty → in_ordnung |
| `featureGate` | every feature × every plan (table below) |
| share token | round trip; garbage; wrong version; missing field |
| `matchIntent` | each prepared question; case and umlaut variants; no match → undefined |
| `validateIntervalMonths` | 1, 120 accepted; 0, −1, 121, 1.5, "", "abc" rejected |

### Feature gate

| Feature | kostenlos | advanced | pro |
|---------|-----------|----------|-----|
| one object, documents, calendar, reminders, Termin anfragen, upload, share link | yes | yes | yes |
| `multi_object` | no | yes | yes |
| `object_graph` | no | yes | yes |
| `pdf_export` | no | yes | yes |
| `portfolio`, `dashboard` | no | no | yes |
| `portfolio_graph`, `filters` | no | no | yes |
| `chat` | no | no | yes |
| `bulk_export` | no | no | yes |

## Store actions (`src/store`)

Each action that stands for server work awaits `simulate(ms)` and then writes once. Actions are
idempotent where noted.

| Action | Delay | Effect |
|--------|-------|--------|
| `completeEinreichung(id, { transfer, intervalMonths })` | 900 ms | Marks the Einreichung completed. If `transfer`: adds the entry, adds an owner notification. Idempotent per id. |
| `triggerScenario('s1-elektro' \| 'shk-incoming')` | 900 ms | Same result as the corresponding real action. Idempotent. `shk-incoming` sets an open Terminanfrage for the same rule to `erledigt`. |
| `requestTermin(ruleId)` | 700 ms | Adds a Terminanfrage, a notification for the Betrieb, and marks the due item requested. No-op if one is open for the rule. |
| `extractUpload(file?)` | 1200 ms | Returns the prepared suggestion; writes nothing. |
| `acceptSuggestion(edited)` | none | Adds the entry and its document. |
| `createShareLink(objektId, sections, days)` | 700 ms | Adds and returns a ShareLink. |
| `upgrade(target: 'advanced' \| 'pro')` | 1200 ms | Updates the plan slice; `pro` also switches the active owner workspace to Rheinblick. Registers the newly unlocked features for the "Neu" highlight (about 6 s, not persisted). |
| `setPlan(plan)` | none | Demo-Steuerung: sets the state directly, including downward. |
| `setActiveBetrieb(id)`, `setActiveOwnerWorkspace(id)` | none | Workspace switcher and Demo-Steuerung. |
| `setPreviewVisible(bool)` | none | Phone preview on/off. |
| `markNotificationsRead(audience)` | none | |
| `resetDemo()` | none | Replaces the whole state with `initialState`. Asks for confirmation in the UI. |

### Cross-frame and cross-tab behaviour

- The store rehydrates on the `storage` event for its key, so the phone preview and any second
  tab follow every write.
- A surface shows a toast for each notification addressed to its audience that arrives after
  the surface was loaded. It does not toast notifications that existed at load.
