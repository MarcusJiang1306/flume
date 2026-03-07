import { type Ref } from 'vue';
import type { NodeData, EdgeData, PlottedNodeData, LayoutDirection, RenderedEdgeData } from '../types';
import * as dagre from 'dagre';
import { dirIndexToString, getRenderDirIndex, rotatePoint, LAYOUT_ROTATION } from '../utils/direction';
import { CANVAS_CONFIG, createDagreGraph, computeBounds, DEFAULT_NODE_INFO } from '../utils/layout';

export interface LayoutOptions {
  rawNodes: Ref<NodeData[]>;
  rawEdges: Ref<EdgeData[]>;
  layoutDirection: Ref<string>;
  plottedNodes: Ref<PlottedNodeData[]>;
  plottedEdges: Ref<RenderedEdgeData[]>;
  saveDataToStorage: (nodes: NodeData[], edges: EdgeData[], layoutDirection?: string) => void;
}

export function useLayout(options: LayoutOptions) {
  const { rawNodes, rawEdges, layoutDirection, plottedNodes, plottedEdges, saveDataToStorage } = options;

  // 核心布局计算（不触发保存）
  const computeLayout = () => {
    if (rawNodes.value.length === 0) {
      plottedNodes.value = [];
      plottedEdges.value = [];
      return;
    }

    const direction = layoutDirection.value as LayoutDirection;
    const g = createDagreGraph(rawNodes.value, rawEdges.value, direction);
    
    dagre.layout(g);

    // 计算边界和旋转
    const { minX, maxX, minY, maxY } = computeBounds(g, rawNodes.value);
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;
    const rotation = LAYOUT_ROTATION[direction];
    
    // 检测是否为 90 度旋转（LR 或 RL）
    const isRotated90 = rotation === 1 || rotation === 3;

    // 计算偏移量（定位根节点）
    let offsetX: number, offsetY: number;
    
    if (rawNodes.value.length === 1) {
      // 单节点：定位到固定位置
      const node = rawNodes.value[0]!;
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
    plottedNodes.value = rawNodes.value.map(node => {
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
        height: h
      } as PlottedNodeData;
    });

    // 生成边
    plottedEdges.value = rawEdges.value
      .filter(e => g.node(e.source) && g.node(e.target))
      .map(e => ({
        ...e,
        sourceHandle: e.sourceHandle !== undefined ? dirIndexToString(getRenderDirIndex(e.sourceHandle, direction)) : undefined,
        targetHandle: e.targetHandle !== undefined ? dirIndexToString(getRenderDirIndex(e.targetHandle, direction)) : undefined
      }));
  };

  // AOP：计算 + 保存
  const updateLayout = () => {
    computeLayout();
    saveDataToStorage(rawNodes.value, rawEdges.value, layoutDirection.value);
  };

  // AOP：延迟执行（用于批量操作后统一刷新）
  const runLayout = () => {
    setTimeout(updateLayout, 0);
  };

  const setLayoutDirection = (direction: string) => {
    layoutDirection.value = direction;
    runLayout();
  };

  return {
    updateLayout,
    runLayout,
    setLayoutDirection
  };
}
