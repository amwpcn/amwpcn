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
  private _nodes: Map<string, GraphNode> = new Map();
  private _edges: GraphEdge[] = [];

  constructor(private _options?: GraphOptions) {}

  get enabled(): boolean {
    return this._options?.enable ?? false;
  }

  addNode(node: GraphNode): string {
    const existingNode = this._nodes.get(node.id);
    if (existingNode) {
      return existingNode.id;
    }

    this._nodes.set(node.id, node);
    return node.id;
  }

  addEdge(edge: GraphEdge): void {
    this._edges.push(edge);
  }

  setError(id: string): void {
    const node = this._nodes.get(id);
    if (node) {
      node.isError = true;
    }
  }

  get data(): GraphData {
    return { nodes: Array.from(this._nodes.values()), edges: [...this._edges] };
  }
}
