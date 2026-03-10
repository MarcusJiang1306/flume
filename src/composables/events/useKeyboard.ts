import { onMounted, onUnmounted } from 'vue';

export interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  handler: () => void;
  stopPropagation?: boolean;
}

export function useKeyboard(shortcuts: KeyboardShortcut[]) {
  const handleKeyDown = (e: KeyboardEvent) => {
    // 如果在输入框中，不处理快捷键
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
      return;
    }

    const matchedShortcut = shortcuts.find(shortcut => 
      shortcut.key === e.key && 
      (shortcut.ctrlKey === undefined ? false : shortcut.ctrlKey) === e.ctrlKey
    );
    // 执行对应的处理函数
    if (matchedShortcut) {
      e.preventDefault(); // 默认阻止默认行为
      if (matchedShortcut.stopPropagation) {
        e.stopPropagation(); // 阻止事件冒泡
      }
      matchedShortcut.handler(); // 执行回调函数
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
