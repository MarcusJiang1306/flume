declare module 'dagre' {
  export namespace graphlib {
    class Graph {
      constructor(options?: any);
      setGraph(options: any): void;
      setDefaultEdgeLabel(func: () => any): void;
      setNode(id: string, options: any): void;
      setEdge(source: string, target: string, options: any): void;
      node(id: string): any;
      edges(): any[];
      nodes(): string[];
    }
  }
  
  export const graphlib: {
    Graph: new (options?: any) => graphlib.Graph;
  };
  
  export function layout(graph: any): void;
}