"use client";

/**
 * ReactFlow wrapper for the Vortyx routing editor.
 * Handles drag-from-palette, connection rules, selection, and exposes the
 * working graph state up to the parent page via callbacks.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  type Connection,
  type Edge,
  type EdgeChange,
  type Node,
  type NodeChange,
  type OnConnect,
  type OnEdgesChange,
  type OnNodesChange,
  useReactFlow,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { NODE_TYPES } from "./nodes";
import { NODE_META } from "./node-meta";
import type { RFNode, RFNodeData } from "./nodes/types";
import type {
  RoutingEdge,
  RoutingNode,
  RoutingNodeData,
  RoutingNodeKind,
} from "@/lib/types";

export type FlowNode = RFNode;
export type FlowEdge = Edge;

interface RoutingCanvasInnerProps {
  initialNodes: RoutingNode[];
  initialEdges: RoutingEdge[];
  onChange: (nodes: RoutingNode[], edges: RoutingEdge[]) => void;
  onSelectNode: (node: RoutingNode | null) => void;
  /** Bumped by the parent when a patch is pushed via `patchedNode`. */
  patchVersion: number;
  patchedNode: { id: string; data: Partial<RoutingNodeData> } | null;
}

let dropCounter = 0;

function toFlowNode(n: RoutingNode): FlowNode {
  return {
    id: n.id,
    type: n.type,
    position: n.position,
    data: n.data as RFNodeData,
  };
}
function toFlowEdge(e: RoutingEdge): FlowEdge {
  return {
    id: e.id,
    source: e.source,
    target: e.target,
    sourceHandle: e.sourceHandle,
    targetHandle: e.targetHandle,
    label: e.label,
    type: "smoothstep",
    animated: true,
    style: { stroke: "var(--accent)", strokeWidth: 1.5 },
    labelStyle: { fill: "var(--muted-foreground)", fontSize: 10, fontFamily: "var(--font-mono)" },
    labelBgStyle: { fill: "var(--card)" },
  };
}
function fromFlowNode(n: FlowNode): RoutingNode {
  return {
    id: n.id,
    type: (n.type as RoutingNodeKind) ?? (n.data?.kind as RoutingNodeKind) ?? "inbound",
    position: n.position,
    data: n.data as RoutingNodeData,
  };
}
function fromFlowEdge(e: FlowEdge): RoutingEdge {
  return {
    id: e.id,
    source: e.source,
    target: e.target,
    sourceHandle: e.sourceHandle ?? undefined,
    targetHandle: e.targetHandle ?? undefined,
    label: typeof e.label === "string" ? e.label : undefined,
  };
}

