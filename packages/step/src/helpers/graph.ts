export interface GraphNode {
  id: string;
  label: string;
  ancestors?: string[];
  queueOrder?: number;
  isError?: true;
}

export interface GraphEdge {
  from: string;
  to: string;
  queueOrder?: number;
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface GraphOptions {
  enable?: boolean;
}

export class Graph {
  private _nodes: GraphNode[] = [];
  private _edges: GraphEdge[] = [];

  constructor(private _options?: GraphOptions) {}

  get enabled(): boolean {
    return this._options?.enable ?? false;
  }

  addNode(node: GraphNode): GraphNode {
    const existingNode = this._nodes.find((n) => n.id === node.id);
    if (existingNode) {
      return existingNode;
    }

    this._nodes.push(node);
    return node;
  }

  addEdge(edge: GraphEdge): GraphEdge {
    this._edges.push(edge);
    return edge;
  }

  get data(): GraphData {
    return { nodes: [...this._nodes], edges: [...this._edges] };
  }
}
