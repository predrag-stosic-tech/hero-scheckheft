# Contract: Routes and surfaces

The prototype has no API. Its external interface is the set of addresses a person can open.
All routes are client-side; the host rewrites every path to `index.html`.

| Route | Surface | Shell | Content |
|-------|---------|-------|---------|
| `/` | — | — | Redirects to `/betrieb` |
| `/betrieb` | Betrieb | AppShell | Startseite: greeting, Tagesüberblick, "Heute" list with the open Einreichungen, Benachrichtigungen |
| `/betrieb/einreichungen` | Betrieb | AppShell | List of Einreichungen with pill filters |
| `/betrieb/einreichungen/:id` | Betrieb | AppShell | Einreichung detail, "Abschließen", closing dialog |
| `/betrieb/board` | Betrieb | AppShell | Board with column "Anfragen aus dem Scheckheft" |
| `/betrieb/scheckheft` | Betrieb | AppShell | "Fällig beim Kunden" |
| `/eigentuemer` | Eigentümer Web | AppShell | Scheckheft of the active workspace: objects (or portfolio dashboard on Pro) |
| `/eigentuemer/objekte/:objektId` | Eigentümer Web | AppShell | Tabs Übersicht, Historie, Dokumente, Graph |
| `/eigentuemer/kalender` | Eigentümer Web | AppShell | Maintenance calendar |
| `/eigentuemer/graph` | Eigentümer Web | AppShell | Cross-object graph with filters (Pro) |
| `/eigentuemer/frag` | Eigentümer Web | AppShell | "Frag dein Scheckheft" (Pro) |
| `/m` | Eigentümer Mobile | MobileShell | Tab Übersicht |
| `/m/historie` | Eigentümer Mobile | MobileShell | Tab Historie |
| `/m/dokumente` | Eigentümer Mobile | MobileShell | Tab Dokumente |
| `/share/:token` | Verkaufsmappe | none | Public read-only view |
| any other sidebar target | — | AppShell | Shared empty state "Nicht Teil dieser Demo" |
| unknown path | — | — | Redirects to `/betrieb` |

## Rules

- The active Betrieb (Elektro Stosic / SHK Becker) and the active owner workspace are store
  state, not part of the URL. The workspace switcher and the Demo-Steuerung change them.
- Opening a route whose feature is locked for the current plan shows the locked state with the
  upgrade modal trigger; it never shows the feature.
- `/m?embed=1` hides the Demo-Steuerung button. It is used by the phone preview.
- `/share/:token` renders no application navigation, no Demo-Steuerung and no editing
  controls. `?print=1` opens the browser's print dialog after render (PDF export).
- Sheets and dialogs (Termin anfragen, Verkaufsmappe teilen, document upload, document
  preview, notifications, upgrade modal, Demo-Steuerung) are not routes.
- Every route shows the chip "Konzept-Prototyp · fiktive Daten".

## Click budget for story 1 (from `/betrieb`, reset state, 1440 px)

1. Click the Einreichung "Prüfung elektrischer Anlagen – Lindenstraße 12" in "Heute".
2. Click "Abschließen".
3. Click "Abschließen und übertragen" in the dialog.

Result is visible in the phone preview. No further click.

## Manifest

`start_url: /m`, `scope: /`, `display: standalone`, name "Hero Scheckheft".
