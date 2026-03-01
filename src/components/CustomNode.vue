<template>
  <div class="custom-node" @click="handleNodeClick" @dblclick="handleDoubleClick">
    <Handle
      v-for="position in handlePositions"
      :key="position"
      :type="getHandleType(position)"
      :position="position"
      :id="position"
      class="handle"
    />
    <input
      :value="isEditable ? localValue : data.label"
      @input="handleInput"
      :disabled="!isEditable"
      :class="{ 'editable': isEditable }"
      class="node-input"
      @blur="handleBlur"
      @click="handleInputClick"
      ref="inputRef"
    />
  </div>
</template>

<script setup>
import { Handle, useVueFlow } from '@vue-flow/core';
import { ref, nextTick, computed, watch } from 'vue';

const props = defineProps({
  data: {
    type: Object,
    required: true
  },
  id: {
    type: String,
    required: true
  },
  updateNode: {
    type: Function,
    required: true
  }
});

// 调试：打印 props 结构
console.log('CustomNode props:', props);
console.log('CustomNode data:', props.data);
console.log('CustomNode data.label:', props.data.label);

const emit = defineEmits(['update:data']);

const isEditable = ref(false);
const inputRef = ref(null);
const localValue = ref(props.data.label || '');

const handlePositions = computed(() => {
  return props.data.handlePositions || ['top', 'bottom'];
});

const getHandleType = (position) => {
  return 'source';
};

watch(() => props.data.label, (newValue) => {
  console.log('data.label 变化:', newValue, '编辑状态:', isEditable.value);
  if (!isEditable.value) {
    localValue.value = newValue;
  }
});

watch(isEditable, (newValue) => {
  console.log('isEditable 变化:', newValue);
  if (newValue) {
    localValue.value = props.data.label;
  }
});

const handleNodeClick = (event) => {
  if (!isEditable.value) {
  } else {
    console.log('在编辑状态，阻止事件冒泡');
    event.stopPropagation();
  }
};

const handleInputClick = (event) => {
  if (!isEditable.value) {
  } else {
    console.log('在编辑状态，阻止事件冒泡');
    event.stopPropagation();
  }
};


const handleInput = (event) => {
  localValue.value = event.target.value;
};

const handleDoubleClick = (event) => {
  isEditable.value = true;
  nextTick(() => {
    if (inputRef.value) {
      inputRef.value.focus();
      inputRef.value.select();
    }
  });
};

const handleBlur = () => {
  if (inputRef.value && isEditable.value) {
    const newValue = inputRef.value.value.trim();
    console.log('保存输入框的值:', newValue, '节点ID:', props.id);
    if (newValue !== props.data.label) {
      console.log('值有变化，更新节点数据');
      // 直接调用 props.updateNode 方法更新节点数据
      props.updateNode(props.id, { label: newValue });
    }
  }
  isEditable.value = false;
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
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
  cursor: pointer;
  position: relative;
}

.custom-node.selected {
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
  cursor: pointer;
  user-select: none;
  pointer-events: none;
  display: block;
  z-index: 1;
  position: relative;
}

.node-input:disabled {
  cursor: pointer;
  user-select: none;
  color: #333;
  opacity: 1;
  pointer-events: none;
  display: block;
  z-index: 1;
  position: relative;
}

.node-input.editable {
  background: #f5f5f5;
  border-radius: 4px;
  cursor: text;
  user-select: text;
  pointer-events: all;
  display: block;
}

.node-input:focus {
  background: #f5f5f5;
  border-radius: 4px;
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

.handle[position="top"] {
  top: -5px;
}

.handle[position="bottom"] {
  bottom: -5px;
}

.handle[position="left"] {
  left: -5px;
}

.handle[position="right"] {
  right: -5px;
}

.node-input {
  pointer-events: none;
}
</style>