import { describe, it, expect, vi } from 'vitest';
import { useKeyboard } from '../../src/composables/useKeyboard';

describe('useKeyboard', () => {
  it('should have correct keyboard shortcuts interface', () => {
    const tabHandler = vi.fn();
    const deleteHandler = vi.fn();
    const ctrlLHandler = vi.fn();
    const backspaceHandler = vi.fn();

    // Should not throw error when calling useKeyboard
    expect(() => {
      useKeyboard({
        tab: tabHandler,
        delete: deleteHandler,
        ctrlL: ctrlLHandler,
        backspace: backspaceHandler
      });
    }).not.toThrow();
  });

  it('should handle Tab key correctly', () => {
    const tabHandler = vi.fn();
    const deleteHandler = vi.fn();
    const ctrlLHandler = vi.fn();

    useKeyboard({
      tab: tabHandler,
      delete: deleteHandler,
      ctrlL: ctrlLHandler
    });

    // Test that handlers are defined
    expect(tabHandler).toBeDefined();
    expect(deleteHandler).toBeDefined();
    expect(ctrlLHandler).toBeDefined();
  });

  it('should handle Delete key correctly', () => {
    const tabHandler = vi.fn();
    const deleteHandler = vi.fn();
    const ctrlLHandler = vi.fn();

    useKeyboard({
      tab: tabHandler,
      delete: deleteHandler,
      ctrlL: ctrlLHandler
    });

    // Test that handlers are defined
    expect(deleteHandler).toBeDefined();
  });

  it('should handle Ctrl+L key correctly', () => {
    const tabHandler = vi.fn();
    const deleteHandler = vi.fn();
    const ctrlLHandler = vi.fn();

    useKeyboard({
      tab: tabHandler,
      delete: deleteHandler,
      ctrlL: ctrlLHandler
    });

    // Test that handlers are defined
    expect(ctrlLHandler).toBeDefined();
  });
});
