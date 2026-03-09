import { ref } from 'vue';
import type { NodeData, EdgeData, PlottedNodeData, RenderedEdgeData } from '../types';
import { loadSavedData, clearSavedData, generateEdgeId, generateNodeId, saveDataToStorage } from './useStorage';
import { useGraphOperations } from './useGraphOperations';
import { useMermaid } from './useMermaid';
import { useLayout } from './useLayout';
import { convertToPlottedNode } from '../utils/layout';
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

  const handleNodeClick = ({ node }: any) => {
    if (node?.id) {
      selectedNode.value = convertToPlottedNode(node, false);
      selectedEdge.value = null;
    }
  };

  const handleEdgeClick = ({ edge }: any) => {
    if (edge?.id) {
      selectedEdge.value = rawEdges.value.find(e => e.id === edge.id) || null;
      selectedNode.value = null;
    }
  };

  const handleNodeDblClick = ({ node }: any) => {
    if (node?.id) {
      // 无论是否已经选中，都设置编辑状态
      selectedNode.value = convertToPlottedNode(node, true);
      selectedEdge.value = null;
    }
  };

  const handleSelectionChange = ({ nodes, edges }: any) => {
    if (edges?.[0]) {
      selectedEdge.value = rawEdges.value.find(e => e.id === edges[0].id) || null;
      selectedNode.value = null;
    } else if (nodes?.[0]) {
      const node = nodes[0];
      // 保留当前的 isEditing 状态
      let currentIsEditing = false;
      if (selectedNode.value && selectedNode.value.id === node.id) {
        currentIsEditing = selectedNode.value.isEditing || false;
      }
      selectedNode.value = convertToPlottedNode(node, currentIsEditing);
      selectedEdge.value = null;
    } else {
      selectedNode.value = null;
      selectedEdge.value = null;
    }
  };

  const handleFlowClick = (event: any) => {
    // 当点击画布空白区域时，取消选择
    // 检查事件目标是否是画布本身，而不是节点或其他元素
    if (event && event.target && event.target.classList && event.target.classList.contains('vue-flow__pane')) {
      selectedNode.value = null;
      selectedEdge.value = null;
    }
  };

  // 添加子节点
  const addChildNode = () => {
    graphOps.addChildNode((newNodeId) => {
      // 布局更新后，从 plottedNodes 中找到新节点并设置为 selectedNode
      const newNode = plottedNodes.value.find(n => n.id === newNodeId);
      if (newNode) {
        selectedNode.value = newNode;
      }
    });
  };

  // 添加兄弟节点
  const addSiblingNode = () => {
    graphOps.addSiblingNode((newNodeId) => {
      // 布局更新后，从 plottedNodes 中找到新节点并设置为 selectedNode
      const newNode = plottedNodes.value.find(n => n.id === newNodeId);
      if (newNode) {
        selectedNode.value = newNode;
      }
    });
  };

  // 激活选中节点的编辑模式
  const activateNodeEdit = () => {
    if (selectedNode.value) {
      selectedNode.value = { ...selectedNode.value, isEditing: true };
    }
  };

  // 处理方向键切换选中节点  beta功能 有bug
  const handleDirectionKey = (direction: 'up' | 'down' | 'left' | 'right') => {
    if (!selectedNode.value || plottedNodes.value.length === 0) return;

    const currentNode = selectedNode.value;
    let nextNode: any = null;
    const currentLayout = layoutDirection.value;

    // 根据布局方向和按键方向，确定要切换的节点类型
    if (currentLayout === 'TB' || currentLayout === 'BT') {
      // 垂直布局：上下箭头切换子节点，左右箭头切换兄弟节点
      if (direction === 'up' || direction === 'down') {
        // 切换子节点
        const childNodes = getChildNodes(currentNode.id);
        if (childNodes.length > 0) {
          // 按 y 坐标排序
          childNodes.sort((a, b) => a.position.y - b.position.y);
          nextNode = direction === 'down' ? childNodes[0] : childNodes[childNodes.length - 1];
        }
      } else if (direction === 'left' || direction === 'right') {
        // 切换兄弟节点
        const siblingNodes = getSiblingNodes(currentNode.id);
        if (siblingNodes.length > 0) {
          // 按 x 坐标排序
          siblingNodes.sort((a, b) => a.position.x - b.position.x);
          nextNode = direction === 'right' ? siblingNodes[siblingNodes.length - 1] : siblingNodes[0];
        }
      }
    } else if (currentLayout === 'LR' || currentLayout === 'RL') {
      // 水平布局：左右箭头切换子节点，上下箭头切换兄弟节点
      if (direction === 'left' || direction === 'right') {
        // 切换子节点
        const childNodes = getChildNodes(currentNode.id);
        if (childNodes.length > 0) {
          // 按 x 坐标排序
          childNodes.sort((a, b) => a.position.x - b.position.x);
          nextNode = direction === 'right' ? childNodes[0] : childNodes[childNodes.length - 1];
        }
      } else if (direction === 'up' || direction === 'down') {
        // 切换兄弟节点
        const siblingNodes = getSiblingNodes(currentNode.id);
        if (siblingNodes.length > 0) {
          // 按 y 坐标排序
          siblingNodes.sort((a, b) => a.position.y - b.position.y);
          nextNode = direction === 'down' ? siblingNodes[siblingNodes.length - 1] : siblingNodes[0];
        }
      }
    }

    // 如果找到相邻节点，选中它
    if (nextNode) {
      selectedNode.value = nextNode;
      selectedEdge.value = null;
    }
  };

  // 获取子节点
  const getChildNodes = (nodeId: string) => {
    const childEdgeIds = rawEdges.value
      .filter(edge => edge.source === nodeId)
      .map(edge => edge.target);
    return plottedNodes.value.filter(node => childEdgeIds.includes(node.id));
  };

  // 获取兄弟节点
  const getSiblingNodes = (nodeId: string) => {
    // 找到父节点
    const parentEdge = rawEdges.value.find(edge => edge.target === nodeId);
    if (!parentEdge) return [];
    
    // 找到父节点的所有子节点（即兄弟节点）
    const siblingEdgeIds = rawEdges.value
      .filter(edge => edge.source === parentEdge.source && edge.target !== nodeId)
      .map(edge => edge.target);
    return plottedNodes.value.filter(node => siblingEdgeIds.includes(node.id));
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
    addChildNode,
    addSiblingNode,
    activateNodeEdit,
    handleDirectionKey,
    handleConnect: graphOps.handleConnect,
    handleNodeClick,
    handleEdgeClick,
    handleNodeDblClick,
    handleSelectionChange,
    handleFlowClick,
    runLayout: layout.runLayout,
    deleteSelected: graphOps.deleteSelected,
    generateMermaidCode,
    updateNodeLabel: graphOps.updateNodeLabel,
    updateNode: graphOps.updateNode,
    setLayoutDirection: layout.setLayoutDirection,
    clearSavedData
  };
}
