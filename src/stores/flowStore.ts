import { defineStore } from 'pinia';
import { loadSavedData, clearSavedData, generateEdgeId, generateNodeId, saveDataToStorage, useGraphOperations, useMermaid, useLayout } from '../composables';
import { DEFAULT_ROOT_NODE } from '../config/constants';
import type { NodeData, EdgeData, PlottedNodeData, RenderedEdgeData } from '../types';

// 服务实例
let graphOps: any = null;
let generateMermaidCode: any = null;
const layoutService = useLayout;

// 初始化服务
function initializeServices() {
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
}

// 初始化服务
initializeServices();

export const useFlowStore = defineStore('flow', {
  state: () => ({
    // 布局方向
    layoutDirection: 'TB' as string,
    // 选中的节点
    selectedNode: null as PlottedNodeData | null,
    // 选中的边
    selectedEdge: null as EdgeData | null,
    // 绘制的节点
    plottedNodes: [] as PlottedNodeData[],
    // 绘制的边
    plottedEdges: [] as RenderedEdgeData[]
  }),

  getters: {
    // 获取原始节点数据
    rawNodes: () => graphOps.rawNodes.value,
    // 获取原始边数据
    rawEdges: () => graphOps.rawEdges.value
  },

  actions: {
    // 计算布局
    computeLayout() {
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
      saveDataToStorage(graphOps.rawNodes.value, graphOps.rawEdges.value);
    },

    // 清除保存的数据
    clearSavedData() {
      clearSavedData();
      // 重新初始化服务
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
    selectEdge(edge: EdgeData | null) {
      this.selectedEdge = edge;
      this.selectedNode = null;
    },

    // 删除选中的元素
    deleteSelected() {
      graphOps.deleteSelected(this.selectedNode, this.selectedEdge, this);
      this.computeLayout();
    },

    // 添加子节点
    addChildNode(): string | null {
      const newNodeId = graphOps.addChildNode(this.selectedNode);
      this.computeLayout();
      return newNodeId;
    },

    // 添加兄弟节点
    addSiblingNode(): string | null {
      const newNodeId = graphOps.addSiblingNode(this.selectedNode);
      this.computeLayout();
      return newNodeId;
    },

    // 处理连接
    handleConnect(params: any) {
      graphOps.handleConnect(params, this.layoutDirection);
      this.computeLayout();
    },

    // 更新节点
    updateNode(nodeId: string, updates: Partial<NodeData>) {
      graphOps.updateNode(nodeId, updates);
      this.computeLayout();
    }
  },


});

// 导出服务
export { graphOps, generateMermaidCode, layoutService };