import { ref } from 'vue';
import type { NodeData, EdgeData, LayoutDirection, PlottedNodeData } from '../../types';
import { DIR, stringToDirIndex, getStoredDirIndex, DEFAULT_HANDLES } from '../../utils/direction';
import { convertToPlottedNode } from '../../utils/layout';

export interface GraphOperationsOptions {
  generateNodeId: () => string;
  generateEdgeId: () => string;
  initialNodes?: NodeData[];
  initialEdges?: EdgeData[];
}

export function useGraphOperations(options: GraphOperationsOptions) {
  const { generateNodeId, generateEdgeId, initialNodes = [], initialEdges = [] } = options;

  // 内部管理业务数据
  const rawNodes = ref<NodeData[]>(initialNodes);
  const rawEdges = ref<EdgeData[]>(initialEdges);

  const updateNodeLabel = (id: string, label: string) => {
    updateNode(id, { label });
  };

  const updateEdgeLabel = (id: string, label: string) => {
    rawEdges.value = rawEdges.value.map((e: EdgeData) => e.id === id ? { ...e, label } : e);
  };

  const addChildNode = (selectedNode: PlottedNodeData | null): string | null => {
    if (!selectedNode) return null;

    const parentId = selectedNode.id;
    const newId = generateNodeId();
    
    // 创建新节点并添加到 rawNodes
    const newNode = { id: newId, label: '请输入文字', type: 'custom', handlePositions: DEFAULT_HANDLES };
    rawNodes.value.push(newNode);

    rawEdges.value.push({
      id: generateEdgeId(),
      source: parentId,
      target: newId,
      sourceHandle: DIR.BOTTOM,
      targetHandle: DIR.TOP,
      type: 'smoothstep'
    });

    return newId;
  };

  // 查找节点的父节点 ID
  const getParentNodeId = (nodeId: string): string | null => {
    const parentEdges = rawEdges.value.filter((e: EdgeData) => e.target === nodeId);
    return parentEdges.length > 0 ? parentEdges[0].source : null;
  };

  const addSiblingNode = (selectedNode: PlottedNodeData | null): string | null => {
    if (!selectedNode) return null;

    const selectedNodeId = selectedNode.id;
    const parentId = getParentNodeId(selectedNodeId);
    if (!parentId) return null; // 如果没有父节点，无法添加兄弟节点

    const newId = generateNodeId();
    
    // 创建新节点并添加到 rawNodes
    const newNode = { id: newId, label: '请输入文字', type: 'custom', handlePositions: DEFAULT_HANDLES };
    rawNodes.value.push(newNode);

    rawEdges.value.push({
      id: generateEdgeId(),
      source: parentId,
      target: newId,
      sourceHandle: DIR.BOTTOM,
      targetHandle: DIR.TOP,
      type: 'smoothstep'
    });

    return newId;
  };

  const handleConnect = (connection: any, layoutDirection: string) => {
    const currentLayout = layoutDirection as LayoutDirection;
    
    // 将渲染方向转换为存储方向（逻辑方向，基于 TB 布局）
    const renderSourceIndex = stringToDirIndex(connection.sourceHandle);
    const renderTargetIndex = stringToDirIndex(connection.targetHandle);
    
    const storedSourceHandle = getStoredDirIndex(renderSourceIndex, currentLayout);
    const storedTargetHandle = getStoredDirIndex(renderTargetIndex, currentLayout);
    
    if (rawEdges.value.some((e: EdgeData) => 
      e.source === connection.source && 
      e.target === connection.target && 
      e.sourceHandle === storedSourceHandle && 
      e.targetHandle === storedTargetHandle
    )) {
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
  };

  const deleteSelected = (
    selectedNode: PlottedNodeData | null, 
    selectedEdge: EdgeData | null,
    storeOrNodeRef: any, // 可以是 store 或 selectedNodeRef
    selectedEdgeRef?: any // 可选的 selectedEdgeRef
  ) => {
    if (selectedNode) {
      const id = selectedNode.id;
      
      // 找到被删除节点的父节点
      const parentNodeId = getParentNodeId(id);
      
      // 删除节点和相关边
      rawEdges.value = rawEdges.value.filter((e: EdgeData) => e.source !== id && e.target !== id);
      rawNodes.value = rawNodes.value.filter((n: NodeData) => n.id !== id);
      
      // 如果有父节点，将选中状态设置为父节点
      if (parentNodeId) {
        const parentNode = rawNodes.value.find((n: NodeData) => n.id === parentNodeId);
        if (parentNode) {
          if (storeOrNodeRef.selectedNode !== undefined) {
            // 是 store
            storeOrNodeRef.selectedNode = convertToPlottedNode(parentNode, false);
          } else if (storeOrNodeRef.value !== undefined) {
            // 是 selectedNodeRef
            storeOrNodeRef.value = convertToPlottedNode(parentNode, false);
          }
        }
      } else {
        if (storeOrNodeRef.selectedNode !== undefined) {
          // 是 store
          storeOrNodeRef.selectedNode = null;
        } else if (storeOrNodeRef.value !== undefined) {
          // 是 selectedNodeRef
          storeOrNodeRef.value = null;
        }
      }
      
      if (storeOrNodeRef.selectedEdge !== undefined) {
        // 是 store
        storeOrNodeRef.selectedEdge = null;
      } else if (selectedEdgeRef && selectedEdgeRef.value !== undefined) {
        // 是 selectedEdgeRef
        selectedEdgeRef.value = null;
      }
    } else if (selectedEdge) {
      const id = selectedEdge.id;
      rawEdges.value = rawEdges.value.filter((e: EdgeData) => e.id !== id);
      
      if (storeOrNodeRef.selectedEdge !== undefined) {
        // 是 store
        storeOrNodeRef.selectedEdge = null;
      } else if (selectedEdgeRef && selectedEdgeRef.value !== undefined) {
        // 是 selectedEdgeRef
        selectedEdgeRef.value = null;
      }
    }
  };

  const updateNode = (id: string, data: Partial<NodeData>) => {
    rawNodes.value = rawNodes.value.map((n: NodeData) => n.id === id ? { ...n, ...data } : n);
  };

  const getChildEdgeIds = (nodeId: string) => {
    return rawEdges.value
      .filter((edge: EdgeData) => edge.source === nodeId)
      .map((edge: EdgeData) => edge.target);
  };

  const getSiblingEdgeIds = (nodeId: string) => {
    const parentEdge = rawEdges.value.find((edge: EdgeData) => edge.target === nodeId);
    if (!parentEdge) return [];
    
    return rawEdges.value
      .filter((edge: EdgeData) => edge.source === parentEdge.source && edge.target !== nodeId)
      .map((edge: EdgeData) => edge.target);
  };

  return {
    // 业务数据访问
    rawNodes,
    rawEdges,
    
    // 业务操作方法
    updateNodeLabel,
    updateEdgeLabel,
    addChildNode,
    addSiblingNode,
    handleConnect,
    deleteSelected,
    updateNode,
    getChildEdgeIds,
    getSiblingEdgeIds
  };
}
