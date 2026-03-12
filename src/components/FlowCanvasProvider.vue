<script setup lang="ts">
import FlowCanvas from './FlowCanvas.vue';
import { provideFlowDependencies } from '../composables/useFlowDependencies';

provideFlowDependencies();
</script>

<template>
  <div class="flow-canvas-provider">
    <FlowCanvas v-bind="$attrs">
      <template v-for="(_, slot) in $slots" #[slot]="scope">
        <slot :name="slot" v-bind="scope" />
      </template>
    </FlowCanvas>
  </div>
</template>

<style>
.flow-canvas-provider {
  display: block;
  width: 100%;
  height: 100%;
  min-width: 100px;
  min-height: 100px;
}
</style>