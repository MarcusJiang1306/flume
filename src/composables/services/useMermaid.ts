import type { NodeData, EdgeData } from '../../types';

/**
 * 生成 Mermaid 代码的纯函数
 * @param nodes 节点数组
 * @param edges 边数组
 * @returns Mermaid 代码字符串
 */
export function generateMermaidCode(nodes: NodeData[], edges: EdgeData[]): string {
  let code = 'flowchart TB\n';

  nodes.forEach(node => {
    code += `  ${node.id}["${node.label}"]\n`;
  });

  edges.forEach(edge => {
    const label = edge.label ? `|${edge.label}|` : '';
    code += `  ${edge.source} -->${label} ${edge.target}\n`;
  });

  return code;
}

// 保留旧 API 以保持向后兼容（可选）
import type { Ref } from 'vue';

export function useMermaid(nodes: Ref<NodeData[]>, edges: Ref<EdgeData[]>) {
  const generateCode = (): string => {
    return generateMermaidCode(nodes.value, edges.value);
  };

  return {
    generateMermaidCode: generateCode
  };
}