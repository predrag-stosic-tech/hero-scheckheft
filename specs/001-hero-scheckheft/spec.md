# Feature Specification: Hero Scheckheft

**Feature Branch**: `001-hero-scheckheft`

**Created**: 2026-09-30

**Status**: Draft

**Input**: User description: "Build "Hero Scheckheft" – a digital service book (like the "Scheckheft" of a car) for every building and installation, integrated natively into ProtocolHero. When a craftsman's company completes an Einreichung whose Bezugspunkt is an object, the protocol PDF, photos, the invoice and the recommended next due date appear automatically in the owner's Scheckheft. The owner gets reminders and books the next appointment with one tap, which lands as a card on the company's board. Owners can share the Scheckheft read-only with an estate agent or buyer when selling. Four surfaces (Betrieb, Eigentümer web, Eigentümer mobile, share view), three switchable plans (Kostenlos, Advanced, Pro), five demo stories (S1–S5), a demo control, fictitious German mock data."

## Overview

Hero Scheckheft is a clickable concept prototype shown to investors and customers. It presents
a service book for buildings as a native part of ProtocolHero: work a craftsman company already
documents in ProtocolHero flows automatically to the building owner, who sees what was done,
what it cost and when the next maintenance is recommended, can request the next appointment
with one tap, and can hand a read-only record to an estate agent or buyer.

Everything is simulated. All data is fictitious, nothing leaves the device, and the prototype
must keep working through a live presentation without a network connection.

### Surfaces

| Surface | Audience | Form |
|---------|----------|------|
| Betrieb | Craftsman company (e.g. "Elektro Stosic") | Existing ProtocolHero desktop shell |
| Eigentümer Web | Owner on desktop/tablet, workspace "Familie Schneider" | Same ProtocolHero shell |
| Eigentümer Mobile | Owner on a phone | Installable, three bottom tabs |
| Verkaufsmappe (share view) | Estate agent or buyer, no account | Public read-only page |

## Clarifications

### Session 2026-09-30

- Q: When the owner requests the Heizungswartung appointment in story S2, on which company's
  board should the request card appear? → A: The Betrieb view can show either Elektro Stosic or
  SHK Becker; the card appears on SHK Becker's board.
- Q: Must the Verkaufsmappe link and QR code open correctly on a second device, such as an
  investor's own phone? → A: Yes. The link carries everything the share view needs (chosen
  contents and expiry), so it opens on any device that can reach the prototype's address.
- Q: After the craftsman confirms the closing dialog in story S1, how should the presenter get
  to the owner's view where the new entry appears? → A: Side by side. On wide screens the
  owner's phone is shown as a live preview next to the Betrieb view, so the entry and toast
  arrive there the moment the craftsman confirms; no switching is needed.
- Q: When the plan is upgraded from Advanced to Pro in story S4, whose Scheckheft does the
  audience see afterwards? → A: The upgrade switches the workspace to "Rheinblick
  Hausverwaltung" with its 12 objects and all Pro features. "Familie Schneider" stays in the
  workspace switcher with its two objects and its Advanced plan.
- Q: How much should the audience be able to do with the document graph in Advanced and Pro?
  → A: Clickable, fixed arrangement. Nodes sit in prepared positions; clicking a node
  highlights what it is connected to and opens its document or details; in Pro the filters
  hide and show nodes. No dragging of nodes. (Amended during planning at the owner's request:
  moving and zooming the view as a whole is allowed.)

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Completed inspection appears in the owner's Scheckheft (Priority: P1)

A craftsman at Elektro Stosic opens the Einreichung "Prüfung elektrischer Anlagen –
Lindenstraße 12" and clicks "Abschließen". A closing dialog shows the toggle "Ins Scheckheft
des Kunden übertragen", switched on because the Bezugspunkt is an object, and an editable
suggestion "Nächste Prüfung in 4 Jahren · Empfehlung". The craftsman confirms. Next to the
Betrieb view, the owner's phone is shown as a live preview; there, without any switching, a new
entry stands at the top of the Historie with the protocol, the photos and the
invoice; the status of "Strom" turns green; the next due date appears in the calendar; and a
toast says "Elektro Stosic hat einen Eintrag hinzugefügt".

**Why this priority**: This is the aha moment of the whole pitch (demo story S1). It shows that
the service book fills itself from work ProtocolHero customers already do. Without it there is
no product story.

**Independent Test**: Starting from the freshly reset demo on the start screen, complete the
named Einreichung and check that the owner's Historie, Strom status and calendar all changed.
This alone demonstrates the core value.

**Acceptance Scenarios**:

1. **Given** the reset demo on the Betrieb start screen, **When** the presenter opens the
   Einreichung "Prüfung elektrischer Anlagen – Lindenstraße 12", clicks "Abschließen" and
   confirms, **Then** the owner's phone preview beside the Betrieb view shows the new entry
   after exactly those 3 clicks and in under 60 seconds.
