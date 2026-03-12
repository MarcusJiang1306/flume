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


