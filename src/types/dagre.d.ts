declare module 'dagre' {
  export namespace graphlib {
    class Graph {
      constructor(options?: any);
      setGraph(options: any): void;
      setDefaultEdgeLabel(func: () => any): void;
      setNode(id: string, options: any): void;
      setEdge(source: string, target: string, options: any): void;
      node(id: string): any;
    }
  }
  export function layout(graph: any): void;
}