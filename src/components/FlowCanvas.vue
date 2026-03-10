<script setup lang="ts">
import { computed, markRaw, h } from 'vue';
import { VueFlow } from '@vue-flow/core';
import { Controls } from '@vue-flow/controls';
import { Background } from '@vue-flow/background';
import { useCanvasEvents, useNodeEvents, useKeyboard } from '../composables';
import CustomNode from './CustomNode.vue';
import { convertToPlottedNode, convertToEdgeData } from '../utils/layout';

// 事件处理
const canvasEvents = useCanvasEvents();
const nodeEvents = useNodeEvents();

// 初始化布局
canvasEvents.initLayout();

useKeyboard([
  { key: 'Tab', handler: canvasEvents.addChildNode, stopPropagation: true },
  { key: 'Delete', handler: canvasEvents.deleteSelected, stopPropagation: true },
  { key: 'Enter', handler: canvasEvents.activateNodeEdit, stopPropagation: true },
  { key: 'Enter', ctrlKey: true, handler: canvasEvents.addSiblingNode, stopPropagation: false },
  { key: 'ArrowUp', handler: () => canvasEvents.handleDirectionKey('up'), stopPropagation: true },
  { key: 'ArrowDown', handler: () => canvasEvents.handleDirectionKey('down'), stopPropagation: true },
  { key: 'ArrowLeft', handler: () => canvasEvents.handleDirectionKey('left'), stopPropagation: true },
  { key: 'ArrowRight', handler: () => canvasEvents.handleDirectionKey('right'), stopPropagation: true }
]);

const nodeTypes = computed(() => markRaw({
  custom: (vueFlowProps: any) => {
    return h(CustomNode, {
      ...vueFlowProps,
      nodeEvents
    });
  }
}));
</script>

<template>
  <div class="flow-container">
    <VueFlow
      :nodes="canvasEvents.getPlottedNodes()"
      :edges="canvasEvents.getPlottedEdges()"
      :node-types="nodeTypes"
      :default-viewport="{ x: 0, y: 0, zoom: 1 }"
      :fit-view-on-init="false"
      :delete-key-code="null"
      class="vue-flow"
      @node-click="(event) => canvasEvents.selectNode(convertToPlottedNode(event.node))"
      @edge-click="(event) => canvasEvents.selectEdge(convertToEdgeData(event.edge))"
      @connect="canvasEvents.handleConnect"
      @selection-change="(event: any) => {
        if (event.edges?.[0]) {
          canvasEvents.selectEdge(convertToEdgeData(event.edges[0]));
        } else if (event.nodes?.[0]) {
          canvasEvents.selectNode(convertToPlottedNode(event.nodes[0]));
        } else {
          canvasEvents.selectNode(null);
          canvasEvents.selectEdge(null);
        }
      }"
      @click="(event: any) => {
        if (event.target?.classList?.contains('vue-flow__pane')) {
          canvasEvents.selectNode(null);
          canvasEvents.selectEdge(null);
        }
      }"
    >
      <Background />
      <Controls />
    </VueFlow>
  </div>
</template>

<style scoped>
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

:deep(.vue-flow__edge-path) {
  stroke: #1a73e8;
  stroke-width: 2;
}

:deep(.vue-flow__edge.selected .vue-flow__edge-path) {
  stroke: #ff6b6b;
}
</style>
