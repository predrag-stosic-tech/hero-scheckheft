# Hero Scheckheft

Clickable concept prototype: a digital service book for buildings, shown as a native part of
ProtocolHero. Frontend only. All data is fictitious; nothing is sent anywhere.

Specification, plan and tasks: `specs/001-hero-scheckheft/`.
Principles: `.specify/memory/constitution.md`.

## Run

```bash
npm install
npm run dev        # http://localhost:5173
```

```bash
npm run typecheck
npm run lint
npm run test       # unit tests for the domain logic
npm run build
npm run preview    # http://localhost:4173, service worker active
npm run test:e2e   # story 1 smoke test (needs: npx playwright install chromium)
```

## Surfaces

| Address | Surface |
|---------|---------|
| `/betrieb` | Craftsman company (Elektro Stosic, SHK Becker) in the ProtocolHero shell |
| `/eigentuemer` | Owner on desktop (Familie Schneider; Rheinblick Hausverwaltung on Pro) |
| `/m` | Owner on the phone, installable |
| `/share/:token` | Public read-only Verkaufsmappe |

The round button at the bottom right opens the **Demo-Steuerung**: switch view, trigger
incoming entries, set the plan, reset the demo.

## Demo order

Start with "Demo zurücksetzen" and a browser window at least 1440 px wide, so the phone
preview is visible beside the Betrieb view.

1. **S1** `/betrieb`: click "Prüfung elektrischer Anlagen – Lindenstraße 12" → "Abschließen"
   → "Abschließen und übertragen". The entry appears in the phone preview.
2. **S2** in the phone preview or on `/m`: Übersicht → Heizungswartung → "Termin anfragen" →
   "Anfrage senden". Demo-Steuerung → "Betrieb · SHK Becker" → Board.
   Then Demo-Steuerung → "SHK Becker sendet Wartungsbericht + Rechnung".
3. **S3** `/m`: "Verkaufsmappe teilen" → "Link erstellen" → open the link or scan the QR code.
4. **S4** `/eigentuemer`: "Weiteres Objekt hinzufügen" → upgrade to Advanced → open an object →
   tab "Graph". Then "Portfolio" or "Frag dein Scheckheft" → upgrade to Pro.
5. **S5** `/m`: "Dokument hinzufügen" → "Beispielrechnung verwenden" → "Übernehmen".

Show S2 before triggering the SHK Becker entry: that entry is the Heizungswartung and moves
its due date a year out.

## Deploy

Static build (`dist/`). `vercel.json` rewrites every path to `index.html`.

```bash
npx vercel --prod
```

The QR code of a Verkaufsmappe only works on another device when the prototype is served from
a public address. After deploying, open the address once on the presentation machine while
online; from then on it works offline.

Deployed address: _not deployed yet_

## Notes

- State lives in `localStorage` under `hero-scheckheft`. Fixtures are rebuilt relative to
  today on every load, so "fällig in 21 Tagen" stays true on any day.
- Maintenance intervals are recommendations made up for the prototype. The prototype makes no
  claim about norms or legal requirements.
- The share token is neither secret nor signed. It demonstrates the sharing flow, not access
  control.
- Colours are defined only in `src/styles/tokens.css`; a lint rule rejects hex values in
  components.
