// 抓手位置类型
export type HandlePosition = 'top' | 'bottom' | 'left' | 'right';

// 节点数据类型
export interface NodeData {
  id: string;
  label: string;
  type: string;
  handlePositions?: HandlePosition[];
}

// 连线数据类型
export interface EdgeData {
  id: string;
  source: string;
  target: string;
  sourceHandle?: HandlePosition;
  targetHandle?: HandlePosition;
  label?: string;
  type: string;
}

// 带坐标的节点数据类型
export interface PlottedNodeData extends NodeData {
  position: {
    x: number;
    y: number;
  };
  width?: number;
  height?: number;
}

// 流程编辑器状态类型
export interface FlowEditorState {
  rawNodes: NodeData[];
  rawEdges: EdgeData[];
  plottedNodes: PlottedNodeData[];
  plottedEdges: EdgeData[];
  selectedNodeId: string | null;
}