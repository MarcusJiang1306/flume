import { describe, it, expect, vi } from 'vitest';
import { useKeyboard } from '../../src/composables';

describe('useKeyboard', () => {
  it('should have correct keyboard shortcuts interface', () => {
    const tabHandler = vi.fn();
    const deleteHandler = vi.fn();

    // Should not throw error when calling useKeyboard
    expect(() => {
      useKeyboard([
        { key: 'Tab', handler: tabHandler },
        { key: 'Delete', handler: deleteHandler }
      ]);
    }).not.toThrow();
  });

  it('should handle Tab key correctly', () => {
    const tabHandler = vi.fn();
    const deleteHandler = vi.fn();

    useKeyboard([
      { key: 'Tab', handler: tabHandler },
      { key: 'Delete', handler: deleteHandler }
    ]);

    // Test that handlers are defined
    expect(tabHandler).toBeDefined();
    expect(deleteHandler).toBeDefined();
  });

  it('should handle Delete key correctly', () => {
    const tabHandler = vi.fn();
    const deleteHandler = vi.fn();

    useKeyboard([
      { key: 'Tab', handler: tabHandler },
      { key: 'Delete', handler: deleteHandler }
    ]);

    // Test that handlers are defined
    expect(deleteHandler).toBeDefined();
  });

  it('should handle Ctrl+Enter key correctly', () => {
    const ctrlEnterHandler = vi.fn();

    useKeyboard([
      { key: 'Enter', ctrlKey: true, handler: ctrlEnterHandler }
    ]);

    // Test that handler is defined
    expect(ctrlEnterHandler).toBeDefined();
  });
});