function RoutingCanvasInner({
  initialNodes,
  initialEdges,
  onChange,
  onSelectNode,
  patchVersion,
  patchedNode,
}: RoutingCanvasInnerProps) {
  const [nodes, setNodes] = useState<FlowNode[]>(() => initialNodes.map(toFlowNode));
  const [edges, setEdges] = useState<FlowEdge[]>(() => initialEdges.map(toFlowEdge));
  const wrapperRef = useRef<HTMLDivElement>(null);
  const lastSelectedId = useRef<string | null>(null);
  const { screenToFlowPosition } = useReactFlow();

  // Sync up to the parent whenever the graph mutates locally.
  useEffect(() => {
    onChange(nodes.map(fromFlowNode), edges.map(fromFlowEdge));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodes, edges]);

  // Apply parent-driven patches (inspector → node data)
  useEffect(() => {
    if (!patchedNode) return;
    setNodes((ns) =>
      ns.map((n) =>
        n.id === patchedNode.id
          ? ({ ...n, data: { ...n.data, ...patchedNode.data } as RFNodeData })
          : n,
      ),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patchVersion]);

  const onNodesChange: OnNodesChange<FlowNode> = useCallback(
    (changes: NodeChange<FlowNode>[]) => setNodes((ns) => applyNodeChanges(changes, ns)),
    [],
  );
  const onEdgesChange: OnEdgesChange<FlowEdge> = useCallback(
    (changes: EdgeChange<FlowEdge>[]) => setEdges((es) => applyEdgeChanges(changes, es)),
    [],
  );
  const onConnect: OnConnect = useCallback(
    (conn: Connection) => {
      const edge: FlowEdge = {
        id: `e_${conn.source}_${conn.sourceHandle ?? "out"}_${conn.target}_${Date.now().toString(36)}`,
        source: conn.source!,
        target: conn.target!,
        sourceHandle: conn.sourceHandle ?? undefined,
        targetHandle: conn.targetHandle ?? "in",
        type: "smoothstep",
        animated: true,
        style: { stroke: "var(--accent)", strokeWidth: 1.5 },
      };
      setEdges((es) => addEdge(edge, es));
    },
    [],
  );

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const kind = e.dataTransfer.getData("application/reactflow") as RoutingNodeKind | "";
      if (!kind) return;

      const position = screenToFlowPosition({ x: e.clientX, y: e.clientY });
      dropCounter += 1;
      const meta = NODE_META[kind];
      const id = `n_${kind}_${Date.now().toString(36)}_${dropCounter}`;
      const newNode: FlowNode = {
        id,
        type: kind,
        position,
        data: meta.defaultData() as RFNodeData,
      };
      setNodes((ns) => ns.concat(newNode));
    },
    [screenToFlowPosition],
  );

  const onSelectionChange = useCallback(
    ({ nodes: selected }: { nodes: FlowNode[] }) => {
      const first = selected[0];
      const nextId = first?.id ?? null;
      // De-dupe: if the same node id is reported again, don't fire upward.
      // React Flow can re-emit this when the callback identity changes,
      // and `fromFlowNode` produces a new object each time, which previously
      // cascaded into an infinite render loop (React error #185).
      if (nextId === lastSelectedId.current) return;
      lastSelectedId.current = nextId;
      onSelectNode(first ? fromFlowNode(first) : null);
    },
    [onSelectNode],
  );

  // Minimap node color follows the kind's tone.
  const minimapNodeColor = useMemo(
    () => (node: Node) => {
      const kind = (node.type as RoutingNodeKind) ?? "inbound";
      const tone = NODE_META[kind].tone;
      if (tone === "cyan") return "#3bb6ff";
      if (tone === "emerald") return "#22c55e";
      if (tone === "violet") return "#a855f7";
      if (tone === "amber") return "#f59e0b";
      return "#ef4444";
    },
    [],
  );

  return (
    <div ref={wrapperRef} className="h-full w-full" onDragOver={onDragOver} onDrop={onDrop}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={NODE_TYPES}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onSelectionChange={onSelectionChange}
        proOptions={{ hideAttribution: true }}
        fitView
        fitViewOptions={{ padding: 0.18 }}
        defaultEdgeOptions={{
          type: "smoothstep",
          animated: true,
          style: { stroke: "var(--accent)", strokeWidth: 1.5 },
        }}
        snapToGrid
        snapGrid={[16, 16]}
        minZoom={0.4}
        maxZoom={1.5}
        deleteKeyCode={["Delete", "Backspace"]}
        className="bg-background"
      >
        <Background variant={BackgroundVariant.Dots} gap={16} size={1} color="var(--grid-line)" />
        <Controls
          showInteractive={false}
          className="!rounded-lg !border !border-border !bg-card !shadow-sm"
        />
        <MiniMap
          pannable
          zoomable
          nodeColor={minimapNodeColor}
          nodeStrokeWidth={2}
          className="!rounded-lg !border !border-border !bg-card"
          maskColor="rgba(0,0,0,0.04)"
        />
      </ReactFlow>
    </div>
  );
}

export interface RoutingCanvasProps extends RoutingCanvasInnerProps {
  className?: string;
}

export function RoutingCanvas(props: RoutingCanvasProps) {
  return (
    <div className={props.className}>
      <ReactFlowProvider>
        <RoutingCanvasInner {...props} />
      </ReactFlowProvider>
    </div>
  );
}