2. **Given** the closing dialog for an Einreichung whose Bezugspunkt is an object, **When** it
   opens, **Then** the toggle "Ins Scheckheft des Kunden übertragen" is on and the interval
   suggestion is shown with the label "Empfehlung".
3. **Given** the closing dialog, **When** the craftsman changes the interval from 4 years to
   another value and confirms, **Then** the next due date in the owner's calendar reflects the
   changed interval.
4. **Given** the closing dialog, **When** the craftsman switches the toggle off and confirms,
   **Then** the Einreichung is completed and nothing is added to the owner's Scheckheft.
5. **Given** the Einreichung was completed with the toggle on, **When** the owner's view is
   shown, **Then** the new entry is first in the Historie with protocol, photos and invoice
   attached, "Strom" shows a green status, the calendar contains the new due date, and the
   toast "Elektro Stosic hat einen Eintrag hinzugefügt" appears.
6. **Given** an Einreichung whose Bezugspunkt is not an object, **When** the closing dialog
   opens, **Then** the toggle is off by default.
7. **Given** the Einreichung has already been completed, **When** the craftsman opens it again,
   **Then** it is shown as completed and cannot be transferred a second time.
8. **Given** the Betrieb view on a screen at least 1440 px wide, **When** it is displayed,
   **Then** the owner's phone preview is visible beside it, recognisable as a demo aid and not
   as part of the ProtocolHero screen, and can be hidden and shown again.
9. **Given** the Betrieb view on a screen too narrow for the preview, **When** the craftsman
   confirms the closing dialog, **Then** the success message offers "Im Scheckheft ansehen",
   which opens the owner's view with the new entry.

---

### User Story 2 - Owner requests the next appointment with one tap (Priority: P2)

On the phone, the owner sees on "Übersicht" the item "Heizungswartung · fällig in 21 Tagen ·
zuletzt: SHK Becker" with a large "Termin anfragen" button. They tap it, confirm on a short
sheet and see a success message. At the company, the request appears as a card in the board
column "Anfragen aus dem Scheckheft".

**Why this priority**: This closes the loop (demo story S2): the service book is not an archive
but brings the craftsman company repeat business. It is the commercial argument for the Betrieb
side.

**Independent Test**: From the owner's Übersicht, request the appointment and check the
company's board for the new card.

**Acceptance Scenarios**:

1. **Given** the owner's Übersicht, **When** it is displayed, **Then** due items are listed by
   urgency and each shows what is due, when, and which company did it last.
2. **Given** the due item "Heizungswartung", **When** the owner taps "Termin anfragen" and
   confirms on the sheet, **Then** a success state appears and the item shows that an
   appointment has been requested.
3. **Given** a request was sent, **When** the Betrieb view is switched to SHK Becker and its
   board is opened, **Then** a card for that request is in the column "Anfragen aus dem
   Scheckheft", naming the customer, the object and the requested work.
4. **Given** a request was sent to SHK Becker, **When** the board of Elektro Stosic is opened,
   **Then** the request is not shown there.
5. **Given** an item for which an appointment was already requested, **When** the owner views
   it, **Then** the button no longer offers a second request.
6. **Given** the whole flow, **When** the owner completes it, **Then** no typing was required.

---

### User Story 3 - Owner shares a Verkaufsmappe for a sale (Priority: P3)

The owner taps "Verkaufsmappe teilen", chooses what to include and how long the link is valid
(30 days preselected) and receives a link and a QR code. Whoever opens the link sees a public,
read-only page with the badge "scheckheftgepflegt", a summary of the object, the maintenance
history and the expiry date.

**Why this priority**: The sale is the moment the service book pays off for the owner (demo
story S3) and gives the product a second audience: estate agents and buyers.

**Independent Test**: Create a share link, open it, and verify the read-only page shows only
the chosen contents and the expiry date.

**Acceptance Scenarios**:

1. **Given** the owner's Scheckheft, **When** the owner starts "Verkaufsmappe teilen",
   **Then** they can choose the contents from predefined options and an expiry, with 30 days
   preselected.
2. **Given** the choices are confirmed, **When** the link is created, **Then** a link and a QR
   code are shown and the link can be copied.
3. **Given** a valid link, **When** it is opened, **Then** the page shows the badge
   "scheckheftgepflegt", the object summary, the maintenance history limited to the chosen
   contents, and the expiry date, and offers no way to change anything.
4. **Given** an expired or unreadable link, **When** it is opened, **Then** a plain message says
   the Verkaufsmappe is no longer available, without showing any object data.
5. **Given** the share view, **When** it is displayed, **Then** it contains no claim of
   conformity with a norm or law.
6. **Given** a valid link created on the presenter's device, **When** its QR code is scanned
   with another phone that has never opened the prototype, **Then** the same Verkaufsmappe
   with the same contents and expiry date is shown there.

---

### User Story 4 - Upgrade path from Kostenlos to Advanced to Pro (Priority: P4)

