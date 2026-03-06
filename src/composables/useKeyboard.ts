import { onMounted, onUnmounted } from 'vue';

export interface KeyboardShortcuts {
  tab?: () => void;
  delete?: () => void;
  backspace?: () => void;
  ctrlL?: () => void;
}

export function useKeyboard(shortcuts: KeyboardShortcuts) {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Tab' && shortcuts.tab) {
      e.preventDefault();
      shortcuts.tab();
    } else if (e.key === 'Delete' && shortcuts.delete) {
      e.preventDefault();
      shortcuts.delete();
    } else if (e.ctrlKey && e.key === 'l' && shortcuts.ctrlL) {
      e.preventDefault();
      shortcuts.ctrlL();
    }
  };

  onMounted(() => {
    window.addEventListener('keydown', handleKeyDown);
  });

  onUnmounted(() => {
    window.removeEventListener('keydown', handleKeyDown);
  });
}
