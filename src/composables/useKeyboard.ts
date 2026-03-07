import { onMounted, onUnmounted } from 'vue';

export interface KeyboardShortcuts {
  tab?: () => void;
  delete?: () => void;
  enter?: () => void;
}

export function useKeyboard(shortcuts: KeyboardShortcuts) {
  const handleKeyDown = (e: KeyboardEvent) => {
    // 如果在输入框中，不处理快捷键
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
      return;
    }

    // 定义按键映射
    const keyMap: Record<string, { 
      handler?: () => void;
      stopPropagation?: boolean;
    }> = {
      Tab: { handler: shortcuts.tab },
      Delete: { handler: shortcuts.delete, stopPropagation: true },
      Enter: { handler: shortcuts.enter }
    };

    // 执行对应的处理函数
    const config = keyMap[e.key];
    if (config && config.handler) {
      e.preventDefault(); // 默认阻止默认行为
      if (config.stopPropagation) {
        e.stopPropagation(); // 阻止事件冒泡
      }
      config.handler(); // 执行回调函数
    }
  };

  onMounted(() => {
    // 使用 capture 阶段监听，确保在 Vue Flow 之前处理
    window.addEventListener('keydown', handleKeyDown, true);
  });

  onUnmounted(() => {
    window.removeEventListener('keydown', handleKeyDown, true);
  });
}
