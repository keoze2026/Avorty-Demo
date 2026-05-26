/** Node-type registry consumed by ReactFlow's `<ReactFlow nodeTypes={NODE_TYPES} />`. */

import type { NodeTypes } from "@xyflow/react";

import { BuyerNode } from "./buyer-node";
import { CapCheckNode } from "./cap-check-node";
import { DeadEndNode } from "./dead-end-node";
import { GeoFilterNode } from "./geo-filter-node";
import { HoursFilterNode } from "./hours-filter-node";
import { InboundNode } from "./inbound-node";
import { PriorityNode } from "./priority-node";
import { TagFilterNode } from "./tag-filter-node";
import { WeightSplitNode } from "./weight-split-node";

export const NODE_TYPES: NodeTypes = {
  inbound: InboundNode,
  hoursFilter: HoursFilterNode,
  geoFilter: GeoFilterNode,
  tagFilter: TagFilterNode,
  weightSplit: WeightSplitNode,
  priority: PriorityNode,
  capCheck: CapCheckNode,
  buyer: BuyerNode,
  deadEnd: DeadEndNode,
};
