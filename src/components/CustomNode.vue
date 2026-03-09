<template>
  <div 
    class="custom-node" 
    :class="{ 'is-selected': isSelected, 'is-editing': isEditing }"
  >
    <Handle
      v-for="position in handlePositions"
      :key="position"
      type="source"
      :position="position"
      :id="position"
      class="handle"
    />
    <input
      v-model="localValue"
      :disabled="!isEditing"
      :class="{ 'is-editing': isEditing }"
      class="node-input"
      @blur="handleBlur"
      @keydown.enter.stop="handleInputEnter"
      @mousedown.stop
      @click.stop
      ref="inputRef"
    />
  </div>
</template>

<script setup lang="ts">
import { Handle } from '@vue-flow/core';
import { ref, nextTick, computed, watch, type Ref } from 'vue';

import type { PlottedNodeData } from '../types';

const props = defineProps({
  id: { type: String, required: true },
  data: { type: Object, required: true },
  selected: { type: Boolean, default: false },
  selectedNode: { type: Object as () => Ref<PlottedNodeData | null>, default: null },
  updateNode: { type: Function, required: true }
});

const emit = defineEmits(['update:selectedNode']);

const inputRef = ref<HTMLInputElement | null>(null);
const localValue = ref(props.data.label);

const handlePositions = computed(() => props.data.handlePositions || ['top', 'bottom']);

const nodeId = computed(() => props.id);
const isSelected = computed(() => {
  return props.selectedNode?.value?.id === nodeId.value;
});
const isEditing = computed(() => {
  return props.selectedNode?.value?.id === nodeId.value && props.selectedNode?.value?.isEditing === true;
});

const startEdit = () => {
  localValue.value = props.data.label;
  nextTick(() => {
    inputRef.value?.focus();
    inputRef.value?.select();
  });
};

const saveAndExit = () => {
  const newValue = localValue.value.trim();
  if (newValue !== props.data.label) {
    props.updateNode(nodeId.value, { label: newValue });
  }
  // 重置 localValue 为 props.data.label
  localValue.value = props.data.label;
  // 退出编辑模式
  if (props.selectedNode && props.selectedNode.value && props.selectedNode.value.id === nodeId.value) {
    emit('update:selectedNode', { ...props.selectedNode.value, isEditing: false });
  }
};

const handleBlur = () => {
  saveAndExit();
};

const handleInputEnter = (event: KeyboardEvent) => {
  event.stopPropagation();
  saveAndExit();
};

// 监听 isEditing 的变化
watch(() => isEditing.value, (newValue) => {
  if (newValue) {
    startEdit();
  } else {
    // 退出编辑模式时，只重置 localValue，不保存
    localValue.value = props.data.label;
  }
});
</script>

<style scoped>
.custom-node {
  padding: 8px 12px;
  background: white;
  border: 2px solid #1a73e8;
  border-radius: 8px;
  min-width: 120px;
  min-height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
  cursor: pointer;
  position: relative;
}

.custom-node.is-selected {
  border-color: #ff6b6b;
  box-shadow: 0 0 0 3px rgba(255, 107, 107, 0.2);
}

.custom-node.is-editing {
  cursor: text;
  pointer-events: none;
}

.custom-node.is-editing .node-input {
  pointer-events: auto;
}

.custom-node:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.node-input {
  border: none;
  background: transparent;
  font-size: 14px;
  color: #333;
  text-align: center;
  outline: none;
  padding: 4px 8px;
  width: 100%;
  min-width: 80px;
  font-family: Arial, sans-serif;
  cursor: inherit;
  user-select: none;
  pointer-events: none;
}

.node-input:disabled {
  opacity: 1;
}

.node-input.is-editing {
  background: #f5f5f5;
  border-radius: 4px;
  cursor: text;
  user-select: text;
  pointer-events: auto;
}

.handle {
  width: 10px;
  height: 10px;
  background: #1a73e8;
  border: 2px solid white;
  border-radius: 50%;
  transition: all 0.2s ease;
  position: absolute;
  pointer-events: all;
  z-index: 10;
}

.handle:hover {
  background: #ff6b6b;
  transform: scale(1.2);
}

.handle[data-position="top"] { top: -5px; }
.handle[data-position="bottom"] { bottom: -5px; }
.handle[data-position="left"] { left: -5px; }
.handle[data-position="right"] { right: -5px; }
</style>
