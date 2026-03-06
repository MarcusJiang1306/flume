<script setup lang="ts">
import { ref, computed, markRaw, h } from 'vue';
import { VueFlow } from '@vue-flow/core';
import { Controls } from '@vue-flow/controls';
import { Background } from '@vue-flow/background';
import '@vue-flow/core/dist/style.css';
import { useFlowEditor } from './composables/useFlowEditor';
import { useKeyboard } from './composables/useKeyboard';
import CustomNode from './components/CustomNode.vue';

// 初始化流程编辑器
const {
  plottedNodes,
  plottedEdges,
  selectedNodeId,
  layoutDirection,
  selectNode,
  selectEdge,
  addChildNode,
  handleConnect,
  deleteSelected,
  runLayout,
  setLayoutDirection,
  generateMermaidCode,
  updateNodeLabel,
  updateNode,
  clearSavedData
} = useFlowEditor();

// 注册自定义节点类型（使用 markRaw 和 h 函数）
const nodeTypes = markRaw({
  custom: (props: any) => {
    return h(CustomNode, {
      ...props,
      updateNode: updateNode
    });
  }
});

// 状态
const status = ref('就绪');

// 计算属性：当前选中的节点
const selectedNode = computed(() => {
  return plottedNodes.value.find(node => node.id === selectedNodeId.value) || null;
});

// 处理节点更新事件
const handleNodeUpdate = (node: any) => {
  console.log('节点更新事件:', node);
  if (node.id && node.data && node.data.label !== undefined) {
    updateNodeLabel(node.id, node.data.label);
  }
};

// 复制 Mermaid 代码（异步）
const copyMermaidCode = async () => {
  try {
    const code = generateMermaidCode();
    await navigator.clipboard.writeText(code);
    status.value = 'Mermaid 代码已复制到剪贴板';
    setTimeout(() => {
      status.value = '就绪';
    }, 2000);
  } catch (error) {
    status.value = '复制失败，请手动复制';
    setTimeout(() => {
      status.value = '就绪';
    }, 2000);
  }
};

// 清除数据
const handleClearData = () => {
  if (confirm('确定要清除所有数据吗？')) {
    clearSavedData();
    location.reload();
  }
};

// 节点点击事件
const onNodeClick = (event: any) => {
  console.log('节点点击事件触发:', event);
  if (event && event.node && event.node.id) {
    selectNode(event.node.id);
  }
};

// 连线点击事件
const onEdgeClick = (event: any) => {
  console.log('连线点击事件触发:', event);
  if (event && event.edge && event.edge.id) {
    selectEdge(event.edge.id);
  }
};

// 选中状态变化事件
const onSelectionChange = (params: any) => {
  console.log('选中状态变化:', params);
  if (params.edges && params.edges.length > 0) {
    selectEdge(params.edges[0].id);
  } else if (params.nodes && params.nodes.length > 0) {
    selectNode(params.nodes[0].id);
  }
};

// 连线事件
const onConnect = (connection: any) => {
  console.log('Vue Flow 连接事件:', connection);
  handleConnect(connection);
};

// 键盘快捷键
useKeyboard({
  tab: addChildNode,
  delete: deleteSelected,
  backspace: deleteSelected,
  ctrlL: runLayout
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
          @click="setLayoutDirection(direction)"
        >
          {{ direction }}
        </button>
      </div>
      <button class="toolbar-button" @click="runLayout">
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
        class="vue-flow"
        @node-click="onNodeClick"
        @edge-click="onEdgeClick"
        @connect="onConnect"
        @selection-change="onSelectionChange"
        @node-update="handleNodeUpdate"
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