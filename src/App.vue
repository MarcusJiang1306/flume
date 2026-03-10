<script setup lang="ts">
import { onMounted } from 'vue';
import { useVueFlow } from '@vue-flow/core';
import '@vue-flow/core/dist/style.css';
import { useFlowStore } from './stores/flowStore';
import Toolbar from './components/Toolbar.vue';
import FlowCanvas from './components/FlowCanvas.vue';

const { fitView } = useVueFlow();

// 初始化 store
const store = useFlowStore();
store.computeLayout();

onMounted(async () => {
  await new Promise(resolve => setTimeout(resolve, 10));
  await import('vue').then(({ nextTick }) => nextTick());
  fitView({ padding: 0.1 });
});
</script>

<template>
  <div class="editor-container">
    <Toolbar />
    <FlowCanvas />
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
</style>
