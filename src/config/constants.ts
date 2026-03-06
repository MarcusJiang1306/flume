import type { HandlePosition } from '../types';

// 画布配置
export const CANVAS_CONFIG = {
  nodeWidth: 120,
  nodeHeight: 60,
  margin: 40,
  edgesep: 35,
  rootTargetX: 267,
  rootTargetY: 100
} as const;

// 默认节点信息
export const DEFAULT_NODE_INFO = {
  x: CANVAS_CONFIG.nodeWidth / 2,
  y: CANVAS_CONFIG.nodeHeight / 2,
  width: CANVAS_CONFIG.nodeWidth,
  height: CANVAS_CONFIG.nodeHeight
};

// 默认抓手位置
export const DEFAULT_HANDLES: HandlePosition[] = ['top', 'bottom', 'left', 'right'];

// 默认根节点
export const DEFAULT_ROOT_NODE = {
  id: 'node-1',
  label: '思维导图',
  type: 'custom',
  handlePositions: DEFAULT_HANDLES
};

// 默认布局方向
export const DEFAULT_LAYOUT_DIRECTION = 'TB' as const;
