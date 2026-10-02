# Hero Scheckheft

**Jede abgeschlossene Einreichung wird automatisch zum Eintrag im digitalen Scheckheft des Objekts – beim Eigentümer.**

CTO Product Challenge für ProtocolHero · Predrag Stošić · Oktober 2026

> Konzept-Prototyp mit fiktiven Daten. Nur Frontend, kein Backend.

## Links

| | |
|---|---|
| Live-Prototyp | https://hero-scheckheft.vercel.app |
| Video (5 Min.) | https://drive.google.com/file/d/12_lG6vtDG5vL2hzrCex5gWdlHc_3BBLN/view?usp=drive_link |
| Decision Memo (1 Seite) | [`docs/ProtocolHero_Decision-Memo_Stosic.pdf`](docs/ProtocolHero_Decision-Memo_Stosic.pdf) |
| Architektur (2 Seiten) | [`docs/ProtocolHero_Architektur_Hero-Scheckheft.pdf`](docs/ProtocolHero_Architektur_Hero-Scheckheft.pdf) |
| Präsentation | [`docs/Hero-Scheckheft_Praesentation.pptx`](docs/Hero-Scheckheft_Praesentation.pptx) |

## Die Idee in 30 Sekunden

ProtocolHero dokumentiert heute sauber beim Betrieb – beim Kunden endet der Nachweis als Einzel-PDF.
Hero Scheckheft schließt den Kreis: Protokoll, Fotos, Rechnung und nächste Fälligkeit landen automatisch im Scheckheft des Objekts, über alle Betriebe hinweg. Der Eigentümer wird erinnert und fragt mit einem Tipp den nächsten Termin an – als Karte auf dem Board des Betriebs.

**Eine Metrik:** Re-Booking-Rate – Anteil fälliger Prüfungen und Wartungen, die vor Fristablauf über das Scheckheft beim selben Betrieb beauftragt werden.

## Demo in 60 Sekunden

1. Ansicht **Betrieb** öffnen: unter „Heute“ die Einreichung *Prüfung elektrischer Anlagen – Lindenstraße 12* öffnen.
2. **Abschließen** → Schalter „Ins Scheckheft des Kunden übertragen“ → **Abschließen und übertragen**.
3. Rechts auf dem Handy von Familie Schneider: neuer Eintrag, Status „in Ordnung“, nächster Termin gesetzt.
4. Bei **Heizungswartung** auf **Termin anfragen** → die Anfrage erscheint beim Betrieb.
5. **Verkaufsmappe teilen** → Link und QR-Code für Makler und Käufer.
6. Über die **Demo-Steuerung** (runder Button unten rechts): Stufen Kostenlos / Advanced / Pro, Ansichten wechseln, Demo zurücksetzen.

## Spec-driven Development (GitHub Spec Kit)

Der Prototyp wurde mit GitHub Spec Kit entwickelt: Constitution → Specify → Plan → Tasks → Implement.
Die Artefakte liegen unter [`.specify/`](.specify/) und [`specs/`](specs/); die verwendeten Prompts unter [`docs/SPECKIT_PROMPTS.md`](docs/SPECKIT_PROMPTS.md).

## Lokal starten

```bash
npm install
npm run dev     # http://localhost:5173
npm run build   # statischer Build für Vercel
```

**Stack:** Vite · React · TypeScript · Tailwind · Zustand (localStorage) · Mock-Daten · PWA.