<script setup lang="ts">
import { onMounted, nextTick } from 'vue';
import type { CSSProperties } from 'vue';
import { useVueFlow } from '@vue-flow/core';
import '@vue-flow/core/dist/style.css';
import { provideFlowDependencies } from '../composables/useFlowDependencies';
import Toolbar from './Toolbar.vue';
import FlowCanvas from './FlowCanvas.vue';

interface BackgroundProps {
  pattern?: 'dots' | 'lines' | 'cross';
  patternColor?: string;
  gap?: number;
  size?: number;
  color?: string;
}

interface StyleConfig {
  container?: string | CSSProperties;
  toolbar?: string | CSSProperties;
  canvas?: string | CSSProperties;
}

interface Props {
  containerClass?: string;
  toolbarClass?: string;
  canvasClass?: string;
  style?: StyleConfig;
  background?: BackgroundProps;
  showControls?: boolean;
  showBackground?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  containerClass: '',
  toolbarClass: '',
  canvasClass: '',
  style: () => ({}),
  background: () => ({
    pattern: 'dots',
    patternColor: '#b1b1b7',
    gap: 20,
    size: 1
  }),
  showControls: true,
  showBackground: true
});

const { fitView } = useVueFlow();

const { store } = provideFlowDependencies();

onMounted(async () => {
  store.init();
  await nextTick();
  await new Promise(resolve => setTimeout(resolve, 10));
  fitView({ padding: 0.1 });
});

const getContainerClass = () => {
  const classes = ['flume-provider-container'];
  if (props.containerClass) classes.push(props.containerClass);
  return classes.join(' ');
};

const getContainerStyle = () => {
  const style = props.style?.container;
  return typeof style === 'object' ? style : undefined;
};

const getToolbarClass = () => {
  const classes = ['flume-toolbar-wrapper'];
  if (props.toolbarClass) classes.push(props.toolbarClass);
  const style = props.style?.toolbar;
  if (typeof style === 'string') classes.push(style);
  return classes.join(' ');
};

const getToolbarStyle = () => {
  const style = props.style?.toolbar;
  return typeof style === 'object' ? style : undefined;
};

const getCanvasClass = () => {
  const classes = ['flume-canvas-wrapper'];
  if (props.canvasClass) classes.push(props.canvasClass);
  const style = props.style?.canvas;
  if (typeof style === 'string') classes.push(style);
  return classes.join(' ');
};

const getCanvasStyle = () => {
  const style = props.style?.canvas;
  return typeof style === 'object' ? style : undefined;
};
</script>

<template>
  <div :class="getContainerClass()" :style="getContainerStyle()">
    <div :class="getToolbarClass()" :style="getToolbarStyle()">
      <slot name="toolbar">
        <Toolbar />
      </slot>
    </div>
    
    <div :class="getCanvasClass()" :style="getCanvasStyle()">
      <slot name="canvas">
        <FlowCanvas 
          :background="background"
          :show-controls="showControls"
          :show-background="showBackground"
        />
      </slot>
    </div>
    
    <div v-if="$slots.default" class="flume-extra-content">
      <slot></slot>
    </div>
  </div>
</template>
