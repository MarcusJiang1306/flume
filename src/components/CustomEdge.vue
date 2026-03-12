<template>
  <g 
    class="custom-edge" 
    :class="{ 'is-selected': isSelected, 'is-editing': isEditing }"
    @click.stop="handleClick"
  >
    <BaseEdge 
      :id="props.id"
      :path="path"
      :marker-end="markerEnd"
      :style="edgeStyle"
      :source-handle-id="props.sourceHandleId"
      :target-handle-id="props.targetHandleId"
    />
    <foreignObject
      :x="labelPosition.x"
      :y="labelPosition.y"
      width="200"
      height="40"
      class="edge-label-foreign-object"
    >
      <div class="edge-label-container">
        <span ref="measureRef" class="edge-label-measure">{{ localValue }}</span>
        <input
          v-if="isEditing"
          v-model="localValue"
          class="edge-label-input"
          :style="{ width: inputWidth }"
          placeholder=""
          @blur="handleBlur"
          @keydown="handleKeyDown"
          @focus="handleFocus"
          ref="inputRef"
        />
        <span
          v-else
          class="edge-label-display"
          :class="{ 'has-content': localValue.trim() }"
          :style="{ width: inputWidth }"
        >
          {{ localValue }}
        </span>
      </div>
    </foreignObject>
  </g>
</template>

<script setup lang="ts">
import { BaseEdge, getBezierPath, type EdgeProps } from '@vue-flow/core';
import { ref, nextTick, computed, watch } from 'vue';

interface CustomEdgeProps extends EdgeProps {
  id: string;
  data: any;
  edgeEvents: ReturnType<typeof import('../composables').useEdgeEvents>;
}

const props = defineProps<CustomEdgeProps>();

const inputRef = ref<HTMLInputElement | null>(null);
const measureRef = ref<HTMLSpanElement | null>(null);
const localValue = ref(props.data?.label || '');

const path = computed(() => {
  const [path] = getBezierPath(props);
  return path;
});

const markerEnd = computed(() => props.markerEnd);

const isSelected = computed(() => props.edgeEvents.isEdgeSelected(props.id));
const isEditing = computed(() => props.edgeEvents.isEdgeEditing(props.id));

const edgeStyle = computed(() => ({
  stroke: isSelected.value ? '#ff6b6b' : '#1a73e8',
  strokeWidth: '2px'
}));

const labelPosition = computed(() => {
  const sourceX = props.sourceX;
  const sourceY = props.sourceY;
  const targetX = props.targetX;
  const targetY = props.targetY;

  const midX = (sourceX + targetX) / 2;
  const midY = (sourceY + targetY) / 2;

  return {
    x: midX - 100,
    y: midY - 20
  };
});

const inputWidth = computed(() => {
  if (isEditing.value) {
    if (!localValue.value.trim()) {
      return '20px';
    }
    if (measureRef.value) {
      const width = measureRef.value.offsetWidth;
      return `${width + 8}px`;
    }
    return '20px';
  }
  
  if (!localValue.value.trim()) {
    return '0px';
  }
  if (measureRef.value) {
    const width = measureRef.value.offsetWidth;
    return `${width + 4}px`;
  }
  return 'auto';
});

const startEdit = () => {
  localValue.value = props.data?.label || '';
  nextTick(() => {
    inputRef.value?.focus();
    inputRef.value?.select();
  });
};

const handleClick = () => {
  props.edgeEvents.handleEdgeClick(props.id);
};

const handleFocus = (event: Event) => {
  props.edgeEvents.handleInputFocus(event);
};

const handleBlur = () => {
  props.edgeEvents.handleInputBlur(props.id, localValue.value);
};

const handleKeyDown = (event: KeyboardEvent) => {
  props.edgeEvents.handleInputKeyDown(event, props.id, localValue.value);
};

watch(() => isEditing.value, (newValue) => {
  if (newValue) {
    startEdit();
  } else {
    localValue.value = props.data?.label || '';
  }
});

watch(localValue, () => {
  // Input width will be recalculated by computed property
});
</script>

<style scoped>
.custom-edge {
  cursor: pointer;
}

.edge-label-foreign-object {
  overflow: visible;
  background: transparent;
  pointer-events: none;
}

.edge-label-container {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  background: transparent;
  position: relative;
  pointer-events: none;
}

.edge-label-measure {
  position: absolute;
  visibility: hidden;
  white-space: pre;
  font-size: 12px;
  font-family: Arial, sans-serif;
  padding: 2px;
}

.edge-label-display {
  border: none;
  background: transparent;
  font-size: 12px;
  color: #333;
  text-align: center;
  outline: none;
  padding: 2px;
  font-family: Arial, sans-serif;
  border-radius: 4px;
  display: inline-block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  pointer-events: none;
}

.edge-label-display.has-content {
  background: rgba(245, 245, 245, 0.5);
}

.edge-label-input {
  border: none;
  background: #f5f5f5;
  font-size: 12px;
  color: #333;
  text-align: center;
  outline: none;
  padding: 4px;
  font-family: Arial, sans-serif;
  border-radius: 4px;
  display: inline-block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  border: 1px solid #1a73e8;
  min-height: 28px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  pointer-events: auto;
}
</style>
