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