On the Kostenlos plan, features of higher plans are visible but marked with a lock or crown.
Clicking one, or "Upgrade", opens the gold upgrade modal in ProtocolHero style. After choosing
the upgrade, a loader "Dein Scheckheft wird erweitert…" runs briefly and the new features
appear, highlighted for a few seconds with a gold "Neu" pulse. Advanced adds a second object
and a document graph per object; Pro adds the portfolio, the cross-object graph, filters, the
dashboard, the chat "Frag dein Scheckheft" and bulk export.

**Why this priority**: This shows investors the business model (demo story S4). It depends on
the owner experience of stories 1–3 existing first.

**Independent Test**: From Kostenlos, upgrade twice and verify at each step which features
became available and that they are highlighted.

**Acceptance Scenarios**:

1. **Given** the Kostenlos plan, **When** the owner views the Scheckheft, **Then** exactly one
   object is available and locked features are visible with a lock or crown icon.
2. **Given** a locked feature, **When** it is clicked, **Then** the upgrade modal opens with
   text on the left, an illustration on the right, "Nicht jetzt" and a gold upgrade button.
3. **Given** the upgrade modal, **When** "Nicht jetzt" is chosen, **Then** the modal closes and
   the plan is unchanged.
4. **Given** the upgrade modal on Kostenlos, **When** the upgrade to Advanced is confirmed,
   **Then** the loader "Dein Scheckheft wird erweitert…" is shown for about 1.2 seconds, the
   second object "ETW Venloer Straße 8, Wohnung 3" and the per-object document graph appear,
   and each is highlighted with a gold "Neu" pulse for a few seconds.
5. **Given** the Advanced plan, **When** the document graph of an object is opened, **Then** it
   shows relations between documents, Anlagen and costs, for example the electrical inspection
   linked to the Wärmepumpe, to its invoice and to the Nebenkostenabrechnung.
6. **Given** the workspace "Familie Schneider" on the Advanced plan, **When** the upgrade to
   Pro is confirmed, **Then** after the loader the workspace shown is "Rheinblick
   Hausverwaltung" with its portfolio of 12 objects, and the dashboard, the cross-object
   graph, the filters, the chat and bulk export are available and highlighted.
7. **Given** the Pro plan, **When** the dashboard is opened, **Then** it shows the number of
   overdue items, items due within 30 and within 90 days, and cost per object.
8. **Given** the Pro plan, **When** the presenter picks the question "Wann war die letzte
   Heizungswartung?" in "Frag dein Scheckheft", **Then** an answer appears after a short delay,
   presented as a suggestion together with chips naming its source documents.
9. **Given** any workspace, **When** the plan card at the bottom left is viewed, **Then** it
   shows the plan of that workspace.
10. **Given** a document graph, **When** a node is clicked or activated by keyboard, **Then**
    the node and everything directly connected to it are highlighted, the rest is dimmed, and
    the node's document preview or details can be opened.
11. **Given** the cross-object graph on Pro, **When** a filter by Gewerk or due status is set,
    **Then** only matching nodes and their connections remain visible, and clearing the filter
    restores all of them.
12. **Given** the workspace "Rheinblick Hausverwaltung" is shown, **When** the workspace
    switcher is opened and "Familie Schneider" is chosen, **Then** the family's two objects are
    shown on the Advanced plan, with Pro features locked, and all entries created earlier in
    the demo are still there.

---

### User Story 5 - Owner adds an invoice from another company (Priority: P5)

The owner adds a photo of an invoice from a company that does not use ProtocolHero. After a
short wait, a suggestion card shows the recognised Gewerk, Anlage, date, cost and recommended
interval, each editable. With "Übernehmen" the entry is added to the Scheckheft.

**Why this priority**: It answers the obvious objection "what about my other craftsmen?" (demo
story S5) but is not needed to carry the main pitch.

**Independent Test**: Start the upload, accept the suggestion and check that the entry and its
document appear in Historie and Dokumente.

**Acceptance Scenarios**:

1. **Given** the owner's Scheckheft, **When** the owner adds a photo of an invoice, **Then** a
   loader is shown, followed by a suggestion card with Gewerk, Anlage, date, cost and interval.
2. **Given** the suggestion card, **When** it is displayed, **Then** it is marked as a
   suggestion, shows the source document it was derived from, and labels the interval
   "Empfehlung".
3. **Given** the suggestion card, **When** the owner taps "Übernehmen" without editing,
   **Then** the entry is added to the Historie, the invoice to Dokumente, and the next due date
   to the calendar.
4. **Given** the suggestion card, **When** the owner changes a value and taps "Übernehmen",
   **Then** the entry is added with the changed value.
5. **Given** the suggestion card, **When** the owner dismisses it, **Then** nothing is added.

---

### User Story 6 - Presenter steers the demo (Priority: P2)

