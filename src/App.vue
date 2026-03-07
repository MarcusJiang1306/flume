<script setup lang="ts">
import { ref, computed, markRaw, h, nextTick, onMounted } from 'vue';
import { VueFlow, useVueFlow } from '@vue-flow/core';
import { Controls } from '@vue-flow/controls';
import { Background } from '@vue-flow/background';
import '@vue-flow/core/dist/style.css';
import { useFlowEditor } from './composables/useFlowEditor';
import { useKeyboard } from './composables/useKeyboard';
import CustomNode from './components/CustomNode.vue';

// Vue Flow 实例
const { fitView } = useVueFlow();

// 初始化流程编辑器
const {
  plottedNodes,
  plottedEdges,
  selectedNode,
  layoutDirection,
  selectNode,
  selectEdge,
  addChildNode,
  handleConnect,
  deleteSelected,
  runLayout,
  setLayoutDirection,
  generateMermaidCode,
  updateNode,
  clearSavedData,
  setNodeEditing
} = useFlowEditor();

// 通用布局后自动缩放函数
const runWithFitView = async (layoutAction: () => void) => {
  layoutAction();
  // 等待布局更新完成（因为 runLayout 使用了 setTimeout(0)）
  await new Promise(resolve => setTimeout(resolve, 10));
  await nextTick();
  // 布局完成后自动调整视口
  fitView({ padding: 0.1 });
};

// 自定义布局函数（包含自动缩放）
const customRunLayout = () => runWithFitView(runLayout);

// 自定义设置布局方向函数（包含自动缩放）
const customSetLayoutDirection = (direction: string) => 
  runWithFitView(() => setLayoutDirection(direction));

// 注册自定义节点类型（使用 markRaw 和 h 函数）
const nodeTypes = computed(() => markRaw({
  custom: (props: any) => {
    return h(CustomNode, {
      ...props,
      updateNode: updateNode,
      onEditStart: (nodeId: string) => setNodeEditing(nodeId, true),
      onEditComplete: (nodeId: string) => setNodeEditing(nodeId, false)
    });
  }
}));

// 状态
const status = ref('就绪');
const showStatus = (msg: string) => {
  status.value = msg;
  setTimeout(() => status.value = '就绪', 2000);
};

// 复制 Mermaid 代码
const copyMermaidCode = async () => {
  try {
    await navigator.clipboard.writeText(generateMermaidCode());
    showStatus('Mermaid 代码已复制到剪贴板');
  } catch {
    showStatus('复制失败，请手动复制');
  }
};

// 清除数据
const handleClearData = () => {
  if (confirm('确定要清除所有数据吗？')) {
    clearSavedData();
    location.reload();
  }
};

// Vue Flow 事件处理
const onNodeClick = ({ node }: any) => node?.id && selectNode(node);
const onEdgeClick = ({ edge }: any) => edge?.id && selectEdge(edge.id);
const onSelectionChange = ({ nodes, edges }: any) => {
  if (edges?.[0]) selectEdge(edges[0].id);
  else if (nodes?.[0]) selectNode(nodes[0]);
};
const onConnect = handleConnect;

// 激活选中节点的编辑模式
const activateNodeEdit = () => {
  console.log('activateNodeEdit', { selectedNode: selectedNode.value });
  if (selectedNode.value) {
    setNodeEditing(selectedNode.value.id, true);
  }
};

// 键盘快捷键
useKeyboard({
  tab: addChildNode,
  delete: deleteSelected,
  enter: activateNodeEdit
});

// 组件挂载时初始化布局
onMounted(async () => {
  // 使用与其他布局操作完全相同的模式
  await customRunLayout();
  // 初始化选中第一个节点
  if (plottedNodes.value.length > 0 && !selectedNode.value) {
    selectNode(plottedNodes.value[0] || null);
  }
});
</script>

<template>
  <div class="editor-container">
    <!-- 工具栏 -->
    <div class="toolbar">
      <div class="layout-controls">
        <label>布局方向：</label>
        <button 
          v-for="direction in ['TB', 'LR', 'BT', 'RL']" 
          :key="direction"
          :class="{ active: layoutDirection === direction }"
          @click="customSetLayoutDirection(direction)"
        >
          {{ direction }}
        </button>
      </div>
      <button class="toolbar-button" @click="customRunLayout">
        <span class="icon">✨</span> 自动整理
      </button>
      <button class="toolbar-button" @click="copyMermaidCode">
        <span class="icon">📋</span> 复制 Mermaid
      </button>
      <button class="toolbar-button danger" @click="handleClearData">
        <span class="icon">🗑️</span> 清除数据
      </button>
      <div class="selected-node-info">
        {{ selectedNode ? `当前选中: ${selectedNode.label}` : '未选中节点' }}
      </div>
    </div>
    
    <!-- 主体画布 -->
    <div class="flow-container">
      <VueFlow
        :nodes="plottedNodes"
        :edges="plottedEdges"
        :node-types="nodeTypes"
        :default-viewport="{ x: 0, y: 0, zoom: 1 }"
        :fit-view-on-init="false"
        :delete-key-code="null"
        class="vue-flow"
        @node-click="onNodeClick"
        @edge-click="onEdgeClick"
        @connect="onConnect"
        @selection-change="onSelectionChange"
      >
        <Background />
        <Controls />
      </VueFlow>
    </div>
    
    <!-- 状态提示 -->
    <div class="status">{{ status }}</div>
  </div>
</template>

<style>
.editor-container {
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f0f2f5;
  font-family: Arial, sans-serif;
}

.toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
  background-color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  z-index: 1000;
}

.toolbar-button {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background-color: #1a73e8;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.toolbar-button:hover {
  background-color: #1557b0;
  transform: translateY(-1px);
}

.toolbar-button:active {
  transform: translateY(0);
}

.toolbar-button.danger {
  background-color: #dc3545;
}

.toolbar-button.danger:hover {
  background-color: #c82333;
}

.icon {
  font-size: 16px;
}

.selected-node-info {
  margin-left: auto;
  font-size: 14px;
  color: #666;
  font-weight: 500;
}

.flow-container {
  flex: 1;
  position: relative;
  overflow: auto;
}

.vue-flow {
  width: 100%;
  height: 100%;
  background-color: white;
}

.vue-flow__edge-path {
  stroke: #1a73e8;
  stroke-width: 2;
}

.vue-flow__edge.selected .vue-flow__edge-path {
  stroke: #ff6b6b;
}

.status {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  padding: 8px 16px;
  background-color: rgba(0, 0, 0, 0.8);
  color: white;
  border-radius: 4px;
  font-size: 14px;
  z-index: 1000;
}

.layout-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.layout-controls label {
  font-size: 14px;
  color: #333;
  font-weight: 500;
}

.layout-controls button {
  padding: 6px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  background-color: white;
  color: #333;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.layout-controls button:hover {
  background-color: #f5f5f5;
  border-color: #1a73e8;
}

.layout-controls button.active {
  background-color: #1a73e8;
  color: white;
  border-color: #1a73e8;
}
</style>
