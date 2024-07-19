interface Node {
  id: string;
  label: string;
  title?: string;
  color?: string;
  shape?: string;
}

interface Edge {
  from: string;
  to: string;
  label: string;
  title?: string;
  color?: string;
  arrows?: 'from' | 'to' | 'middle';
}

export class Graph {
  private _nodes: Node[] = [];
  private _edges: Edge[] = [];

  addNode(node: Omit<Node, 'id'>) {
    const fullNode = { id: '', ...node };
    this._nodes.push(fullNode);
    return fullNode;
  }

  addEdge(edge: Edge) {
    this._edges.push(edge);
    return edge;
  }

  get visGraphData() {
    return { nodes: [...this._nodes], edges: [...this._edges] };
  }
}
