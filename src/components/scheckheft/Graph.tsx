import dagre from '@dagrejs/dagre';
import {
  Background,
  Controls,
  Handle,
  Position,
  ReactFlow,
  type Edge,
  type Node,
  type NodeProps,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Building2, Coins, FileText, Wrench, type LucideIcon } from 'lucide-react';
import { createContext, useContext, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/pill';
import { neighbours, type Graph as GraphData } from '@/domain/graph';
import type { GraphNode, NodeKind } from '@/domain/types';
import { useT, type Dict } from '@/i18n';
import { cn } from '@/lib/cn';
import { formatEuro } from '@/lib/format';
import { useMediaQuery } from '@/lib/hooks';
import { dueToGewerkStatus, GEWERK_ICON, GewerkStatusPill } from './base';

const KIND_ICON: Record<NodeKind, LucideIcon> = {
  dokument: FileText,
  anlage: Wrench,
  betrieb: Wrench,
  kosten: Coins,
  objekt: Building2,
};
const KIND_STYLE: Record<NodeKind, string> = {
  dokument: 'bg-white border-line',
  anlage: 'bg-white border-primary',
  betrieb: 'bg-tint border-line',
  kosten: 'bg-gold-tint border-gold',
  objekt: 'bg-primary border-primary text-white',
};

const NODE_W = 190;
const NODE_H = 46;
const NODE_H_COMPACT = 36;

function nodeLabel(n: GraphNode): string {
  return n.kind === 'kosten' && n.value !== undefined ? formatEuro(n.value) : n.label;
}

function kindLabel(t: Dict, kind: NodeKind): string {
  return t.nodeKind[kind];
}

interface Selection {
  selected: string | null;
  active: Set<string> | null;
}
const SelectionCtx = createContext<Selection>({ selected: null, active: null });
const CompactCtx = createContext(false);

type FlowNode = Node<{ node: GraphNode }, 'scheckheft'>;

function ScheckheftNode({ data }: NodeProps<FlowNode>) {
  const { selected, active } = useContext(SelectionCtx);
  const compact = useContext(CompactCtx);
  const t = useT();
  const n = data.node;
  const Icon = n.kind === 'anlage' && n.gewerk ? GEWERK_ICON[n.gewerk] : KIND_ICON[n.kind];
  const dimmed = active !== null && !active.has(n.id);
  return (
    <>
      <Handle type="target" position={Position.Left} className="!size-1 !border-0 !bg-line" />
      <button
        type="button"
        // The click is handled by onNodeClick on the flow, for mouse and keyboard alike.
        aria-pressed={selected === n.id}
        aria-label={`${kindLabel(t, n.kind)}: ${nodeLabel(n)}`}
        style={{ width: NODE_W, height: compact ? NODE_H_COMPACT : NODE_H }}
        className={cn(
          'nopan flex items-center gap-2 rounded-control border px-2.5 text-left shadow-card transition-opacity',
          KIND_STYLE[n.kind],
          selected === n.id && 'ring-2 ring-gold',
          dimmed && 'opacity-25',
        )}
      >
        <Icon className="size-4 shrink-0" aria-hidden />
        <span className="min-w-0">
          <span className="block truncate text-[12px] font-medium leading-tight">
            {nodeLabel(n)}
          </span>
          <span
            className={cn(
              'block truncate text-[10px] leading-tight',
              n.kind === 'objekt' ? 'text-white' : 'text-muted',
            )}
          >
            {kindLabel(t, n.kind)}
            {n.sub ? ` · ${n.sub}` : ''}
          </span>
        </span>
      </button>
      <Handle type="source" position={Position.Right} className="!size-1 !border-0 !bg-line" />
    </>
  );
}

const nodeTypes = { scheckheft: ScheckheftNode };

/** Horizontal and vertical gaps of the prepared arrangement. */
const GAP_X = 44;
const GAP_Y = 16;

function place(n: GraphNode, x: number, y: number): FlowNode {
  return {
    id: n.id,
    type: 'scheckheft',
    position: { x, y },
    data: { node: n },
    draggable: false,
    connectable: false,
    selectable: false,
  };
}

/**
 * Arrangement for one object: every installation is a row. Its company sits to the left,
 * its documents and costs to the right, and documents that several rows point at (such as
 * the Nebenkostenabrechnung) in a last column. Fixed positions, no physics.
 */
function layoutRows(graph: GraphData): FlowNode[] {
  const byId = new Map(graph.nodes.map((n) => [n.id, n]));
  const col = (i: number) => i * (NODE_W + GAP_X);
  const row = (i: number) => i * (NODE_H + GAP_Y);
  const placed = new Map<string, FlowNode>();
  const anlagen = graph.nodes.filter((n) => n.kind === 'anlage');
  const rowOf = new Map(anlagen.map((a, i) => [a.id, i]));
  let widest = 0;

  anlagen.forEach((a, i) => {
    placed.set(a.id, place(a, col(1), row(i)));
    const linked = graph.edges
      .filter((e) => e.source === a.id)
      .map((e) => byId.get(e.target)!)
      .filter((n) => n.kind === 'dokument' || n.kind === 'kosten')
      // Documents first, the cost total at the end of the row.
      .sort((x, y) => Number(x.kind === 'kosten') - Number(y.kind === 'kosten'));
    linked.forEach((n, j) => placed.set(n.id, place(n, col(2 + j), row(i))));
    widest = Math.max(widest, linked.length);
  });

  // Companies: beside the middle of the rows they look after, without overlapping.
  let nextFree = 0;
  graph.nodes
    .filter((n) => n.kind === 'betrieb')
    .map((n) => {
      const rows = graph.edges
        .filter((e) => e.source === n.id && rowOf.has(e.target))
        .map((e) => rowOf.get(e.target)!);
      const mean = rows.length ? rows.reduce((sum, r) => sum + r, 0) / rows.length : 0;
      return { n, y: row(mean) };
    })
    .sort((a, b) => a.y - b.y)
    .forEach(({ n, y }) => {
      const top = Math.max(y, nextFree);
      placed.set(n.id, place(n, col(0), top));
      nextFree = top + NODE_H + GAP_Y;
    });

  // Everything else (documents shared by several rows): last column, near its sources.
  nextFree = 0;
  graph.nodes
    .filter((n) => !placed.has(n.id))
    .map((n) => {
      const ys = graph.edges
        .filter((e) => e.target === n.id && placed.has(e.source))
        .map((e) => placed.get(e.source)!.position.y);
      return { n, y: ys.length ? ys.reduce((sum, v) => sum + v, 0) / ys.length : 0 };
    })
    .sort((a, b) => a.y - b.y)
    .forEach(({ n, y }) => {
      const top = Math.max(y, nextFree);
      placed.set(n.id, place(n, col(2 + widest), top));
      nextFree = top + NODE_H + GAP_Y;
    });

  return graph.nodes.map((n) => placed.get(n.id)!);
}

/**
 * Arrangement for the portfolio: a layered layout computed once with dagre.
 * Fixed positions, no physics, no re-arrangement while the graph is shown.
 */
function layoutLayered(graph: GraphData): FlowNode[] {
  const kind = new Map(graph.nodes.map((n) => [n.id, n.kind]));
  const g = new dagre.graphlib.Graph();
  g.setGraph({ rankdir: 'LR', nodesep: 6, ranksep: 56, marginx: 12, marginy: 12 });
  g.setDefaultEdgeLabel(() => ({}));
  for (const n of graph.nodes) g.setNode(n.id, { width: NODE_W, height: NODE_H_COMPACT });
  for (const e of graph.edges) {
    const from = kind.get(e.source);
    // Cross-links back to an installation are drawn but do not shape the arrangement.
    if (kind.get(e.target) === 'anlage' && from !== 'betrieb' && from !== 'objekt') continue;
    g.setEdge(e.source, e.target);
  }
  dagre.layout(g);
  return graph.nodes.map((n) => {
    const p = g.node(n.id);
    return place(n, p.x - NODE_W / 2, p.y - NODE_H_COMPACT / 2);
  });
}

function layout(graph: GraphData, compact: boolean): FlowNode[] {
  return compact ? layoutLayered(graph) : layoutRows(graph);
}

/** The same relations as a list: used on narrow screens and as the readable alternative. */
export function RelationList({
  graph,
  onOpenDokument,
}: {
  graph: GraphData;
  onOpenDokument: (node: GraphNode) => void;
}) {
  const t = useT();
  const byId = new Map(graph.nodes.map((n) => [n.id, n]));
  const roots = graph.nodes.filter((n) => n.kind === 'anlage' || n.kind === 'objekt');
  return (
    <ul className="space-y-3">
      {roots.map((root) => {
        const Icon =
          root.kind === 'anlage' && root.gewerk ? GEWERK_ICON[root.gewerk] : KIND_ICON[root.kind];
        const linked = graph.edges
          .filter((e) => e.source === root.id || e.target === root.id)
          .map((e) => ({ edge: e, other: byId.get(e.source === root.id ? e.target : e.source)! }));
        return (
          <li key={root.id} className="rounded-card border border-line bg-white p-3.5">
            <p className="flex items-center gap-2 font-semibold">
              <Icon className="size-4" aria-hidden />
              {root.label}
              {root.status && <GewerkStatusPill status={dueToGewerkStatus(root.status)} />}
            </p>
            <ul className="mt-2 space-y-1.5">
              {linked.map(({ edge, other }) => (
                <li key={edge.id} className="flex flex-wrap items-center gap-2 text-[13px]">
                  <Badge tone={other.kind === 'kosten' ? 'gold' : 'neutral'}>
                    {kindLabel(t, other.kind)}
                  </Badge>
                  {other.dokument ? (
                    <button
                      type="button"
                      className="min-h-[32px] text-left underline underline-offset-4"
                      onClick={() => onOpenDokument(other)}
                    >
                      {nodeLabel(other)}
                    </button>
                  ) : (
                    <span>{nodeLabel(other)}</span>
                  )}
                  {edge.label && <span className="text-muted">· {edge.label}</span>}
                </li>
              ))}
            </ul>
          </li>
        );
      })}
    </ul>
  );
}

interface GraphProps {
  graph: GraphData;
  onOpenDokument: (node: GraphNode) => void;
  height?: number;
  /** Smaller nodes and stacked documents, for the portfolio graph with many rows. */
  compact?: boolean;
}

/**
 * Document graph. Nodes sit in a prepared arrangement and cannot be dragged; the view can be
 * moved and zoomed. Selecting a node highlights what it is connected to.
 */
export default function Graph({
  graph,
  onOpenDokument,
  height = 560,
  compact = false,
}: GraphProps) {
  const t = useT();
  const roomy = useMediaQuery('(min-width: 768px)');
  const [selected, setSelected] = useState<string | null>(null);
  const nodes = useMemo(() => layout(graph, compact), [graph, compact]);
  const current = selected ? graph.nodes.find((n) => n.id === selected) : undefined;
  const active = useMemo(() => (current ? neighbours(graph, current.id) : null), [graph, current]);

  const edges: Edge[] = useMemo(
    () =>
      graph.edges.map((e) => {
        const on =
          !active ||
          (active.has(e.source) &&
            active.has(e.target) &&
            (e.source === selected || e.target === selected));
        return {
          id: e.id,
          source: e.source,
          target: e.target,
          label: on && active ? e.label : undefined,
          selectable: false,
          focusable: false,
          style: {
            stroke: on && active ? 'var(--color-gold-strong)' : 'var(--color-line)',
            strokeWidth: on && active ? 2 : 1.25,
            opacity: on ? 1 : 0.25,
          },
          labelStyle: { fontSize: 11, fill: 'var(--color-muted)' },
        };
      }),
    [graph, active, selected],
  );

  if (graph.nodes.length === 0) {
    return (
      <p className="rounded-card border border-dashed border-line p-6 text-center text-[14px] text-muted">
        {t.graph.empty}
      </p>
    );
  }

  if (!roomy) return <RelationList graph={graph} onOpenDokument={onOpenDokument} />;

  return (
    <SelectionCtx.Provider value={{ selected, active }}>
      <CompactCtx.Provider value={compact}>
        <div
          className="overflow-hidden rounded-card border border-line bg-sidebar"
          style={{ height }}
        >
          <ReactFlow
            key={graph.nodes.length + ':' + graph.edges.length}
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            fitView
            fitViewOptions={{ padding: 0.04 }}
            minZoom={0.2}
            maxZoom={1.5}
            nodesDraggable={false}
            nodesConnectable={false}
            elementsSelectable={false}
            nodesFocusable={false}
            edgesFocusable={false}
            onNodeClick={(_, node) => setSelected((cur) => (cur === node.id ? null : node.id))}
            onPaneClick={() => setSelected(null)}
            proOptions={{ hideAttribution: true }}
            aria-label={t.graph.label}
          >
            <Background gap={18} color="var(--color-line)" />
            <Controls showInteractive={false} position="bottom-left" />
          </ReactFlow>
        </div>
      </CompactCtx.Provider>
      <div
        aria-live="polite"
        className="mt-3 flex min-h-[52px] flex-wrap items-center gap-3 rounded-card border border-line bg-white px-3.5 py-2"
      >
        {current ? (
          <>
            <Badge tone={current.kind === 'kosten' ? 'gold' : 'neutral'}>
              {kindLabel(t, current.kind)}
            </Badge>
            <span className="font-medium">{nodeLabel(current)}</span>
            {current.status && <GewerkStatusPill status={dueToGewerkStatus(current.status)} />}
            <span className="text-[13px] text-muted">
              {t.graph.highlighted((active?.size ?? 1) - 1)}
            </span>
            {current.dokument && (
              <Button size="sm" className="ml-auto" onClick={() => onOpenDokument(current)}>
                <FileText className="size-4" aria-hidden />
                {t.graph.openDoc}
              </Button>
            )}
          </>
        ) : (
          <span className="text-[13px] text-muted">
            {t.graph.hint}
          </span>
        )}
      </div>
    </SelectionCtx.Provider>
  );
}
