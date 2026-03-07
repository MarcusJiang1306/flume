import { onMounted, onUnmounted } from 'vue';

export interface KeyboardShortcuts {
  tab?: () => void;
  delete?: () => void;
  backspace?: () => void;
  ctrlL?: () => void;
}

export function useKeyboard(shortcuts: KeyboardShortcuts) {
  const handleKeyDown = (e: KeyboardEvent) => {
    // 如果在输入框中，不处理快捷键
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
      return;
    }

    if (e.key === 'Tab' && shortcuts.tab) {
      e.preventDefault();
      shortcuts.tab();
    } else if (e.key === 'Delete' && shortcuts.delete) {
      e.preventDefault();
      e.stopPropagation(); // 阻止 Vue Flow 默认行为
      shortcuts.delete();
    } else if (e.key === 'Backspace' && shortcuts.backspace) {
      e.preventDefault();
      e.stopPropagation(); // 阻止 Vue Flow 默认行为
      shortcuts.backspace();
    } else if (e.ctrlKey && e.key === 'l' && shortcuts.ctrlL) {
      e.preventDefault();
      shortcuts.ctrlL();
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
