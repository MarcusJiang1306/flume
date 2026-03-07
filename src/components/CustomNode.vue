<template>
  <div 
    class="custom-node" 
    :class="{ 'is-selected': selected }"
    @dblclick="startEdit"
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
      @blur="saveAndExit"
      ref="inputRef"
    />
  </div>
</template>

<script setup>
import { Handle } from '@vue-flow/core';
import { ref, nextTick, computed } from 'vue';

const props = defineProps({
  data: { type: Object, required: true },
  id: { type: String, required: true },
  selected: { type: Boolean, default: false },
  updateNode: { type: Function, required: true }
});

const isEditing = ref(false);
const inputRef = ref(null);
const localValue = ref(props.data.label);

const handlePositions = computed(() => props.data.handlePositions || ['top', 'bottom']);

const startEdit = () => {
  isEditing.value = true;
  localValue.value = props.data.label;
  nextTick(() => {
    inputRef.value?.focus();
    inputRef.value?.select();
  });
};

const saveAndExit = () => {
  const newValue = localValue.value.trim();
  if (newValue !== props.data.label) {
    props.updateNode(props.id, { label: newValue });
  }
  isEditing.value = false;
};
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
