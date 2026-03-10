import type { NodeData, EdgeData } from '../../types';

// 生成唯一 ID
let edgeCounter = parseInt(localStorage.getItem('edge-counter') || '0');
let nodeCounter = parseInt(localStorage.getItem('node-counter') || '0');

const generateEdgeId = () => {
  edgeCounter++;
  localStorage.setItem('edge-counter', edgeCounter.toString());
  return `edge-${edgeCounter}`;
};

const generateNodeId = () => {
  nodeCounter++;
  localStorage.setItem('node-counter', nodeCounter.toString());
  return `node-${nodeCounter}`;
};

// 从 localStorage 加载保存的数据
const loadSavedData = () => {
  try {
    const savedData = localStorage.getItem('mermaid-proxy-data');
    if (savedData) {
      const parsed = JSON.parse(savedData);
      return { 
        nodes: parsed.nodes || [], 
        edges: parsed.edges || [],
        layoutDirection: parsed.layoutDirection
      };
    }
  } catch (error) {
    console.error('加载保存的数据失败:', error);
  }
  return null;
};

// 保存数据到 localStorage
const saveDataToStorage = (nodes: NodeData[], edges: EdgeData[], layoutDirection?: string) => {
  try {
    localStorage.setItem('mermaid-proxy-data', JSON.stringify({ 
      nodes, 
      edges,
      layoutDirection
    }));
  } catch (error) {
    console.error('保存数据失败:', error);
  }
};

// 重置计数器
const resetCounterValues = () => {
  nodeCounter = 0;
  edgeCounter = 0;
};

// 清除 localStorage
const clearSavedData = () => {
  localStorage.removeItem('mermaid-proxy-data');
  resetCounterValues();
};

// 导出计数器重置函数（用于测试）
const resetCounters = () => {
  resetCounterValues();
  localStorage.setItem('node-counter', '0');
  localStorage.setItem('edge-counter', '0');
};

export function useStorage() {
  return {
    generateEdgeId,
    generateNodeId,
    loadSavedData,
    saveDataToStorage,
    clearSavedData,
    resetCounters
  };
}
