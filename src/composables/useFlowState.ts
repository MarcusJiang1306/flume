import { reactive, computed } from 'vue';
import { useGraphOperations, useLayout, useStorage } from '.';
import { DEFAULT_ROOT_NODE } from '../config/constants';
import type { NodeData, PlottedNodeData, RenderedEdgeData, EdgeData } from '../types';

// 服务实例类型
export interface Services {
  graphOps: ReturnType<typeof useGraphOperations>;
  layoutService: typeof useLayout;
  storageService: ReturnType<typeof useStorage>;
}

// FlowState 接口 - 与原 Pinia store 完全兼容
export interface FlowState {
  // 状态
  layoutDirection: string;
  selectedNode: PlottedNodeData | null;
  selectedEdge: RenderedEdgeData | null;
  plottedNodes: PlottedNodeData[];
  plottedEdges: RenderedEdgeData[];

  // Getters (作为普通属性访问，内部是 computed)
  rawNodes: NodeData[];
  rawEdges: EdgeData[];

  // Actions
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

  // 内部服务
  services: Services;
}

// 工厂函数：创建独立的 FlowState 实例
export function useFlowState(): FlowState & { services: Services } {
  // 初始化 storage 服务
  const storageService = useStorage();
  const { loadSavedData, generateEdgeId, generateNodeId } = storageService;
  const savedData = loadSavedData();
  const initialNodes = savedData?.nodes || [DEFAULT_ROOT_NODE];
  const initialEdges = savedData?.edges || [];

  // 初始化 graphOps 服务
  const graphOps = useGraphOperations({
    generateNodeId,
    generateEdgeId,
    initialNodes,
    initialEdges
  });

  // 响应式状态
  const state = reactive({
    layoutDirection: 'TB' as string,
    selectedNode: null as PlottedNodeData | null,
    selectedEdge: null as RenderedEdgeData | null,
    plottedNodes: [] as PlottedNodeData[],
    plottedEdges: [] as RenderedEdgeData[]
  });

  // Getters - 使用 computed
  const rawNodes = computed(() => graphOps.rawNodes.value);
  const rawEdges = computed(() => graphOps.rawEdges.value);

  // Actions
  const init = () => {
    // 初始化已在创建时完成
  };

  const computeLayout = () => {
    const { plottedNodes: newPlottedNodes, plottedEdges: newPlottedEdges } = useLayout({
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
    storageService.saveDataToStorage(graphOps.rawNodes.value, graphOps.rawEdges.value);
  };

  const clearSavedData = () => {
    storageService.clearSavedData();
    // 重置到初始状态 - 重新加载数据
    const newSavedData = storageService.loadSavedData();
    const newInitialNodes = newSavedData?.nodes || [DEFAULT_ROOT_NODE];
    const newInitialEdges = newSavedData?.edges || [];
    // 更新 rawNodes 和 rawEdges
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
    // 将 RenderedEdgeData 转换为 EdgeData 类型
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

  // 创建响应式代理对象
  const flowState = {
    // 状态 - 使用 getter/setter 模拟属性访问
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

    // Getters - 返回原始数组（自动解包 computed）
    get rawNodes() { return rawNodes.value; },
    get rawEdges() { return rawEdges.value; },

    // Actions
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
    updateEdgeLabel,

    // 服务（供 useFlowDependencies 使用）
    services: {
      graphOps,
      layoutService: useLayout,
      storageService
    }
  };

  return flowState as FlowState & { services: Services };
}
