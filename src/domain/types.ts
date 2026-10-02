// Shared domain types. See specs/001-hero-scheckheft/data-model.md.
// Dates are ISO strings (YYYY-MM-DD), timestamps ISO date-times, money integer cents.

export type Gewerk = 'strom' | 'heizung' | 'wasser' | 'sicherheit' | 'dach';
export type DokumentTyp = 'protokoll' | 'rechnung' | 'foto' | 'garantie';
export type Plan = 'kostenlos' | 'advanced' | 'pro';
export type DueStatus = 'overdue' | 'due30' | 'due90' | 'ok';
export type GewerkStatus = 'ueberfaellig' | 'bald_faellig' | 'in_ordnung';
export type EntryOrigin = 'betrieb' | 'upload';
export type Feature =
  | 'multi_object'
  | 'object_graph'
  | 'pdf_export'
  | 'portfolio'
  | 'portfolio_graph'
  | 'filters'
  | 'dashboard'
  | 'chat'
  | 'bulk_export';
export type ShareSection = 'historie' | 'dokumente' | 'kosten' | 'faelligkeiten';
export type NodeKind = 'dokument' | 'anlage' | 'betrieb' | 'kosten' | 'objekt';
export type BetriebWorkspaceId = 'elektro-stosic' | 'shk-becker';
export type OwnerWorkspaceId = 'familie-schneider' | 'rheinblick';

export const GEWERKE: Gewerk[] = ['strom', 'heizung', 'wasser', 'sicherheit', 'dach'];
export const DOKUMENT_TYPEN: DokumentTyp[] = ['protokoll', 'rechnung', 'foto', 'garantie'];
export const SHARE_SECTIONS: ShareSection[] = ['historie', 'dokumente', 'kosten', 'faelligkeiten'];

// Display labels live in src/i18n (German and English).

export interface Betrieb {
  id: string;
  name: string;
  /** Name without the legal form, for filter chips. */
  shortName?: string;
  gewerke: Gewerk[];
  hasWorkspace: boolean;
  initials: string;
  ort: string;
}

export interface OwnerWorkspace {
  id: OwnerWorkspaceId;
  name: string;
  initials: string;
  objektIds: string[];
}

export interface Objekt {
  id: string;
  workspaceId: OwnerWorkspaceId;
  title: string;
  address: { street: string; zip: string; city: string };
  baujahr: number;
  nutzung: 'eigennutzung' | 'vermietet';
  requiredPlan: Plan;
}

export interface Anlage {
  id: string;
  objektId: string;
  name: string;
  gewerk: Gewerk;
  einbaujahr?: number;
  detail?: string;
}

export interface Rule {
  id: string;
  anlageId: string;
  title: string;
  intervalMonths: number;
}

export interface Dokument {
  id: string;
  typ: DokumentTyp;
  title: string;
  date: string;
  imageUrl?: string;
}

export interface Entry {
  id: string;
  objektId: string;
  anlageId: string;
  ruleId?: string;
  betriebId?: string;
  betriebName: string;
  date: string;
  title: string;
  description: string;
  costCents: number;
  origin: EntryOrigin;
  intervalMonths?: number;
  dokumente: Dokument[];
}

export type Bezugspunkt =
  { kind: 'objekt'; objektId: string } | { kind: 'sonstiges'; label: string };

export interface Einreichung {
  id: string;
  betriebId: BetriebWorkspaceId;
  title: string;
  vorlage: string;
  bezugspunkt: Bezugspunkt;
  kunde: string;
  eingereichtVon: string;
  /** Scenario that produces the Scheckheft entry when the Einreichung is completed. */
  scenarioId?: string;
  ruleTitle?: string;
  intervalMonths?: number;
  summary: string[];
  fotos: number;
  rechnungCents?: number;
}

export interface Relation {
  id: string;
  from: { kind: NodeKind; id: string };
  to: { kind: NodeKind; id: string };
  label?: string;
}

export interface DueItem {
  rule: Rule;
  anlage: Anlage;
  objektId: string;
  dueDate: string;
  status: DueStatus;
  intervalMonths: number;
  lastEntry: Entry;
  requested: boolean;
}

export interface Terminanfrage {
  id: string;
  ruleId: string;
  anlageId: string;
  objektId: string;
  betriebId?: string;
  requestedAt: string;
  status: 'offen' | 'erledigt';
}

export interface ShareLink {
  token: string;
  objektId: string;
  sections: ShareSection[];
  createdAt: string;
  expiresAt: string;
}

export interface Benachrichtigung {
  id: string;
  kind: 'neuer_eintrag' | 'erinnerung' | 'terminanfrage';
  audience: 'owner' | BetriebWorkspaceId;
  createdAt: string;
  read: boolean;
  entryId?: string;
  /** Data for the text, which is built in the current UI language when shown. */
  betriebName?: string;
  workspaceId?: OwnerWorkspaceId;
  ruleId?: string;
}

export interface SharePayload {
  v: 1;
  o: string;
  s: ShareSection[];
  c: string;
  e: string;
  x: Array<{
    k: string;
    d: string;
    i?: number;
    f?: { t?: string; a?: string; c?: number };
  }>;
}

export interface Intent {
  id: string;
  question: string;
  keywords: string[];
  answer: string;
  sourceDokumentIds: string[];
}

export interface GraphNode {
  id: string;
  kind: NodeKind;
  label: string;
  sub?: string;
  /** Amount in cents for cost nodes. */
  value?: number;
  gewerk?: Gewerk;
  status?: DueStatus;
  dokument?: Dokument;
  entryId?: string;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
}
