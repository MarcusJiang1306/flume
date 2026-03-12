import { nextTick } from 'vue';
import { useFlowStore } from '../../stores/flowStore';
import type { PlottedNodeData, EdgeData, RenderedEdgeData } from '../../types';

export function useCanvasEvents() {
  const store = useFlowStore();

  // 获取绘制的节点
  const getPlottedNodes = () => store.plottedNodes;

  // 获取绘制的边
  const getPlottedEdges = () => store.plottedEdges;

  // 选择节点
  const selectNode = (node: PlottedNodeData | null) => {
    store.selectNode(node);
  };

  // 处理节点点击 - 如果是同一个节点则保留编辑状态
  const handleNodeClick = (node: PlottedNodeData) => {
    const currentNode = store.selectedNode;
    if (currentNode && currentNode.id === node.id) {
      // 同一个节点，保留编辑状态
      store.selectNode({ ...node, isEditing: currentNode.isEditing });
    } else {
      // 不同节点，重置编辑状态
      store.selectNode(node);
    }
  };

  // 选择边
  const selectEdge = (edge: RenderedEdgeData | null) => {
    store.selectEdge(edge);
  };

  // 处理连接
  const handleConnect = (params: any) => {
    store.handleConnect(params);
  };

  // 添加子节点
  const addChildNode = () => {
    const newNodeId = store.addChildNode();
    if (newNodeId) {
      // 在布局计算完成后，选中新创建的节点
      nextTick(() => {
        const newNode = store.plottedNodes.find((n: PlottedNodeData) => n.id === newNodeId);
        if (newNode) {
          store.selectNode(newNode);
        }
      });
    }
  };

  // 添加兄弟节点
  const addSiblingNode = () => {
    const newNodeId = store.addSiblingNode();
    if (newNodeId) {
      // 在布局计算完成后，选中新创建的节点
      nextTick(() => {
        const newNode = store.plottedNodes.find((n: PlottedNodeData) => n.id === newNodeId);
        if (newNode) {
          store.selectNode(newNode);
        }
      });
    }
  };

  // 删除选中的元素
  const deleteSelected = () => {
    store.deleteSelected();
  };

  // 初始化布局
  const initLayout = () => {
    store.computeLayout();
  };

  const activateNodeEdit = () => {
    if (store.selectedNode) {
      store.selectNode({ ...store.selectedNode, isEditing: true });
    }
  };

  const handleDirectionKey = (direction: 'up' | 'down' | 'left' | 'right') => {
    if (!store.selectedNode || store.plottedNodes.length === 0) return null;

    let nextNode: any = null;
    const currentLayout = store.layoutDirection || 'TB';

    if (currentLayout === 'TB' || currentLayout === 'BT') {
      if (direction === 'up' || direction === 'down') {
        const childNodes = getChildNodes(store.selectedNode.id);
        if (childNodes.length > 0) {
          childNodes.sort((a: PlottedNodeData, b: PlottedNodeData) => a.position.y - b.position.y);
          nextNode = direction === 'down' ? childNodes[0] : childNodes[childNodes.length - 1];
        }
      } else if (direction === 'left' || direction === 'right') {
        const siblingNodes = getSiblingNodes(store.selectedNode.id);
        if (siblingNodes.length > 0) {
          siblingNodes.sort((a: PlottedNodeData, b: PlottedNodeData) => a.position.x - b.position.x);
          nextNode = direction === 'right' ? siblingNodes[siblingNodes.length - 1] : siblingNodes[0];
        }
      }
    } else if (currentLayout === 'LR' || currentLayout === 'RL') {
      if (direction === 'left' || direction === 'right') {
        const childNodes = getChildNodes(store.selectedNode.id);
        if (childNodes.length > 0) {
          childNodes.sort((a: PlottedNodeData, b: PlottedNodeData) => a.position.x - b.position.x);
          nextNode = direction === 'right' ? childNodes[0] : childNodes[childNodes.length - 1];
        }
      } else if (direction === 'up' || direction === 'down') {
        const siblingNodes = getSiblingNodes(store.selectedNode.id);
        if (siblingNodes.length > 0) {
          siblingNodes.sort((a: PlottedNodeData, b: PlottedNodeData) => a.position.y - b.position.y);
          nextNode = direction === 'down' ? siblingNodes[siblingNodes.length - 1] : siblingNodes[0];
        }
      }
    }

    return nextNode || null;
  };

  const getChildNodes = (nodeId: string) => {
    const childEdgeIds = store.rawEdges
      .filter((edge: EdgeData) => edge.source === nodeId)
      .map((edge: EdgeData) => edge.target);
    return store.plottedNodes.filter((node: PlottedNodeData) => childEdgeIds.includes(node.id));
  };

  const getSiblingNodes = (nodeId: string) => {
    const parentEdge = store.rawEdges.find((edge: EdgeData) => edge.target === nodeId);
    if (!parentEdge) return [];
    const siblingEdgeIds = store.rawEdges
      .filter((edge: EdgeData) => edge.source === parentEdge.source && edge.target !== nodeId)
      .map((edge: EdgeData) => edge.target);
    return store.plottedNodes.filter((node: PlottedNodeData) => siblingEdgeIds.includes(node.id));
  };

  return {
    getPlottedNodes,
    getPlottedEdges,
    selectNode,
    handleNodeClick,
    selectEdge,
    handleConnect,
    addChildNode,
    addSiblingNode,
    deleteSelected,
    initLayout,
    activateNodeEdit,
    handleDirectionKey
  };
}