A round floating button at the bottom right, in the place and style of ProtocolHero's help
button, opens "Demo-Steuerung". From there the presenter switches between Betrieb, Eigentümer
Web and Eigentümer Mobile, triggers story 1 directly, triggers a second incoming entry ("SHK
Becker sendet Wartungsbericht + Rechnung"), sets the plan and resets the demo.

**Why this priority**: The presenter has to move between two companies' and one owner's
perspective in one sitting and recover from any misstep. Without this the other stories cannot
be shown reliably in front of an audience.

**Independent Test**: Use only the Demo-Steuerung to reach every surface, trigger both incoming
entries, change the plan and reset to the initial state.

**Acceptance Scenarios**:

1. **Given** any surface except the share view, **When** the floating button is pressed,
   **Then** "Demo-Steuerung" opens with the actions: switch view, trigger story 1, trigger the
   second incoming entry, set plan, "Demo zurücksetzen".
2. **Given** the Demo-Steuerung, **When** a view is chosen, **Then** that surface is shown with
   the current demo state.
3. **Given** the Demo-Steuerung, **When** story 1 is triggered, **Then** the result is the same
   as completing the Einreichung by hand.
4. **Given** the Demo-Steuerung, **When** the second incoming entry is triggered, **Then** a
   new entry from SHK Becker with Wartungsbericht and Rechnung appears in the owner's
   Historie, "Heizung" is updated, and a toast announces it.
5. **Given** any changed demo state, **When** the page is reloaded, **Then** the state is
   unchanged.
6. **Given** any changed demo state, **When** "Demo zurücksetzen" is confirmed, **Then**
   entries, requests, share links, plan and view return to the initial state.
7. **Given** an entry that was already triggered, **When** it is triggered again, **Then** no
   duplicate is created.

---

### User Story 7 - Owner browses the Scheckheft (Priority: P3)

The owner looks through the Scheckheft: on the phone across the three tabs "Übersicht",
"Historie" (timeline grouped by Gewerk: Strom, Heizung, Wasser, Sicherheit, Dach) and
"Dokumente" (list with type chips: Protokoll, Rechnung, Foto, Garantie); on desktop in the
ProtocolHero shell under the sidebar entry "Scheckheft" in the workspace "Familie Schneider".

**Why this priority**: The results of stories 1, 2 and 5 need a believable, populated place to
land. Three to four years of history make the concept tangible.

**Independent Test**: With the initial data only, read the object's status, history and
documents on a phone and on a desktop.

**Acceptance Scenarios**:

1. **Given** the owner's phone view, **When** it opens, **Then** there are exactly three bottom
   tabs: Übersicht, Historie, Dokumente.
2. **Given** the Historie, **When** it is displayed, **Then** entries are grouped by Gewerk and
   ordered newest first, each with date, company, short description and cost.
3. **Given** the Dokumente tab, **When** a type chip is selected, **Then** only documents of
   that type are listed.
4. **Given** any Gewerk, **When** its status is shown, **Then** the status distinguishes at
   least "in Ordnung", "bald fällig" and "überfällig" by text and not by colour alone.
5. **Given** a document in the list, **When** it is opened, **Then** a preview of the
   fictitious document is shown.
6. **Given** the owner's desktop view, **When** it opens, **Then** the same object, history,
   documents and due dates are available within the ProtocolHero shell.
7. **Given** the notification list, **When** it is opened, **Then** it shows the reminders and
   incoming entries that were announced by toast.

---

### User Story 8 - Betrieb sees what is due at its customers (Priority: P4)

In the Betrieb shell, a new sidebar entry "Scheckheft" with a gold "Neu" badge lists the
company's customer objects with their upcoming due dates under "Fällig beim Kunden".

**Why this priority**: It shows the craftsman company its own benefit, a pipeline of upcoming
work, but the pitch works without it.

**Independent Test**: Open "Scheckheft" in the Betrieb sidebar and check that customer objects
and due dates are listed.

**Acceptance Scenarios**:

1. **Given** the Betrieb sidebar, **When** it is displayed, **Then** it contains the entry
   "Scheckheft" with a gold "Neu" badge alongside the existing entries.
2. **Given** the Betrieb Scheckheft page, **When** it opens, **Then** customer objects are
   listed with their next due item and date under "Fällig beim Kunden".
3. **Given** story 1 was completed, **When** the page is opened, **Then** the object
   Lindenstraße 12 shows the newly created next due date for the electrical inspection.

---

### Edge Cases

- The presenter reloads the page in the middle of a simulated delay: the action either
  completed or did not happen; no half-finished entry is left behind.
- The stored demo state is unreadable or from an older version of the prototype: the prototype
  starts from the initial state instead of failing.
- A share link is opened on a device that has never loaded the demo: the Verkaufsmappe is shown
  with the chosen contents and expiry.
- A share link was created before entries were added or before "Demo zurücksetzen": it keeps
  showing the contents as they were chosen at creation and stays valid until its expiry date.
- A share link is truncated or altered: the plain "nicht mehr verfügbar" message is shown,
  never an error.
- The presenter sets a lower plan through the Demo-Steuerung: objects and features of the
  higher plan become locked again; data created meanwhile is kept and reappears on upgrade.
- The device is offline after first load: every story still works.
- The presenter opens the phone view on a desktop screen: it is shown in a way that is still
  usable and presentable at that size.
- The presenter opens the Betrieb or Eigentümer Web shell at 360 px width: navigation and
  content remain reachable without horizontal scrolling.
- An upgrade is started while another simulated action is running: the actions do not corrupt
  each other's result.
- The owner requests an appointment for an item whose last company has no Betrieb view in the
  prototype (Schornsteinfeger Meister Wolf, Dachdecker Krämer): the owner still gets the
  confirmation; no board card is shown anywhere.
- An interval is edited to an implausible value (empty, zero, negative): it is not accepted and
  the previous value is kept.
- The demo is shown on a later day than it was built: relative statements such as "fällig in
  21 Tagen" remain correct.

## Requirements *(mandatory)*

### Functional Requirements

**Look, feel and language**

- **FR-001**: Every screen MUST match the existing ProtocolHero web app as documented in the
  reference screenshots: left sidebar, workspace switcher top-left, plan card bottom-left,
  white content area with bordered rounded cards, pill filters, black primary buttons, gold
  upgrade accents and green "Kostenlos" pills.
- **FR-002**: All UI text MUST be German in du-Form and MUST use ProtocolHero's existing terms
  (Startseite, Einreichungen, Aufgaben, Kalender, Board, Protokolle, Datenbanken, Vorlagen,
  Bezugspunkt, Freigabe, Upgrade).
- **FR-003**: The Scheckheft MUST appear as an addition to the existing navigation and screens
  and MUST NOT present itself as a separate product.
- **FR-004**: Every surface MUST show the label "Konzept-Prototyp · fiktive Daten".

**Betrieb**

- **FR-005**: The Betrieb start screen MUST give direct access to the Einreichung "Prüfung
  elektrischer Anlagen – Lindenstraße 12".
- **FR-006**: The Einreichung detail MUST offer "Abschließen", which opens a closing dialog
  containing the toggle "Ins Scheckheft des Kunden übertragen" and an editable interval
  suggestion labelled "Empfehlung".
- **FR-007**: The toggle MUST default to on when the Bezugspunkt of the Einreichung is an
  object and to off otherwise.
- **FR-008**: Confirming with the toggle on MUST, after a short simulated delay with a loader,
  add an entry with the protocol, photos and invoice to the owner's Scheckheft, update the
  status of the affected Gewerk, and create the next due date from the completion date and the
  chosen interval.
- **FR-009**: A completed Einreichung MUST be shown as completed and MUST NOT be transferable a
  second time.
- **FR-010**: The Betrieb sidebar MUST contain the entry "Scheckheft" with a gold "Neu" badge,
  leading to a list of customer objects with upcoming due dates under "Fällig beim Kunden".
- **FR-011**: The Betrieb board MUST contain the column "Anfragen aus dem Scheckheft", in which
  appointment requests from owners appear as cards. A request appears only on the board of the
  company it is addressed to.
- **FR-011a**: The Betrieb view MUST be available for two companies, Elektro Stosic and SHK
  Becker GmbH, selectable through the workspace switcher and the Demo-Steuerung. Each shows
  its own Einreichungen, board and customer objects. Elektro Stosic is the initial company.

**Eigentümer (both surfaces)**

- **FR-012**: The owner MUST be able to see, per object, its Anlagen, the status per Gewerk,
  the upcoming due items, the history of entries and all linked documents.
- **FR-013**: The Historie MUST be grouped by Gewerk (Strom, Heizung, Wasser, Sicherheit, Dach)
  with entries ordered newest first.
- **FR-014**: Documents MUST be filterable by type (Protokoll, Rechnung, Foto, Garantie) and
  each document MUST be openable as a preview.
- **FR-015**: The calendar MUST show recommended maintenance dates for heating, water,
  electricity, smoke detectors, chimney and roof, each labelled "Empfehlung".
- **FR-016**: Each due item MUST offer "Termin anfragen", which after a confirmation step
  creates a request at the company that last performed the work, marks the item as requested
  and prevents a duplicate request.
- **FR-017**: New entries and reminders MUST be announced by an in-app toast and collected in a
  notification list.
- **FR-018**: The owner MUST be able to add a document from another company by photo; the
  prototype MUST then present a suggestion card with Gewerk, Anlage, date, cost and interval,
  all editable, marked as a suggestion and shown with its source document, and MUST add the
  entry only after "Übernehmen".
- **FR-019**: The owner MUST be able to create a Verkaufsmappe by choosing contents and an
  expiry (30 days preselected) and MUST receive a link and a QR code.

**Eigentümer Mobile**

- **FR-020**: The phone experience MUST be reachable at its own address (`/m`), MUST be
  installable to the home screen, and MUST have exactly three bottom tabs: Übersicht,
  Historie, Dokumente.
- **FR-021**: Übersicht MUST list the next due items by urgency with a large "Termin anfragen"
  button.
- **FR-022**: All interactive elements on the phone experience MUST be at least 48 px in both
  dimensions, core flows MUST be completable without typing, and the wording MUST avoid
  software jargon.

**Verkaufsmappe (share view)**

- **FR-023**: A share link (`/share/:token`) MUST open a public read-only page with the badge
  "scheckheftgepflegt", the object summary, the maintenance history limited to the chosen
  contents, and the expiry date.
- **FR-023a**: A share link MUST open on any device that can reach the prototype's address,
  including one that has never opened the prototype, and MUST show the contents and expiry
  chosen at creation. The link and its QR code MUST lead to the same view.
- **FR-024**: An expired, truncated or otherwise unreadable link MUST show a plain
  unavailability message and no object data.
- **FR-025**: The share view MUST NOT contain the application navigation, the Demo-Steuerung or
  any editing function.

**Plans**

- **FR-026**: The prototype MUST offer three plans, Kostenlos, Advanced and Pro. A plan belongs
  to a workspace, and the plan card MUST show the plan of the workspace currently shown.
- **FR-026a**: There MUST be two owner workspaces: "Familie Schneider", which starts on
  Kostenlos and can be upgraded to Advanced, and "Rheinblick Hausverwaltung", which is on Pro.
  Confirming the upgrade to Pro from "Familie Schneider" MUST switch the view to "Rheinblick
  Hausverwaltung". From then on both workspaces MUST be selectable in the workspace switcher,
  and "Familie Schneider" MUST keep its Advanced plan, its two objects and its data.
- **FR-027**: Kostenlos MUST include one object, all its linked documents, the maintenance
  calendar with reminders, "Termin anfragen", own uploads and a simple read-only share link.
- **FR-028**: Advanced MUST add multiple objects (the second being "ETW Venloer Straße 8,
  Wohnung 3"), a document graph per object showing relations between documents, Anlagen and
  costs, and the Verkaufsmappe as PDF export.
- **FR-029**: Pro, shown in the workspace "Rheinblick Hausverwaltung", MUST offer a portfolio
  of 12 objects, a graph connecting documents, Anlagen,
  companies and costs across objects, filters by Gewerk and due status, a portfolio dashboard
  (overdue, due in 30 days, due in 90 days, cost per object), the chat "Frag dein Scheckheft"
  and bulk export.
- **FR-029a**: Graphs MUST show nodes (documents, Anlagen, companies, costs, and in Pro also
  objects) in a prepared, fixed arrangement, each node labelled with its name and kind.
  Selecting a node MUST highlight it and its direct connections, dim the rest, and give access
  to the node's document preview or details. Nodes cannot be dragged and the arrangement does
  not rearrange itself; the view as a whole may be moved and zoomed.
- **FR-029b**: In Pro, the filters by Gewerk and due status MUST hide and show graph nodes and
  MUST apply to the portfolio list as well.
- **FR-029c**: Where the screen is too narrow for the arrangement, the same relations MUST be
  available as a readable list, so that no horizontal scrolling is needed.
- **FR-030**: Features of a higher plan MUST be visible with a lock or crown icon and MUST open
  the upgrade modal when clicked.
- **FR-031**: The upgrade modal MUST follow the ProtocolHero pattern: text left, illustration
  right, "Nicht jetzt" and a gold upgrade button.
- **FR-032**: Confirming an upgrade MUST show the loader "Dein Scheckheft wird erweitert…" for
  about 1.2 seconds, then reveal the new features and highlight each with a gold "Neu" pulse
  for a few seconds. No payment step is shown.
- **FR-033**: "Frag dein Scheckheft" MUST offer predefined questions, answer each with a
  scripted answer after a short delay, present the answer as a suggestion, and show chips
  naming the source documents, each opening that document.
- **FR-034**: Export actions (PDF export, bulk export) MUST produce a visible, simulated result
  that the presenter can show.

**Demo control and state**

- **FR-035**: A round floating button at the bottom right MUST open "Demo-Steuerung" with:
  switch view (Betrieb Elektro Stosic / Betrieb SHK Becker / Eigentümer Web / Eigentümer
  Mobile), trigger story 1, trigger the
  second incoming entry "SHK Becker sendet Wartungsbericht + Rechnung", set plan, and "Demo
  zurücksetzen".
- **FR-035a**: On screens at least 1440 px wide, the Betrieb view MUST show the owner's phone
  experience as a live preview beside it. The preview MUST reflect every change to the owner's
  Scheckheft at the moment it happens, including the toast, MUST be fully operable, MUST be
  visually set apart as a demo aid outside the ProtocolHero screen, and MUST be hideable
  through the Demo-Steuerung. The ProtocolHero screen beside it MUST keep its reference layout.
- **FR-035b**: On narrower screens, where the preview is not shown, the success message after
  completing an Einreichung MUST offer "Im Scheckheft ansehen", leading to the owner's view.
- **FR-036**: All demo state (entries, requests, share links, plan, notifications) MUST survive
  a page reload.
- **FR-037**: "Demo zurücksetzen" MUST restore the initial state completely.
- **FR-038**: Triggering an incoming entry more than once MUST NOT create duplicates.
- **FR-039**: Everything that would involve a server in the real product MUST be simulated with
  a delay between 600 and 1500 ms and a visible loader.
- **FR-040**: The prototype MUST work without a network connection after it has been loaded
  once, and MUST NOT send any data anywhere.

**Honesty**

- **FR-041**: Maintenance intervals MUST always be labelled "Empfehlung".
- **FR-042**: No text, document or illustration MUST claim conformity with a norm or law. The
  badge "scheckheftgepflegt" describes a documented maintenance history and MUST NOT be worded
  or styled as a certificate or seal of approval.
- **FR-043**: Anything presented as recognised or generated automatically (invoice extraction,
  chat answers) MUST be shown as a suggestion together with its source document.

**Quality across surfaces**

- **FR-044**: Every surface MUST be usable at 360 px, 768 px and 1440 px width without
  horizontal scrolling or clipped content.
- **FR-045**: Every interactive element MUST be operable by keyboard with a visible focus
  indicator, text and meaningful graphics MUST meet WCAG AA contrast, and status MUST never be
  conveyed by colour alone.

**Mock data**

- **FR-046**: The initial data MUST contain the object "Einfamilienhaus, Lindenstraße 12, 50823
  Köln", built 1998, owner Familie Schneider, with the Anlagen Elektroinstallation with
  Unterverteilung, Wärmepumpe (2021), Photovoltaik 9,8 kWp with Speicher, Wallbox,
  Rauchwarnmelder (6), Trinkwasser-Enthärtung and Dach.
- **FR-047**: The initial data MUST contain the companies Elektro Stosic, SHK Becker GmbH,
  Schornsteinfeger Meister Wolf and Dachdecker Krämer, and about 25 history entries spanning
  3–4 years with dates, costs and document types.
- **FR-048**: The initial data MUST contain a due item "Heizungswartung" that is due in 21 days
  on the day of the demo and was last performed by SHK Becker.
- **FR-049**: Advanced data MUST add "ETW Venloer Straße 8, Wohnung 3" (rented) to "Familie
  Schneider". Pro data MUST provide the workspace "Rheinblick Hausverwaltung" with its own
  portfolio of 12 objects, separate from the family's objects, with enough entries, due items
  and costs to fill the dashboard, the cross-object graph and the chat answers.
- **FR-050**: All names, addresses, amounts and documents MUST be fictitious, German and
  realistic.

### Key Entities

- **Betrieb (company)**: A craftsman company that performs work and documents it. Has a name, a
  Gewerk and a board. Some are ProtocolHero customers ("connected"), others are not.
- **Eigentümer (owner)**: The person or organisation a Scheckheft belongs to. Has a workspace,
  a plan and one or more objects.
- **Objekt (object)**: A building or apartment. Has an address, a type, a construction year, a
  usage (own use or rented), Anlagen and a history.
- **Anlage (installation)**: A technical installation or building part within an object, such
  as the Wärmepumpe. Belongs to one Gewerk and has a year of installation.
- **Gewerk (trade)**: The category that groups Anlagen, entries and due items: Strom, Heizung,
  Wasser, Sicherheit, Dach. Carries a status derived from its due items.
- **Einreichung**: A company's inspection or service protocol in ProtocolHero. Has a title, a
  Bezugspunkt, a state (open or completed) and, once completed, may produce a Scheckheft entry.
- **Bezugspunkt**: What an Einreichung refers to. If it is an object, the transfer to the
  Scheckheft is offered by default.
- **Scheckheft-Eintrag (entry)**: One documented piece of work on an object: date, company,
  Gewerk, Anlage, description, cost, linked documents, and how it arrived (automatically from a
  connected company, or uploaded by the owner).
- **Dokument**: A file linked to an entry and an object, of type Protokoll, Rechnung, Foto or
  Garantie.
- **Fälligkeit (due item)**: A recommended next maintenance for an Anlage: what, when, the
  interval it was derived from, the company that did it last, and a state (upcoming, soon due,
  overdue, appointment requested).
- **Terminanfrage (appointment request)**: An owner's request for a due item, addressed to a
  company, shown as a card on that company's board.
- **Verkaufsmappe (share)**: A read-only selection of an object's Scheckheft with a token, the
  chosen contents, a creation date and an expiry date.
- **Workspace**: The context shown in the workspace switcher. Either a Betrieb (Elektro Stosic,
  SHK Becker GmbH) or an owner ("Familie Schneider", "Rheinblick Hausverwaltung"). An owner
  workspace has a plan and its own objects.
- **Plan**: Kostenlos, Advanced or Pro. Belongs to an owner workspace and determines which
  objects and features are available there.
- **Beziehung (relation)**: A link between two of: documents, Anlagen, companies, costs and
  objects. Shown in the graph as a connection between two nodes. Relations are prepared in the
  mock data; entries added during the demo are linked to their Anlage, company and documents.
- **Benachrichtigung (notification)**: An in-app message about a new entry or a reminder.
- **Vorschlag (suggestion)**: Simulated recognition or chat output, always tied to its source
  document and shown as editable or as non-binding.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: From the start screen of the reset demo on a 1440 px wide screen, a presenter
  shows story 1 (completed inspection visible in the owner's Scheckheft) in under 60 seconds
  and with at most 3 clicks, without switching views.
- **SC-002**: All demo stories S1–S5 can be shown one after another in a single session of at
  most 5 minutes without a reload, a reset or an error.
- **SC-003**: In a side-by-side comparison with the reference screenshots, a reviewer finds no
  screen whose layout, colours, shapes or wording look like a different product.
- **SC-004**: The owner's phone experience reaches a score of at least 90 in an automated
  accessibility audit, passes an automated installability check, and can be added to a phone's
  home screen.
- **SC-005**: After the first load, every demo story works with the network switched off.
- **SC-006**: No error is reported in the browser's console while running all demo stories.
- **SC-007**: Every surface is usable at 360 px, 768 px and 1440 px width with no horizontal
  scrolling and no clipped content.
- **SC-008**: The owner completes "Termin anfragen" in at most 2 taps and without typing.
- **SC-009**: After a reload at any point, the demo is in the same state as before; after
  "Demo zurücksetzen" it is in the initial state and story 1 can be shown again.
- **SC-010**: Every maintenance interval visible anywhere is labelled "Empfehlung", and no
  screen contains a claim of conformity with a norm or law.
- **SC-011**: A person who has never seen the prototype can say, after watching story 1 once,
  what the Scheckheft does for the owner.

- **SC-012**: A Verkaufsmappe QR code shown on the presenter's screen opens the same
  Verkaufsmappe on a second phone within 5 seconds of scanning.

## Assumptions

- **Reference screenshots**: The reference images are located in
  `docs/reference-ui/reference-ui/` (26 files), one level deeper than the path named in the
  constitution and the feature description. They are the binding reference.
- **Story 1 is presented on a wide screen**: The 3-click limit of story 1 is measured on a
  screen at least 1440 px wide, where the owner's phone preview is visible beside the Betrieb
  view. On narrower screens one further click ("Im Scheckheft ansehen") is needed. The
  presenter can also switch views through the Demo-Steuerung at any time.
- **Preview is on by default**: The phone preview is shown in the Betrieb view from the start
  of the reset demo. It shows the owner's Übersicht until an entry arrives, then brings the
  new entry in the Historie into view.
- **Relative dates**: Mock dates are anchored to the day the demo is opened, so that "fällig in
  21 Tagen" and the 3–4 years of history stay correct whenever the prototype is shown.
- **Lighthouse PWA score**: The requested "≥ 90 in Lighthouse PWA" cannot be measured as a
  score, because current versions of Lighthouse no longer have a PWA category. It is replaced
  in SC-004 by installability plus offline operation (SC-005), and the ≥ 90 threshold is
  applied to the accessibility audit.
- **Share links on other devices**: For the QR code to work on an audience member's phone, the
  prototype is hosted at a publicly reachable address during the demo. Shown from a local
  machine only, the link works on that machine alone. A share link cannot be revoked once
  created; it ends at its expiry date.
- **Owner-side features on the phone**: "Verkaufsmappe teilen", adding a document and the
  notification list are reached from within the three tabs, not through additional tabs.
  Advanced and Pro features (graph, portfolio, dashboard, chat, exports) are shown in
  Eigentümer Web; on the phone, a higher plan adds only the choice between objects.
- **Plan setting in the Demo-Steuerung**: Choosing Kostenlos or Advanced shows "Familie
  Schneider" on that plan; choosing Pro shows "Rheinblick Hausverwaltung". Before Pro has been
  reached once, "Rheinblick Hausverwaltung" is not listed in the workspace switcher.
- **Pro on the phone**: The owner's phone experience and the phone preview always show
  "Familie Schneider"; the Pro workspace is shown in Eigentümer Web only.
- **Appointment requests to companies outside ProtocolHero**: Only due items whose last company
  has a Betrieb view in the prototype (Elektro Stosic, SHK Becker) produce a board card. For
  other companies the request is confirmed to the owner but no board is shown.
- **Photo upload**: Any chosen image leads to the same prepared suggestion; nothing is read
  from the image. A prepared sample invoice is offered so the story works without a camera.
- **Chat**: "Frag dein Scheckheft" answers only the predefined questions; free text is not
  required and not interpreted.
- **Exports**: PDF export and bulk export show a prepared result; no document is assembled from
  the data.
- **Documents**: Protocols, invoices, photos and guarantees are prepared placeholder documents
  that look realistic and carry the prototype label.
- **No sign-in**: There are no accounts. The surface and the perspective are chosen through the
  Demo-Steuerung or the address.
- **Downgrade**: Setting a lower plan is possible only through the Demo-Steuerung, not through
  the product UI.
- **Languages**: German only; no language switch.
- **Out of scope**: Real authentication, payments, real AI, a backend, native apps,
  integrations with estate-agent portals, and delivery of notifications outside the app.
