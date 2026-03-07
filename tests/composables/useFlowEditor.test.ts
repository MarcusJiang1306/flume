import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useFlowEditor } from '../../src/composables/useFlowEditor';
import * as useStorage from '../../src/composables/useStorage';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    }
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

describe('useFlowEditor', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.spyOn(useStorage, 'loadSavedData').mockReturnValue(null);
  });

  afterEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('should initialize with default root node when no saved data', () => {
    const editor = useFlowEditor();
    expect(editor.rawNodes.value.length).toBe(1);
    expect(editor.rawEdges.value.length).toBe(0);
    expect(editor.layoutDirection.value).toBe('TB');
  });

  it('should load saved data when available', () => {
    const savedData = {
      nodes: [{ id: 'node-1', label: 'Node 1', type: 'custom' }],
      edges: [{ id: 'edge-1', source: 'node-1', target: 'node-2', type: 'smoothstep' }],
      layoutDirection: 'LR'
    };
    vi.spyOn(useStorage, 'loadSavedData').mockReturnValue(savedData);

    const editor = useFlowEditor();
    expect(editor.rawNodes.value).toEqual(savedData.nodes);
    expect(editor.rawEdges.value).toEqual(savedData.edges);
    expect(editor.layoutDirection.value).toBe(savedData.layoutDirection);
  });

  it('should have all required methods', () => {
    const editor = useFlowEditor();
    expect(editor).toHaveProperty('selectNode');
    expect(editor).toHaveProperty('selectEdge');
    expect(editor).toHaveProperty('addChildNode');
    expect(editor).toHaveProperty('handleConnect');
    expect(editor).toHaveProperty('runLayout');
    expect(editor).toHaveProperty('deleteSelected');
    expect(editor).toHaveProperty('generateMermaidCode');
    expect(editor).toHaveProperty('updateNodeLabel');
    expect(editor).toHaveProperty('updateNode');
    expect(editor).toHaveProperty('setLayoutDirection');
    expect(editor).toHaveProperty('clearSavedData');
  });

  it('should generate mermaid code', () => {
    const editor = useFlowEditor();
    const mermaidCode = editor.generateMermaidCode();
    expect(typeof mermaidCode).toBe('string');
    expect(mermaidCode).toContain('flowchart TB');
  });
});
