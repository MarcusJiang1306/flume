import { defineStore } from 'pinia';
import { useGraphOperations, useMermaid, useLayout, useStorage } from '../composables';
import { DEFAULT_ROOT_NODE } from '../config/constants';
import type { NodeData, PlottedNodeData, RenderedEdgeData } from '../types';

// 服务实例
let graphOps: any = null;
let generateMermaidCode: any = null;
let layoutService: any = null;
let storageService: any = null;

// 初始化标志
let initialized = false;

// 初始化服务
function initializeServices() {
  if (initialized) return;
  
  // 延迟初始化 services
  if (!storageService) {
    storageService = useStorage();
  }
  if (!layoutService) {
    layoutService = useLayout;
  }
  
  const { loadSavedData, generateEdgeId, generateNodeId } = storageService;
  const savedData = loadSavedData();
  const initialNodes = savedData?.nodes || [DEFAULT_ROOT_NODE];
  const initialEdges = savedData?.edges || [];

  // 初始化 graphOps 服务
  graphOps = useGraphOperations({
    generateNodeId,
    generateEdgeId,
    initialNodes,
    initialEdges
  });

  // 初始化 mermaid 服务
  const mermaidService = useMermaid(graphOps.rawNodes, graphOps.rawEdges);
  generateMermaidCode = mermaidService.generateMermaidCode;
  
  initialized = true;
}

export const useFlowStore = defineStore('flow', {
  state: () => ({
    // 布局方向
    layoutDirection: 'TB' as string,
    // 选中的节点
    selectedNode: null as PlottedNodeData | null,
    // 选中的边
    selectedEdge: null as RenderedEdgeData | null,
    // 绘制的节点
    plottedNodes: [] as PlottedNodeData[],
    // 绘制的边
    plottedEdges: [] as RenderedEdgeData[]
  }),

  getters: {
    // 获取原始节点数据
    rawNodes: () => {
      if (!initialized) initializeServices();
      return graphOps.rawNodes.value;
    },
    // 获取原始边数据
    rawEdges: () => {
      if (!initialized) initializeServices();
      return graphOps.rawEdges.value;
    }
  },

  actions: {
    // 初始化
    init() {
      if (!initialized) {
        initializeServices();
      }
    },

    // 计算布局
    computeLayout() {
      if (!initialized) initializeServices();
      const { plottedNodes: newPlottedNodes, plottedEdges: newPlottedEdges } = layoutService({
        rawNodes: graphOps.rawNodes.value,
        rawEdges: graphOps.rawEdges.value,
        layoutDirection: this.layoutDirection
      });
      this.plottedNodes = newPlottedNodes;
      this.plottedEdges = newPlottedEdges;
    },

    // 设置布局方向
    setLayoutDirection(direction: string) {
      this.layoutDirection = direction;
      this.computeLayout();
    },

    // 运行布局
    runLayout() {
      this.computeLayout();
    },

    // 保存数据到存储
    saveDataToStorage() {
      if (!initialized) initializeServices();
      storageService.saveDataToStorage(graphOps.rawNodes.value, graphOps.rawEdges.value);
    },

    // 清除保存的数据
    clearSavedData() {
      storageService.clearSavedData();
      // 重新初始化服务
      initialized = false;
      initializeServices();
      // 重新计算布局
      this.computeLayout();
    },

    // 选择节点
    selectNode(node: PlottedNodeData | null) {
      this.selectedNode = node;
      this.selectedEdge = null;
    },

    // 选择边
    selectEdge(edge: RenderedEdgeData | null) {
      this.selectedEdge = edge;
      this.selectedNode = null;
    },

    // 删除选中的元素
    deleteSelected() {
      if (!initialized) initializeServices();
      graphOps.deleteSelected(this.selectedNode, this.selectedEdge, this);
      this.computeLayout();
      this.saveDataToStorage();
    },

    // 添加子节点
    addChildNode(): string | null {
      if (!initialized) initializeServices();
      const newNodeId = graphOps.addChildNode(this.selectedNode);
      this.computeLayout();
      this.saveDataToStorage();
      return newNodeId;
    },

    // 添加兄弟节点
    addSiblingNode(): string | null {
      if (!initialized) initializeServices();
      const newNodeId = graphOps.addSiblingNode(this.selectedNode);
      this.computeLayout();
      this.saveDataToStorage();
      return newNodeId;
    },

    // 处理连接
    handleConnect(params: any) {
      if (!initialized) initializeServices();
      graphOps.handleConnect(params, this.layoutDirection);
      this.computeLayout();
      this.saveDataToStorage();
    },

    // 更新节点
    updateNode(nodeId: string, updates: Partial<NodeData>) {
      if (!initialized) initializeServices();
      graphOps.updateNode(nodeId, updates);
      this.computeLayout();
      this.saveDataToStorage();
    },

    // 更新节点标签
    updateNodeLabel(nodeId: string, label: string) {
      if (!initialized) initializeServices();
      graphOps.updateNodeLabel(nodeId, label);
      this.computeLayout();
      this.saveDataToStorage();
    },

    // 更新边标签
    updateEdgeLabel(edgeId: string, label: string) {
      if (!initialized) initializeServices();
      graphOps.updateEdgeLabel(edgeId, label);
      this.computeLayout();
      this.saveDataToStorage();
    }
  },
});

// 导出服务
export { graphOps, generateMermaidCode, layoutService };