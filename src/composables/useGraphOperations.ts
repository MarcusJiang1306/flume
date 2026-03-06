import { nextTick, type Ref } from 'vue';
import type { NodeData, EdgeData, LayoutDirection } from '../types';
import { DIR, stringToDirIndex, getStoredDirIndex, DEFAULT_HANDLES } from '../utils/direction';

export interface GraphOperationsOptions {
  rawNodes: Ref<NodeData[]>;
  rawEdges: Ref<EdgeData[]>;
  selectedNodeId: Ref<string | null>;
  selectedEdgeId: Ref<string | null>;
  layoutDirection: Ref<string>;
  generateNodeId: () => string;
  generateEdgeId: () => string;
  saveDataToStorage: (nodes: NodeData[], edges: EdgeData[]) => void;
  updateLayout: () => void;
  runLayout: () => void;
}

export function useGraphOperations(options: GraphOperationsOptions) {
  const {
    rawNodes,
    rawEdges,
    selectedNodeId,
    selectedEdgeId,
    layoutDirection,
    generateNodeId,
    generateEdgeId,
    saveDataToStorage,
    updateLayout,
    runLayout
  } = options;

  const select = (type: 'node' | 'edge', id: string) => {
    selectedNodeId.value = type === 'node' ? id : null;
    selectedEdgeId.value = type === 'edge' ? id : null;
  };

  const updateNodeLabel = (id: string, label: string) => {
    updateNode(id, { label });
  };

  const addChildNode = () => {
    if (!selectedNodeId.value) return;

    const parentId = selectedNodeId.value;
    const newId = generateNodeId();
    
    rawNodes.value.push({ id: newId, label: '请输入文字', type: 'custom', handlePositions: DEFAULT_HANDLES });

    rawEdges.value.push({
      id: generateEdgeId(),
      source: parentId,
      target: newId,
      sourceHandle: DIR.BOTTOM,
      targetHandle: DIR.TOP,
      type: 'smoothstep'
    });

    nextTick(updateLayout);
  };

  const handleConnect = (connection: any) => {
    const currentLayout = layoutDirection.value as LayoutDirection;
    
    // 将渲染方向转换为存储方向（逻辑方向，基于 TB 布局）
    const renderSourceIndex = stringToDirIndex(connection.sourceHandle);
    const renderTargetIndex = stringToDirIndex(connection.targetHandle);
    
    const storedSourceHandle = getStoredDirIndex(renderSourceIndex, currentLayout);
    const storedTargetHandle = getStoredDirIndex(renderTargetIndex, currentLayout);
    
    if (rawEdges.value.some(e => 
      e.source === connection.source && 
      e.target === connection.target && 
      e.sourceHandle === storedSourceHandle && 
      e.targetHandle === storedTargetHandle
    )) return;

    rawEdges.value.push({
      id: generateEdgeId(),
      source: connection.source,
      target: connection.target,
      sourceHandle: storedSourceHandle,
      targetHandle: storedTargetHandle,
      label: '',
      type: 'default'
    });
    
    saveDataToStorage(rawNodes.value, rawEdges.value);
    setTimeout(runLayout, 100);
  };

  const deleteSelected = () => {
    if (selectedEdgeId.value) {
      rawEdges.value = rawEdges.value.filter(e => e.id !== selectedEdgeId.value);
      selectedEdgeId.value = null;
    } else if (selectedNodeId.value) {
      const id = selectedNodeId.value;
      rawEdges.value = rawEdges.value.filter(e => e.source !== id && e.target !== id);
      rawNodes.value = rawNodes.value.filter(n => n.id !== id);
      selectedNodeId.value = rawNodes.value[0]?.id || null;
      updateLayout();
    }
    saveDataToStorage(rawNodes.value, rawEdges.value);
  };

  const updateNode = (id: string, data: Partial<NodeData>) => {
    rawNodes.value = rawNodes.value.map(n => n.id === id ? { ...n, ...data } : n);
    updateLayout();
  };

  return {
    selectNode: (id: string) => select('node', id),
    selectEdge: (id: string) => select('edge', id),
    updateNodeLabel,
    addChildNode,
    handleConnect,
    deleteSelected,
    updateNode
  };
}
