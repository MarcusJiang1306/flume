<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useVueFlow } from '@vue-flow/core';
import { useToolbarEvents } from '../composables';

const { fitView } = useVueFlow();

const status = ref('就绪');

const toolbarEvents = useToolbarEvents(fitView);

onMounted(() => {
  toolbarEvents.setStatusCallback((msg) => {
    status.value = msg;
  });
});

const handleLayoutDirectionChange = toolbarEvents.handleLayoutDirectionChange;
const handleAutoArrange = toolbarEvents.handleAutoArrange;
const handleCopyMermaid = toolbarEvents.handleCopyMermaid;
const handleClearData = toolbarEvents.handleClearData;

// 通过 toolbarEvents 获取状态
const layoutDirection = computed(() => toolbarEvents.getLayoutDirection());
const selectedNode = computed(() => toolbarEvents.getSelectedNode());
</script>

<template>
  <div class="toolbar">
    <div class="layout-controls">
      <label>布局方向：</label>
      <button 
        v-for="direction in ['TB', 'LR', 'BT', 'RL']" 
        :key="direction"
        @click="handleLayoutDirectionChange(direction)"
        :class="{ active: layoutDirection === direction }"
      >
        {{ direction }}
      </button>
    </div>
    <button class="toolbar-button" @click="handleAutoArrange">
      <span class="icon">✨</span> 自动整理
    </button>
    <button class="toolbar-button" @click="handleCopyMermaid">
      <span class="icon">📋</span> 复制 Mermaid
    </button>
    <button class="toolbar-button danger" @click="handleClearData">
      <span class="icon">🗑️</span> 清除数据
    </button>
    <div v-if="selectedNode" class="selected-node-info">
      选中节点: {{ selectedNode.label }}
    </div>
  </div>
  <div class="status">{{ status }}</div>
</template>

<style scoped>
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
