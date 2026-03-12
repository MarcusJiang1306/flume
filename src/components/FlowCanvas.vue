<script setup lang="ts">
import { computed, markRaw, h, onMounted, nextTick } from 'vue';
import { VueFlow } from '@vue-flow/core';
import { Controls } from '@vue-flow/controls';
import { Background } from '@vue-flow/background';
import { useCanvasEvents, useNodeEvents, useEdgeEvents, useKeyboard } from '../composables';
import CustomNode from './CustomNode.vue';
import CustomEdge from './CustomEdge.vue';
import { convertToPlottedNode } from '../utils/layout';

interface BackgroundProps {
  pattern?: 'dots' | 'lines' | 'cross';
  patternColor?: string;
  gap?: number;
  size?: number;
  color?: string;
}

interface Props {
  background?: BackgroundProps;
  showControls?: boolean;
  showBackground?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  background: () => ({
    pattern: 'dots',
    patternColor: '#b1b1b7',
    gap: 20,
    size: 1
  }),
  showControls: true,
  showBackground: true
});

const canvasEvents = useCanvasEvents();
const nodeEvents = useNodeEvents();
const edgeEvents = useEdgeEvents();

onMounted(async () => {
  try {
    await nextTick();
    canvasEvents.initLayout();
  } catch (error) {
    console.error('Failed to initialize FlowCanvas:', error);
  }
});

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

const edgeTypes = computed(() => markRaw({
  custom: (vueFlowProps: any) => {
    return h(CustomEdge, {
      ...vueFlowProps,
      edgeEvents,
      data: {
        ...vueFlowProps.data,
        label: vueFlowProps.label
      }
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
      :edge-types="edgeTypes"
      :default-viewport="{ x: 0, y: 0, zoom: 1 }"
      :fit-view-on-init="false"
      :delete-key-code="null"
      class="vue-flow"
      @node-click="(event) => canvasEvents.handleNodeClick(convertToPlottedNode(event.node))"
      @connect="canvasEvents.handleConnect"
      @click="(event: any) => {
        if (event.target?.classList?.contains('vue-flow__pane')) {
          canvasEvents.selectNode(null);
          canvasEvents.selectEdge(null);
        }
      }"
    >
      <Background
        v-if="showBackground"
        :pattern="background.pattern"
        :pattern-color="background.patternColor"
        :gap="background.gap"
        :size="background.size"
        :color="background.color"
      />
      <Controls v-if="showControls" />
    </VueFlow>
  </div>
</template>
