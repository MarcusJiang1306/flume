import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useKeyboard } from '../../src/composables/events/useKeyboard';

// 提取 handleKeyDown 函数用于测试

// 模拟生命周期钩子
vi.mock('vue', async (importOriginal) => {
  const original = await importOriginal<typeof import('vue')>();
  return {
    ...original,
    onMounted: vi.fn((fn: () => void) => {
      // 直接执行回调函数，模拟组件挂载
      fn();
    }),
    onUnmounted: vi.fn()
  };
});

describe('useKeyboard', () => {
  let addEventListenerSpy: any;
  let removeEventListenerSpy: any;

  beforeEach(() => {
    // 模拟 window.addEventListener
    addEventListenerSpy = vi.spyOn(window, 'addEventListener').mockImplementation(() => {});
    // 模拟 window.removeEventListener
    removeEventListenerSpy = vi.spyOn(window, 'removeEventListener').mockImplementation(() => {});
  });

  afterEach(() => {
    // 恢复原始实现
    addEventListenerSpy.mockRestore();
    removeEventListenerSpy.mockRestore();
    // 清除所有模拟
    vi.clearAllMocks();
  });

  it('should register keyboard event listener on mount', () => {
    const tabHandler = vi.fn();

    useKeyboard([
      { key: 'Tab', handler: tabHandler }
    ]);

    // 验证 addEventListener 被调用
    expect(addEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function), true);
  });

  it('should handle Tab key correctly', () => {
    const tabHandler = vi.fn();

    useKeyboard([
      { key: 'Tab', handler: tabHandler }
    ]);

    // 获取注册的事件处理函数
    const eventHandler = addEventListenerSpy.mock.calls[0][1];

    // 模拟 Tab 键按下事件
    const tabEvent = new KeyboardEvent('keydown', { key: 'Tab' });
    eventHandler(tabEvent);

    // 验证处理函数被调用
    expect(tabHandler).toHaveBeenCalled();
  });

  it('should handle Delete key correctly', () => {
    const deleteHandler = vi.fn();

    useKeyboard([
      { key: 'Delete', handler: deleteHandler }
    ]);

    // 获取注册的事件处理函数
    const eventHandler = addEventListenerSpy.mock.calls[0][1];

    // 模拟 Delete 键按下事件
    const deleteEvent = new KeyboardEvent('keydown', { key: 'Delete' });
    eventHandler(deleteEvent);

    // 验证处理函数被调用
    expect(deleteHandler).toHaveBeenCalled();
  });

  it('should handle Ctrl+Enter key correctly', () => {
    const ctrlEnterHandler = vi.fn();

    useKeyboard([
      { key: 'Enter', ctrlKey: true, handler: ctrlEnterHandler }
    ]);

    // 获取注册的事件处理函数
    const eventHandler = addEventListenerSpy.mock.calls[0][1];

    // 模拟 Ctrl+Enter 键按下事件
    const ctrlEnterEvent = new KeyboardEvent('keydown', { key: 'Enter', ctrlKey: true });
    eventHandler(ctrlEnterEvent);

    // 验证处理函数被调用
    expect(ctrlEnterHandler).toHaveBeenCalled();
  });

  it('should not handle events from input elements', () => {
    const tabHandler = vi.fn();

    useKeyboard([
      { key: 'Tab', handler: tabHandler }
    ]);

    // 获取注册的事件处理函数
    const eventHandler = addEventListenerSpy.mock.calls[0][1];

    // 模拟来自输入元素的 Tab 键按下事件
    const tabEvent = new KeyboardEvent('keydown', { key: 'Tab' });
    // 模拟 event.target 为输入元素
    Object.defineProperty(tabEvent, 'target', {
      value: document.createElement('input'),
      writable: false
    });

    eventHandler(tabEvent);

    // 验证处理函数没有被调用
    expect(tabHandler).not.toHaveBeenCalled();
  });

  it('should not handle events from textarea elements', () => {
    const tabHandler = vi.fn();

    useKeyboard([
      { key: 'Tab', handler: tabHandler }
    ]);

    // 获取注册的事件处理函数
    const eventHandler = addEventListenerSpy.mock.calls[0][1];

    // 模拟来自文本区域元素的 Tab 键按下事件
    const tabEvent = new KeyboardEvent('keydown', { key: 'Tab' });
    // 模拟 event.target 为文本区域元素
    Object.defineProperty(tabEvent, 'target', {
      value: document.createElement('textarea'),
      writable: false
    });

    eventHandler(tabEvent);

    // 验证处理函数没有被调用
    expect(tabHandler).not.toHaveBeenCalled();
  });

  it('should handle stopPropagation option', () => {
    const tabHandler = vi.fn();
    const stopPropagationSpy = vi.fn();

    useKeyboard([
      { key: 'Tab', handler: tabHandler, stopPropagation: true }
    ]);

    // 获取注册的事件处理函数
    const eventHandler = addEventListenerSpy.mock.calls[0][1];

    // 模拟 Tab 键按下事件，并添加 stopPropagation 方法
    const tabEvent = new KeyboardEvent('keydown', { key: 'Tab' });
    Object.defineProperty(tabEvent, 'stopPropagation', {
      value: stopPropagationSpy,
      writable: false
    });

    eventHandler(tabEvent);

    // 验证 stopPropagation 被调用
    expect(stopPropagationSpy).toHaveBeenCalled();
  });

  it('should prevent default behavior', () => {
    const tabHandler = vi.fn();
    const preventDefaultSpy = vi.fn();

    useKeyboard([
      { key: 'Tab', handler: tabHandler }
    ]);

    // 获取注册的事件处理函数
    const eventHandler = addEventListenerSpy.mock.calls[0][1];

    // 模拟 Tab 键按下事件，并添加 preventDefault 方法
    const tabEvent = new KeyboardEvent('keydown', { key: 'Tab' });
    Object.defineProperty(tabEvent, 'preventDefault', {
      value: preventDefaultSpy,
      writable: false
    });

    eventHandler(tabEvent);

    // 验证 preventDefault 被调用
    expect(preventDefaultSpy).toHaveBeenCalled();
  });

  it('should not call handler for unmatched keys', () => {
    const tabHandler = vi.fn();

    useKeyboard([
      { key: 'Tab', handler: tabHandler }
    ]);

    // 获取注册的事件处理函数
    const eventHandler = addEventListenerSpy.mock.calls[0][1];

    // 模拟不匹配的键按下事件
    const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' });
    eventHandler(enterEvent);

    // 验证处理函数没有被调用
    expect(tabHandler).not.toHaveBeenCalled();
  });

  it('should not call handler for unmatched ctrlKey state', () => {
    const ctrlEnterHandler = vi.fn();

    useKeyboard([
      { key: 'Enter', ctrlKey: true, handler: ctrlEnterHandler }
    ]);

    // 获取注册的事件处理函数
    const eventHandler = addEventListenerSpy.mock.calls[0][1];

    // 模拟 Enter 键按下事件，但没有 Ctrl 键
    const enterEvent = new KeyboardEvent('keydown', { key: 'Enter', ctrlKey: false });
    eventHandler(enterEvent);

    // 验证处理函数没有被调用
    expect(ctrlEnterHandler).not.toHaveBeenCalled();
  });
});
