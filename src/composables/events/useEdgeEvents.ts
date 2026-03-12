import { useFlowDependencies } from '../useFlowDependencies';
import type { RenderedEdgeData } from '../../types';

export function useEdgeEvents() {
  const { store } = useFlowDependencies();

  // 检查边是否被选中
  const isEdgeSelected = (edgeId: string) => {
    return store.selectedEdge?.id === edgeId;
  };

  // 检查边是否处于编辑状态
  const isEdgeEditing = (edgeId: string) => {
    return store.selectedEdge?.id === edgeId && store.selectedEdge?.isEditing === true;
  };

  // 设置编辑状态
  const setEditing = (edgeId: string, editing: boolean) => {
    if (store.selectedEdge && store.selectedEdge.id === edgeId) {
      store.selectEdge({ ...store.selectedEdge, isEditing: editing });
    }
  };

  // 处理边点击 - 第一次点击选中，第二次点击（已选中状态下）进入编辑
  const handleEdgeClick = (edgeId: string) => {
    // 如果边未选中，只选中它
    if (!store.selectedEdge || store.selectedEdge.id !== edgeId) {
      const edge = store.plottedEdges.find((e: RenderedEdgeData) => e.id === edgeId);
      if (edge) {
        store.selectEdge({ ...edge, isEditing: false });
      }
    } else {
      // 已选中，进入编辑状态
      setEditing(edgeId, true);
    }
  };

  // 处理编辑框聚焦
  const handleInputFocus = (event: Event) => {
    event.stopPropagation();
  };

  // 处理编辑框失焦
  const handleInputBlur = (edgeId: string, value: string) => {
    store.updateEdgeLabel(edgeId, value.trim());
    if (store.selectedEdge && store.selectedEdge.id === edgeId) {
      store.selectEdge({ ...store.selectedEdge, isEditing: false });
    }
  };

  // 处理编辑框键盘事件
  const handleInputKeyDown = (event: KeyboardEvent, edgeId: string, value: string) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      store.updateEdgeLabel(edgeId, value.trim());
      if (store.selectedEdge && store.selectedEdge.id === edgeId) {
        store.selectEdge({ ...store.selectedEdge, isEditing: false });
      }
    } else if (event.key === 'Escape') {
      event.preventDefault();
      if (store.selectedEdge && store.selectedEdge.id === edgeId) {
        store.selectEdge({ ...store.selectedEdge, isEditing: false });
      }
    }
  };

  return {
    selectedEdge: store.selectedEdge,
    isEdgeSelected,
    isEdgeEditing,
    setEditing,
    handleEdgeClick,
    handleInputFocus,
    handleInputBlur,
    handleInputKeyDown
  };
}
