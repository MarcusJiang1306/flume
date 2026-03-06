import { type Ref } from 'vue';
import type { NodeData, EdgeData, PlottedNodeData, LayoutDirection, RenderedEdgeData } from '../types';
import * as dagre from 'dagre';
import { dirIndexToString, getRenderDirIndex, rotatePoint, computeRotatedBounds, LAYOUT_ROTATION } from '../utils/direction';
import { CANVAS_CONFIG, createDagreGraph, computeBounds, DEFAULT_NODE_INFO } from '../utils/layout';

export interface LayoutOptions {
  rawNodes: Ref<NodeData[]>;
  rawEdges: Ref<EdgeData[]>;
  layoutDirection: Ref<string>;
  plottedNodes: Ref<PlottedNodeData[]>;
  plottedEdges: Ref<RenderedEdgeData[]>;
  saveDataToStorage: (nodes: NodeData[], edges: EdgeData[]) => void;
}

export function useLayout(options: LayoutOptions) {
  const { rawNodes, rawEdges, layoutDirection, plottedNodes, plottedEdges, saveDataToStorage } = options;

  const updateLayout = () => {
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

    // 计算偏移量（根节点定位到目标位置）
    const rootNode = rawNodes.value[0];
    const rootInfo = rootNode ? g.node(rootNode.id) : null;
    const rotatedBounds = computeRotatedBounds(minX, maxX, minY, maxY, rotation);

    let offsetX: number, offsetY: number;
    if (rootInfo) {
      const rootRotated = rotatePoint(rootInfo.x, rootInfo.y, rotation, centerX, centerY);
      offsetX = CANVAS_CONFIG.rootTargetX - rootRotated.x;
      offsetY = CANVAS_CONFIG.rootTargetY - rootRotated.y;
    } else {
      offsetX = CANVAS_CONFIG.rootTargetX - rotatedBounds.minX;
      offsetY = CANVAS_CONFIG.rootTargetY - rotatedBounds.minY;
    }

    // 生成节点坐标
    plottedNodes.value = rawNodes.value.map(node => {
      const info = g.node(node.id) ?? DEFAULT_NODE_INFO;
      const rotated = rotatePoint(info.x, info.y, rotation, centerX, centerY);
      const isRotated90 = rotation === 1 || rotation === 3;
      const w = isRotated90 ? info.height : info.width;
      const h = isRotated90 ? info.width : info.height;

      return {
        ...node,
        data: { label: node.label, handlePositions: node.handlePositions },
        position: { x: rotated.x + offsetX - w / 2, y: rotated.y + offsetY - h / 2 },
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

    saveDataToStorage(rawNodes.value, rawEdges.value);
  };

  const setLayoutDirection = (direction: string) => {
    layoutDirection.value = direction;
    updateLayout();
  };

  return {
    updateLayout,
    runLayout: updateLayout,
    setLayoutDirection
  };
}
