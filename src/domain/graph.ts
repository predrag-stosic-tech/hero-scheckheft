import { byDateDesc } from './derive';
import type {
  Anlage,
  Betrieb,
  Dokument,
  DueItem,
  DueStatus,
  Entry,
  Gewerk,
  GraphEdge,
  GraphNode,
  NodeKind,
  Objekt,
  Relation,
} from './types';

/** Texts the graph needs; passed in so the domain stays language-neutral. */
export interface GraphLabels {
  cost: string;
  cares: string;
  total: string;
}

const DEFAULT_LABELS: GraphLabels = { cost: 'Kosten', cares: 'betreut', total: 'Summe' };

export interface GraphInput {
  labels?: GraphLabels;
  scope: 'objekt' | 'portfolio';
  objekte: Objekt[];
  anlagen: Anlage[];
  entries: Entry[];
  betriebe: Betrieb[];
  dueItems: DueItem[];
  relations: Relation[];
  standaloneDocs: Array<Dokument & { objektId: string }>;
  filter?: { gewerk?: Gewerk; status?: DueStatus };
}

export interface Graph {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

const RANK: Record<DueStatus, number> = { overdue: 0, due30: 1, due90: 2, ok: 3 };
export const nodeId = (kind: NodeKind, id: string): string => `${kind}:${id}`;

/**
 * Nodes and edges for the document graph. Relations between an installation and its latest
 * documents, its company and its costs are derived from the entries; cross-links come from
 * the explicit relations. One object shows documents per installation; the portfolio shows
 * objects, installations, companies, costs per object and the latest protocol.
 */
export function buildGraph(input: GraphInput): Graph {
  const { scope, filter } = input;
  const labels = input.labels ?? DEFAULT_LABELS;
  const nodes = new Map<string, GraphNode>();
  const edges = new Map<string, GraphEdge>();
  const add = (n: GraphNode) => void (nodes.has(n.id) || nodes.set(n.id, n));
  const link = (source: string, target: string, label?: string) => {
    const id = `${source}->${target}`;
    if (nodes.has(source) && nodes.has(target) && !edges.has(id)) {
      edges.set(id, { id, source, target, label });
    }
  };

  const objektIds = new Set(input.objekte.map((o) => o.id));
  const anlageStatus = (anlageId: string): DueStatus | undefined =>
    input.dueItems
      .filter((i) => i.anlage.id === anlageId)
      .map((i) => i.status)
      .sort((a, b) => RANK[a] - RANK[b])[0];

  const anlagen = input.anlagen.filter((a) => {
    if (!objektIds.has(a.objektId)) return false;
    if (filter?.gewerk && a.gewerk !== filter.gewerk) return false;
    if (filter?.status && anlageStatus(a.id) !== filter.status) return false;
    return true;
  });

  for (const objekt of input.objekte) {
    const own = anlagen.filter((a) => a.objektId === objekt.id);
    if (own.length === 0) continue;
    const objektNode = nodeId('objekt', objekt.id);
    if (scope === 'portfolio') {
      add({ id: objektNode, kind: 'objekt', label: objekt.address.street, sub: objekt.title });
      const cost = input.entries
        .filter((e) => own.some((a) => a.id === e.anlageId))
        .reduce((sum, e) => sum + e.costCents, 0);
      const costNode = nodeId('kosten', objekt.id);
      add({ id: costNode, kind: 'kosten', label: labels.cost, value: cost });
      link(objektNode, costNode, labels.total);
    }

    for (const anlage of own) {
      const anlageNode = nodeId('anlage', anlage.id);
      add({
        id: anlageNode,
        kind: 'anlage',
        label: anlage.name,
        sub: anlage.detail,
        gewerk: anlage.gewerk,
        status: anlageStatus(anlage.id),
      });
      if (scope === 'portfolio') link(objektNode, anlageNode);

      const history = input.entries.filter((e) => e.anlageId === anlage.id).sort(byDateDesc);
      const latest = history[0];
      if (!latest) continue;

      const betriebKey = latest.betriebId ?? latest.betriebName;
      const betriebNode = nodeId('betrieb', betriebKey);
      add({ id: betriebNode, kind: 'betrieb', label: latest.betriebName });
      link(betriebNode, anlageNode, labels.cares);

      if (scope === 'objekt') {
        const costNode = nodeId('kosten', anlage.id);
        add({
          id: costNode,
          kind: 'kosten',
          label: labels.cost,
          value: history.reduce((sum, e) => sum + e.costCents, 0),
        });
        link(anlageNode, costNode, labels.total);
      }

      const docs =
        scope === 'objekt'
          ? latest.dokumente.filter((d) => d.typ !== 'foto')
          : latest.dokumente.filter((d) => d.typ === 'protokoll').slice(0, 1);
      for (const d of docs) {
        const docNode = nodeId('dokument', d.id);
        add({ id: docNode, kind: 'dokument', label: d.title, dokument: d, entryId: latest.id });
        link(anlageNode, docNode);
      }
    }
  }

  if (scope === 'objekt') {
    // `rule:<ruleId>:<typ>` refers to that document of the latest entry for the rule.
    const resolve = (ref: Relation['from']): string => {
      const [prefix, ruleId, typ] = ref.id.split(':');
      if (ref.kind !== 'dokument' || prefix !== 'rule') return nodeId(ref.kind, ref.id);
      const latest = input.entries.filter((e) => e.ruleId === ruleId).sort(byDateDesc)[0];
      const doc = latest?.dokumente.find((d) => d.typ === typ);
      return nodeId('dokument', doc?.id ?? ref.id);
    };
    for (const d of input.standaloneDocs) {
      if (!objektIds.has(d.objektId)) continue;
      // Only shown when something in the (filtered) graph points at it.
      const targeted = input.relations.some(
        (r) => r.to.kind === 'dokument' && r.to.id === d.id && nodes.has(resolve(r.from)),
      );
      if (targeted)
        add({ id: nodeId('dokument', d.id), kind: 'dokument', label: d.title, dokument: d });
    }
    for (const r of input.relations) link(resolve(r.from), resolve(r.to), r.label);
  }

  return { nodes: [...nodes.values()], edges: [...edges.values()] };
}

/** Ids of the nodes directly connected to `id`, including `id` itself. */
export function neighbours(graph: Graph, id: string): Set<string> {
  const result = new Set([id]);
  for (const e of graph.edges) {
    if (e.source === id) result.add(e.target);
    if (e.target === id) result.add(e.source);
  }
  return result;
}
