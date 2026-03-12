<template>
  <div 
    class="custom-node" 
    :class="{ 'is-selected': isSelected, 'is-editing': isEditing }"
    @click="handleClick"
  >
    <Handle
      v-for="position in handlePositions"
      :key="position"
      type="source"
      :position="position"
      :id="position"
      class="handle"
    />
    <textarea
      v-model="localValue"
      :disabled="!isEditing"
      :class="{ 'is-editing': isEditing }"
      class="node-input"
      @blur="handleBlur"
      @keydown="handleKeyDown"
      @focus="handleFocus"
      @input="autoResizeTextarea"
      @mousedown.stop
      @click.stop
      ref="textareaRef"
    />
  </div>
</template>

<script setup lang="ts">
import { Handle } from '@vue-flow/core';
import { ref, nextTick, computed, watch } from 'vue';

interface CustomNodeProps {
  id: string;
  data: any;
  nodeEvents: ReturnType<typeof import('../composables').useNodeEvents>;
}

const props = defineProps<CustomNodeProps>();

const textareaRef = ref<HTMLTextAreaElement | null>(null);
const localValue = ref(props.data.label);

const handlePositions = computed(() => props.data.handlePositions || ['top', 'bottom']);

// 通过 nodeEvents 检查当前节点的选中状态
const isSelected = computed(() => props.nodeEvents.isNodeSelected(props.id));
const isEditing = computed(() => props.nodeEvents.isNodeEditing(props.id));

const autoResizeTextarea = () => {
  if (textareaRef.value) {
    textareaRef.value.style.height = 'auto';
    textareaRef.value.style.height = `${textareaRef.value.scrollHeight}px`;
  }
};

const startEdit = () => {
  localValue.value = props.data.label;
  nextTick(() => {
    textareaRef.value?.focus();
    textareaRef.value?.select();
    autoResizeTextarea();
  });
};

// 内部事件处理
const handleClick = () => {
  // 如果节点已被选中，则进入编辑模式
  if (isSelected.value) {
    props.nodeEvents.setEditing(props.id, true);
  }
};

const handleFocus = (event: Event) => {
  props.nodeEvents.handleInputFocus(event);
};

const handleBlur = () => {
  props.nodeEvents.handleInputBlur(props.id, localValue.value);
};

const handleKeyDown = (event: KeyboardEvent) => {
  props.nodeEvents.handleInputKeyDown(event, props.id, localValue.value);
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

// 监听值变化，调整高度
watch(localValue, () => {
  if (isEditing.value) {
    nextTick(() => {
      autoResizeTextarea();
    });
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
  align-items: flex-start;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
  cursor: pointer;
  position: relative;
  box-sizing: border-box;
}

.custom-node.is-selected {
  border-color: #ff6b6b;
  box-shadow: 0 0 0 3px rgba(255, 107, 107, 0.2);
}

.custom-node.is-editing {
  cursor: text;
  pointer-events: none;
  min-height: 60px;
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
  resize: none;
  overflow: hidden;
  line-height: 1.4;
  white-space: pre-wrap;
  word-wrap: break-word;
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
  min-height: 40px;
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
