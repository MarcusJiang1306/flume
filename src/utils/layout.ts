import type { NodeData, EdgeData, LayoutDirection } from '../types';
import * as dagre from 'dagre';
import { CANVAS_CONFIG, DEFAULT_NODE_INFO } from '../config/constants';

export { CANVAS_CONFIG, DEFAULT_NODE_INFO };

// 根据布局方向获取间距配置
export function getSpacingConfig(direction: LayoutDirection) {
  const isHorizontal = direction === 'LR' || direction === 'RL';
  return {
    nodesep: isHorizontal ? 50 : 100,
    ranksep: isHorizontal ? 150 : 80
  };
}

// 创建并配置 dagre 图
export function createDagreGraph(nodes: NodeData[], edges: EdgeData[], direction: LayoutDirection) {
  const spacing = getSpacingConfig(direction);
  
  const g = new dagre.graphlib.Graph({ compound: true, directed: true, multigraph: true });
  
  g.setGraph({
    rankdir: 'TB',
    marginx: CANVAS_CONFIG.margin,
    marginy: CANVAS_CONFIG.margin,
    nodesep: spacing.nodesep,
    ranksep: spacing.ranksep,
    edgesep: CANVAS_CONFIG.edgesep
  });
  
  g.setDefaultEdgeLabel(() => ({}));
  
  nodes.forEach(node => {
    g.setNode(node.id, {
      label: node.label,
      width: CANVAS_CONFIG.nodeWidth,
      height: CANVAS_CONFIG.nodeHeight
    });
  });
  
  edges.forEach(edge => {
    if (g.node(edge.source) && g.node(edge.target)) {
      g.setEdge(edge.source, edge.target, {});
    }
  });
  
  return g;
}

// 计算节点坐标边界
export function computeBounds(g: dagre.graphlib.Graph, nodes: NodeData[]) {
  const bounds = nodes.reduce((acc, node) => {
    const info = g.node(node.id);
    if (!info) return acc;
    return {
      minX: Math.min(acc.minX, info.x - info.width / 2),
      maxX: Math.max(acc.maxX, info.x + info.width / 2),
      minY: Math.min(acc.minY, info.y - info.height / 2),
      maxY: Math.max(acc.maxY, info.y + info.height / 2)
    };
  }, { minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity });

  return bounds.minX === Infinity
    ? { minX: 0, maxX: CANVAS_CONFIG.nodeWidth, minY: 0, maxY: CANVAS_CONFIG.nodeHeight }
    : bounds;
}
