import { ref } from 'vue';
import type { NodeData, EdgeData, PlottedNodeData, RenderedEdgeData } from '../types';
import { loadSavedData, clearSavedData, generateEdgeId, generateNodeId, saveDataToStorage } from './useStorage';
import { useGraphOperations } from './useGraphOperations';
import { useMermaid } from './useMermaid';
import { useLayout } from './useLayout';
import { DEFAULT_ROOT_NODE, DEFAULT_LAYOUT_DIRECTION } from '../config/constants';

export function useFlowEditor() {
  const savedData = loadSavedData();

  const rawNodes = ref<NodeData[]>(savedData?.nodes || [DEFAULT_ROOT_NODE]);
  const rawEdges = ref<EdgeData[]>(savedData?.edges || []);
  const selectedNode = ref<PlottedNodeData | null>(null);
  const selectedEdge = ref<EdgeData | null>(null);
  const layoutDirection = ref<string>(savedData?.layoutDirection || DEFAULT_LAYOUT_DIRECTION);

  const plottedNodes = ref<PlottedNodeData[]>([]);
  const plottedEdges = ref<RenderedEdgeData[]>([]);

  const layout = useLayout({
    rawNodes,
    rawEdges,
    layoutDirection,
    plottedNodes,
    plottedEdges,
    saveDataToStorage
  });

  const graphOps = useGraphOperations({
    rawNodes,
    rawEdges,
    selectedNode,
    selectedEdge,
    layoutDirection,
    generateNodeId,
    generateEdgeId,
    updateLayout: layout.updateLayout,
    runLayout: layout.runLayout
  });

  const { generateMermaidCode } = useMermaid(rawNodes, rawEdges);

  const setNodeEditing = (nodeId: string, isEditing: boolean) => {
    console.log('setNodeEditing', { nodeId, isEditing });
    plottedNodes.value = plottedNodes.value.map(n => 
      n.id === nodeId 
        ? { ...n, isEditing } 
        : { ...n, isEditing: false }
    );
    // 只有在进入编辑模式时才更新 selectedNode
    if (isEditing) {
      selectedNode.value = plottedNodes.value.find(n => n.id === nodeId) || null;
    }
  };

  return {
    rawNodes,
    rawEdges,
    plottedNodes,
    plottedEdges,
    selectedNode,
    selectedEdge,
    layoutDirection,
    selectNode: graphOps.selectNode,
    selectEdge: graphOps.selectEdge,
    addChildNode: graphOps.addChildNode,
    handleConnect: graphOps.handleConnect,
    runLayout: layout.runLayout,
    deleteSelected: graphOps.deleteSelected,
    generateMermaidCode,
    updateNodeLabel: graphOps.updateNodeLabel,
    updateNode: graphOps.updateNode,
    setLayoutDirection: layout.setLayoutDirection,
    clearSavedData,
    setNodeEditing
  };
}
