import type { NodeData, EdgeData, PlottedNodeData, LayoutDirection, RenderedEdgeData } from '../../types';
import * as dagre from 'dagre';
import { dirIndexToString, getRenderDirIndex, rotatePoint, LAYOUT_ROTATION } from '../../utils/direction';
import { CANVAS_CONFIG, createDagreGraph, computeBounds, DEFAULT_NODE_INFO } from '../../utils/layout';

export interface LayoutOptions {
  rawNodes: NodeData[];
  rawEdges: EdgeData[];
  layoutDirection: string;
}

export function useLayout(options: LayoutOptions): { plottedNodes: PlottedNodeData[]; plottedEdges: RenderedEdgeData[] } {
  const { rawNodes, rawEdges, layoutDirection } = options;

  if (rawNodes.length === 0) {
    return { plottedNodes: [], plottedEdges: [] };
  }

  const direction = layoutDirection as LayoutDirection;
  const g = createDagreGraph(rawNodes, rawEdges, direction);
  
  dagre.layout(g);

  // 计算边界和旋转
  const { minX, maxX, minY, maxY } = computeBounds(g, rawNodes);
  const centerX = (minX + maxX) / 2;
  const centerY = (minY + maxY) / 2;
  const rotation = LAYOUT_ROTATION[direction];
  
  // 检测是否为 90 度旋转（LR 或 RL）
  const isRotated90 = rotation === 1 || rotation === 3;

  // 计算偏移量（定位根节点）
  let offsetX: number, offsetY: number;
  
  if (rawNodes.length === 1) {
    // 单节点：定位到固定位置
    const node = rawNodes[0];
    const info = g.node(node.id) ?? DEFAULT_NODE_INFO;
    const w = isRotated90 ? info.height : info.width;
    const h = isRotated90 ? info.width : info.height;
    
    // 旋转节点中心点
    const rotated = rotatePoint(info.x, info.y, rotation, centerX, centerY);
    
    // 计算偏移量，使节点左上角定位到固定位置
    offsetX = CANVAS_CONFIG.rootTargetX - (rotated.x - w / 2);
    offsetY = CANVAS_CONFIG.rootTargetY - (rotated.y - h / 2);
  } else {
    // 多节点：使用默认偏移量（0, 0），由 fitView 接管视口调整
    offsetX = 0;
    offsetY = 0;
  }

  // 生成节点坐标（保持原始大小，不缩放）
  const plottedNodes = rawNodes.map(node => {
    const info = g.node(node.id) ?? DEFAULT_NODE_INFO;
    const rotated = rotatePoint(info.x, info.y, rotation, centerX, centerY);
    const w = isRotated90 ? info.height : info.width;
    const h = isRotated90 ? info.width : info.height;

    return {
      ...node,
      data: { 
        label: node.label, 
        handlePositions: node.handlePositions
      },
      position: { 
        x: rotated.x + offsetX - w / 2, 
        y: rotated.y + offsetY - h / 2 
      },
      width: w,
      height: h,
      isEditing: false
    } as PlottedNodeData;
  });

  // 生成边
  const plottedEdges = rawEdges
    .filter(e => g.node(e.source) && g.node(e.target))
    .map(e => ({
      ...e,
      sourceHandle: e.sourceHandle !== undefined ? dirIndexToString(getRenderDirIndex(e.sourceHandle, direction)) : undefined,
      targetHandle: e.targetHandle !== undefined ? dirIndexToString(getRenderDirIndex(e.targetHandle, direction)) : undefined
    }));

  return { plottedNodes, plottedEdges };
}
