import { nextTick, type Ref } from 'vue';
import type { NodeData, EdgeData, LayoutDirection, PlottedNodeData } from '../types';
import { DIR, stringToDirIndex, getStoredDirIndex, DEFAULT_HANDLES } from '../utils/direction';

export interface GraphOperationsOptions {
  rawNodes: Ref<NodeData[]>;
  rawEdges: Ref<EdgeData[]>;
  selectedNode: Ref<PlottedNodeData | null>;
  selectedEdge: Ref<EdgeData | null>;
  layoutDirection: Ref<string>;
  generateNodeId: () => string;
  generateEdgeId: () => string;
  updateLayout: () => void;
  runLayout: () => void;
}

export function useGraphOperations(options: GraphOperationsOptions) {
  const {
    rawNodes,
    rawEdges,
    selectedNode,
    selectedEdge,
    layoutDirection,
    generateNodeId,
    generateEdgeId,
    updateLayout,
    runLayout
  } = options;

  const selectNode = (node: PlottedNodeData | null) => {
    selectedNode.value = node;
  };

  const selectEdge = (id: string) => {
    selectedNode.value = null;
    selectedEdge.value = rawEdges.value.find(edge => edge.id === id) || null;
  };

  const updateNodeLabel = (id: string, label: string) => {
    updateNode(id, { label });
  };

  const addChildNode = () => {
    if (!selectedNode.value) return;

    const parentId = selectedNode.value.id;
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
    
    console.log('=== handleConnect ===');
    console.log('当前布局:', currentLayout);
    console.log('连接信息:', { source: connection.source, target: connection.target });
    console.log('渲染方向:', { sourceHandle: connection.sourceHandle, targetHandle: connection.targetHandle });
    
    // 将渲染方向转换为存储方向（逻辑方向，基于 TB 布局）
    const renderSourceIndex = stringToDirIndex(connection.sourceHandle);
    const renderTargetIndex = stringToDirIndex(connection.targetHandle);
    
    const storedSourceHandle = getStoredDirIndex(renderSourceIndex, currentLayout);
    const storedTargetHandle = getStoredDirIndex(renderTargetIndex, currentLayout);
    
    console.log('存储方向:', { sourceHandle: storedSourceHandle, targetHandle: storedTargetHandle });
    console.log('DIR 常量:', { BOTTOM: DIR.BOTTOM, TOP: DIR.TOP, LEFT: DIR.LEFT, RIGHT: DIR.RIGHT });
    
    if (rawEdges.value.some(e => 
      e.source === connection.source && 
      e.target === connection.target && 
      e.sourceHandle === storedSourceHandle && 
      e.targetHandle === storedTargetHandle
    )) {
      console.log('边已存在，跳过');
      return;
    }

    rawEdges.value.push({
      id: generateEdgeId(),
      source: connection.source,
      target: connection.target,
      sourceHandle: storedSourceHandle,
      targetHandle: storedTargetHandle,
      label: '',
      type: 'default'
    });
    
    console.log('边已添加，当前所有边:', rawEdges.value.map(e => ({ source: e.source, target: e.target, sH: e.sourceHandle, tH: e.targetHandle })));
    
    runLayout();
  };

  const deleteSelected = () => {
    if (selectedNode.value) {
      const id = selectedNode.value.id;
      rawEdges.value = rawEdges.value.filter(e => e.source !== id && e.target !== id);
      rawNodes.value = rawNodes.value.filter(n => n.id !== id);
      selectedNode.value = null;
      selectedEdge.value = null;
      updateLayout();
    } else if (selectedEdge.value) {
      const id = selectedEdge.value.id;
      rawEdges.value = rawEdges.value.filter(e => e.id !== id);
      selectedEdge.value = null;
      updateLayout();
    }
  };

  const updateNode = (id: string, data: Partial<NodeData>) => {
    rawNodes.value = rawNodes.value.map(n => n.id === id ? { ...n, ...data } : n);
    updateLayout();
  };

  return {
    selectNode,
    selectEdge,
    updateNodeLabel,
    addChildNode,
    handleConnect,
    deleteSelected,
    updateNode
  };
}
