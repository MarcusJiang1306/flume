import { useFlowStore } from '../../stores/flowStore';
import type { PlottedNodeData } from '../../types';

export function useNodeEvents() {
  const store = useFlowStore();

  // 检查节点是否被选中
  const isNodeSelected = (nodeId: string) => {
    return store.selectedNode?.id === nodeId;
  };

  // 检查节点是否处于编辑状态
  const isNodeEditing = (nodeId: string) => {
    return store.selectedNode?.id === nodeId && store.selectedNode?.isEditing === true;
  };

  // 设置编辑状态
  const setEditing = (nodeId: string, editing: boolean) => {
    if (store.selectedNode && store.selectedNode.id === nodeId) {
      store.selectNode({ ...store.selectedNode, isEditing: editing });
    }
  };

  // 处理节点内容点击 - 先选中节点，再设置编辑状态
  const handleNodeContentClick = (nodeId: string) => {
    // 如果节点未选中，先选中它
    if (!store.selectedNode || store.selectedNode.id !== nodeId) {
      const node = store.plottedNodes.find((n: PlottedNodeData) => n.id === nodeId);
      if (node) {
        store.selectNode({ ...node, isEditing: true });
      }
    } else {
      // 已选中，直接设置编辑状态
      setEditing(nodeId, true);
    }
  };

  // 处理编辑框聚焦
  const handleInputFocus = (event: Event) => {
    event.stopPropagation();
  };

  // 处理编辑框失焦
  const handleInputBlur = (nodeId: string, value: string) => {
    if (value.trim()) {
      store.updateNodeLabel(nodeId, value.trim());
    }
    if (store.selectedNode && store.selectedNode.id === nodeId) {
      store.selectNode({ ...store.selectedNode, isEditing: false });
    }
  };

  // 处理编辑框键盘事件
  const handleInputKeyDown = (event: KeyboardEvent, nodeId: string, value: string) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      if (value.trim()) {
        store.updateNodeLabel(nodeId, value.trim());
      }
      if (store.selectedNode && store.selectedNode.id === nodeId) {
        store.selectNode({ ...store.selectedNode, isEditing: false });
      }
    } else if (event.key === 'Escape') {
      event.preventDefault();
      if (store.selectedNode && store.selectedNode.id === nodeId) {
        store.selectNode({ ...store.selectedNode, isEditing: false });
      }
    }
  };

  // 处理节点拖拽开始
  const handleNodeDragStart = () => {
    // 可以在这里添加拖拽开始的逻辑
  };

  // 处理节点拖拽结束
  const handleNodeDragEnd = () => {
    // 可以在这里添加拖拽结束的逻辑
  };

  return {
    selectedNode: store.selectedNode,
    isNodeSelected,
    isNodeEditing,
    setEditing,
    handleNodeContentClick,
    handleInputFocus,
    handleInputBlur,
    handleInputKeyDown,
    handleNodeDragStart,
    handleNodeDragEnd
  };
}
