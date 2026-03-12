import { reactive, computed } from 'vue';
import { useStorage } from './services/useStorage';
import { useGraphOperations } from './graph/useGraphOperations';
import { useLayout } from './services/useLayout';
import { DEFAULT_ROOT_NODE } from '../config/constants';
import type { NodeData, PlottedNodeData, RenderedEdgeData, EdgeData } from '../types';

export interface FlowState {
  layoutDirection: string;
  selectedNode: PlottedNodeData | null;
  selectedEdge: RenderedEdgeData | null;
  plottedNodes: PlottedNodeData[];
  plottedEdges: RenderedEdgeData[];
  rawNodes: NodeData[];
  rawEdges: EdgeData[];
  init: () => void;
  computeLayout: () => void;
  setLayoutDirection: (direction: string) => void;
  runLayout: () => void;
  saveDataToStorage: () => void;
  clearSavedData: () => void;
  selectNode: (node: PlottedNodeData | null) => void;
  selectEdge: (edge: RenderedEdgeData | null) => void;
  deleteSelected: () => void;
  addChildNode: () => string | null;
  addSiblingNode: () => string | null;
  handleConnect: (params: any) => void;
  updateNode: (nodeId: string, updates: Partial<NodeData>) => void;
  updateNodeLabel: (nodeId: string, label: string) => void;
  updateEdgeLabel: (edgeId: string, label: string) => void;
}

export function useFlowState(
  storage: ReturnType<typeof useStorage>,
  graphOps: ReturnType<typeof useGraphOperations>,
  layout: typeof useLayout
): FlowState {
  const state = reactive({
    layoutDirection: 'TB' as string,
    selectedNode: null as PlottedNodeData | null,
    selectedEdge: null as RenderedEdgeData | null,
    plottedNodes: [] as PlottedNodeData[],
    plottedEdges: [] as RenderedEdgeData[]
  });

  const rawNodes = computed(() => graphOps.rawNodes.value);
  const rawEdges = computed(() => graphOps.rawEdges.value);

  const init = () => {};

  const computeLayout = () => {
    const { plottedNodes: newPlottedNodes, plottedEdges: newPlottedEdges } = layout({
      rawNodes: graphOps.rawNodes.value,
      rawEdges: graphOps.rawEdges.value,
      layoutDirection: state.layoutDirection
    });
    state.plottedNodes = newPlottedNodes;
    state.plottedEdges = newPlottedEdges;
  };

  const setLayoutDirection = (direction: string) => {
    state.layoutDirection = direction;
    computeLayout();
  };

  const runLayout = () => {
    computeLayout();
  };

  const saveDataToStorage = () => {
    storage.saveDataToStorage(graphOps.rawNodes.value, graphOps.rawEdges.value);
  };

  const clearSavedData = () => {
    storage.clearSavedData();
    const newSavedData = storage.loadSavedData();
    const newInitialNodes = newSavedData?.nodes || [DEFAULT_ROOT_NODE];
    const newInitialEdges = newSavedData?.edges || [];
    graphOps.rawNodes.value = newInitialNodes;
    graphOps.rawEdges.value = newInitialEdges;
    computeLayout();
  };

  const selectNode = (node: PlottedNodeData | null) => {
    state.selectedNode = node;
    state.selectedEdge = null;
  };

  const selectEdge = (edge: RenderedEdgeData | null) => {
    state.selectedEdge = edge;
    state.selectedNode = null;
  };

  const deleteSelected = () => {
    const selectedEdgeForDelete = state.selectedEdge ? {
      ...state.selectedEdge,
      sourceHandle: undefined,
      targetHandle: undefined
    } as EdgeData : null;
    graphOps.deleteSelected(state.selectedNode, selectedEdgeForDelete, state);
    computeLayout();
    saveDataToStorage();
  };

  const addChildNode = (): string | null => {
    const newNodeId = graphOps.addChildNode(state.selectedNode);
    computeLayout();
    saveDataToStorage();
    return newNodeId;
  };

  const addSiblingNode = (): string | null => {
    const newNodeId = graphOps.addSiblingNode(state.selectedNode);
    computeLayout();
    saveDataToStorage();
    return newNodeId;
  };

  const handleConnect = (params: any) => {
    graphOps.handleConnect(params, state.layoutDirection);
    computeLayout();
    saveDataToStorage();
  };

  const updateNode = (nodeId: string, updates: Partial<NodeData>) => {
    graphOps.updateNode(nodeId, updates);
    computeLayout();
    saveDataToStorage();
  };

  const updateNodeLabel = (nodeId: string, label: string) => {
    graphOps.updateNodeLabel(nodeId, label);
    computeLayout();
    saveDataToStorage();
  };

  const updateEdgeLabel = (edgeId: string, label: string) => {
    graphOps.updateEdgeLabel(edgeId, label);
    computeLayout();
    saveDataToStorage();
  };

  return {
    get layoutDirection() { return state.layoutDirection; },
    set layoutDirection(val: string) { state.layoutDirection = val; },
    get selectedNode() { return state.selectedNode; },
    set selectedNode(val: PlottedNodeData | null) { state.selectedNode = val; },
    get selectedEdge() { return state.selectedEdge; },
    set selectedEdge(val: RenderedEdgeData | null) { state.selectedEdge = val; },
    get plottedNodes() { return state.plottedNodes; },
    set plottedNodes(val: PlottedNodeData[]) { state.plottedNodes = val; },
    get plottedEdges() { return state.plottedEdges; },
    set plottedEdges(val: RenderedEdgeData[]) { state.plottedEdges = val; },
    get rawNodes() { return rawNodes.value; },
    get rawEdges() { return rawEdges.value; },
    init,
    computeLayout,
    setLayoutDirection,
    runLayout,
    saveDataToStorage,
    clearSavedData,
    selectNode,
    selectEdge,
    deleteSelected,
    addChildNode,
    addSiblingNode,
    handleConnect,
    updateNode,
    updateNodeLabel,
    updateEdgeLabel
  } as FlowState;
}
