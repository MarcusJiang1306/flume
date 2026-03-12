<script setup lang="ts">
import Toolbar from './Toolbar.vue';
import { provideFlowDependencies } from '../composables/useFlowDependencies';

provideFlowDependencies();
</script>

<template>
  <Toolbar v-bind="$attrs">
    <template v-for="(_, slot) in $slots" #[slot]="scope">
      <slot :name="slot" v-bind="scope" />
    </template>
  </Toolbar>
</template>