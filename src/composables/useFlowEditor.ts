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
  const selectedNodeId = ref<string | null>(DEFAULT_ROOT_NODE.id);
  const selectedEdgeId = ref<string | null>(null);
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
    selectedNodeId,
    selectedEdgeId,
    layoutDirection,
    generateNodeId,
    generateEdgeId,
    updateLayout: layout.updateLayout,
    runLayout: layout.runLayout
  });

  const { generateMermaidCode } = useMermaid(rawNodes, rawEdges);

  // 初始化布局（延迟执行，与其他操作保持一致）
  // 注意：这里不调用 updateLayout，因为会在 App.vue 中通过 customRunLayout 统一处理


  return {
    rawNodes,
    rawEdges,
    plottedNodes,
    plottedEdges,
    selectedNodeId,
    selectedEdgeId,
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
    clearSavedData
  };
}
