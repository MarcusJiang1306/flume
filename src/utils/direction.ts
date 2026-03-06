import { LAYOUT_ROT, DIR_MAP, DIR, type DirectionIndex, type LayoutDirection, type HandlePosition } from '../types';
import { DEFAULT_HANDLES } from '../config/constants';

export { DIR, DEFAULT_HANDLES, LAYOUT_ROT as LAYOUT_ROTATION };

// 方向转换
export function getRenderDirIndex(storedDir: DirectionIndex, layout: LayoutDirection): DirectionIndex {
  return (storedDir + LAYOUT_ROT[layout]) % 4 as DirectionIndex;
}

export function getStoredDirIndex(renderDir: DirectionIndex, layout: LayoutDirection): DirectionIndex {
  return (renderDir - LAYOUT_ROT[layout] + 4) % 4 as DirectionIndex;
}

export function dirIndexToString(dirIndex: DirectionIndex): HandlePosition {
  return DIR_MAP[dirIndex] as HandlePosition;
}

export function stringToDirIndex(dir: HandlePosition): DirectionIndex {
  return DIR_MAP.indexOf(dir) as DirectionIndex;
}

// 旋转矩阵：索引与 LAYOUT_ROT 对应 [TB, RL, BT, LR]
const ROTATION_MATRIX: Array<[number, number, number, number]> = [
  [1, 0, 0, 1],   // TB: 不旋转
  [0, -1, 1, 0],  // RL: 顺时针90度
  [-1, 0, 0, -1], // BT: 180度
  [0, 1, -1, 0]   // LR: 逆时针90度
];

// 旋转点坐标
export function rotatePoint(
  x: number, y: number, rotation: number, centerX: number, centerY: number
): { x: number; y: number } {
  const dx = x - centerX;
  const dy = y - centerY;
  const m = ROTATION_MATRIX[rotation] ?? [1, 0, 0, 1];
  return {
    x: m[0] * dx + m[1] * dy + centerX,
    y: m[2] * dx + m[3] * dy + centerY
  };
}

// 计算旋转后的边界框
export function computeRotatedBounds(
  minX: number, maxX: number, minY: number, maxY: number, rotation: number
) {
  const cx = (minX + maxX) / 2;
  const cy = (minY + maxY) / 2;
  const corners = [
    rotatePoint(minX, minY, rotation, cx, cy),
    rotatePoint(maxX, minY, rotation, cx, cy),
    rotatePoint(minX, maxY, rotation, cx, cy),
    rotatePoint(maxX, maxY, rotation, cx, cy)
  ];
  return {
    minX: Math.min(...corners.map(p => p.x)),
    maxX: Math.max(...corners.map(p => p.x)),
    minY: Math.min(...corners.map(p => p.y)),
    maxY: Math.max(...corners.map(p => p.y))
  };
}
