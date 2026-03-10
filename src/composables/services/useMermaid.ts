import type { Ref } from 'vue';
import type { NodeData, EdgeData } from '../../types';

export function useMermaid(nodes: Ref<NodeData[]>, edges: Ref<EdgeData[]>) {
  const generateMermaidCode = (): string => {
    let code = 'flowchart TB\n';

    nodes.value.forEach(node => {
      code += `  ${node.id}["${node.label}"]\n`;
    });

    edges.value.forEach(edge => {
      const label = edge.label ? `|${edge.label}|` : '';
      code += `  ${edge.source} -->${label} ${edge.target}\n`;
    });

    return code;
  };

  return {
    generateMermaidCode
  };
}
