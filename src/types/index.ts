// 方向常量（数字索引）
export const DIR = { BOTTOM: 0, LEFT: 1, TOP: 2, RIGHT: 3 } as const;

// 方向转换偏移（用于抓手方向转换）
export const LAYOUT_ROT = { TB: 0, RL: 1, BT: 2, LR: 3 } as const;

// 方向索引到字符串的映射
export const DIR_MAP = ['bottom', 'left', 'top', 'right'] as const;

// 布局方向类型
export type LayoutDirection = keyof typeof LAYOUT_ROT;

// 方向索引类型
export type DirectionIndex = typeof DIR[keyof typeof DIR];

// 抓手位置类型（从 DIR_MAP 推导）
export type HandlePosition = typeof DIR_MAP[number];

// 节点数据类型，感觉是不是可以和custom合并
export interface NodeData {
  id: string;
  label: string;
  type: string;
  handlePositions?: HandlePosition[];
}

// 连线数据类型（存储格式，使用数字索引）
export interface EdgeData {
  id: string;
  source: string;
  target: string;
  sourceHandle?: DirectionIndex;
  targetHandle?: DirectionIndex;
  label?: string;
  type: string;
}

// 渲染用的连线数据类型（使用字符串）
export interface RenderedEdgeData {
  id: string;
  source: string;
  target: string;
  sourceHandle?: HandlePosition;
  targetHandle?: HandlePosition;
  label?: string;
  type: string;
  isEditing?: boolean;
}

// 带坐标的节点数据类型
export interface PlottedNodeData extends NodeData {
  position: {
    x: number;
    y: number;
  };
  width?: number;
  height?: number;
  isEditing?: boolean;
}

// 流程编辑器状态类型
export interface FlowEditorState {
  rawNodes: NodeData[];
  rawEdges: EdgeData[];
  plottedNodes: PlottedNodeData[];
  plottedEdges: EdgeData[];
  selectedNodeId: string | null;
}