/**
 * React Flow type adapters.
 *
 * React Flow v12 generics require `data` to extend `Record<string, unknown>`.
 * Our domain `RoutingNodeData` is a discriminated union — so we intersect it
 * with the index signature here once, instead of in every node component.
 */

import type { Node, NodeProps } from "@xyflow/react";

import type { RoutingNodeData, RoutingNodeKind } from "@/lib/types";

export type RFNodeData = RoutingNodeData & Record<string, unknown>;
export type RFNode<K extends RoutingNodeKind = RoutingNodeKind> = Node<RFNodeData, K>;
export type RFNodeProps<K extends RoutingNodeKind = RoutingNodeKind> = NodeProps<RFNode<K>>;
