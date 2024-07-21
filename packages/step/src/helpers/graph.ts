export interface GraphNode {
  id: string;
  label: string;
  title?: string;
  color?: string;
  shape?: string;
}

export interface GraphEdge {
  from: string;
  to: string;
  label?: string;
  title?: string;
  color?: string;
  arrows?: 'from' | 'to' | 'middle';
  smooth?: {
    type:
      | 'dynamic'
      | 'continuous'
      | 'discrete'
      | 'diagonalCross'
      | 'straightCross'
      | 'horizontal'
      | 'vertical'
      | 'curvedCW'
      | 'curvedCCW'
      | 'cubicBezier';
    roundness: number;
  };
}

export interface GraphOptions {
  enable?: boolean;
}

export class Graph {
  private _nodes: GraphNode[] = [];
  private _edges: GraphEdge[] = [];

  constructor(options?: GraphOptions) {}

  addNode(node: GraphNode) {
    const existingNode = this._nodes.find((n) => n.id === node.id);
    if (existingNode) {
      return existingNode;
    }

    this._nodes.push(node);
    return node;
  }

  addEdge(edge: GraphEdge) {
    this._edges.push(edge);
    return edge;
  }

  get visGraphData() {
    return { nodes: [...this._nodes], edges: [...this._edges] };
  }
}
