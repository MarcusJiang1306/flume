import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { useStorage } from '../../src/composables/services/useStorage';
import type { NodeData, EdgeData } from '../../src/types';

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

describe('useStorage', () => {
  let storage: ReturnType<typeof useStorage>;

  beforeEach(() => {
    localStorage.clear();
    storage = useStorage();
    storage.resetCounters();
  });

  afterEach(() => {
    localStorage.clear();
    storage.resetCounters();
  });

  describe('useStorage composable', () => {
    it('should return all storage functions', () => {
      expect(storage).toBeDefined();
      expect(typeof storage.generateEdgeId).toBe('function');
      expect(typeof storage.generateNodeId).toBe('function');
      expect(typeof storage.loadSavedData).toBe('function');
      expect(typeof storage.saveDataToStorage).toBe('function');
      expect(typeof storage.clearSavedData).toBe('function');
      expect(typeof storage.resetCounters).toBe('function');
    });
  });

  describe('loadSavedData', () => {
    it('should load saved data from localStorage', () => {
      const testData = {
        nodes: [{ id: 'node-1', label: 'Node 1', type: 'custom' }],
        edges: [{ id: 'edge-1', source: 'node-1', target: 'node-2', type: 'smoothstep' }],
        layoutDirection: 'TB'
      };
      localStorage.setItem('mermaid-proxy-data', JSON.stringify(testData));

      const result = storage.loadSavedData();
      expect(result).toEqual({
        nodes: testData.nodes,
        edges: testData.edges,
        layoutDirection: testData.layoutDirection
      });
    });

    it('should return null if no data is saved', () => {
      const result = storage.loadSavedData();
      expect(result).toBeNull();
    });

    it('should return null if data is corrupted', () => {
      localStorage.setItem('mermaid-proxy-data', 'invalid json');
      const result = storage.loadSavedData();
      expect(result).toBeNull();
    });

    it('should handle missing nodes or edges gracefully', () => {
      const testData = {
        layoutDirection: 'TB'
      };
      localStorage.setItem('mermaid-proxy-data', JSON.stringify(testData));

      const result = storage.loadSavedData();
      expect(result).toEqual({
        nodes: [],
        edges: [],
        layoutDirection: 'TB'
      });
    });
  });

  describe('saveDataToStorage', () => {
    it('should save data to localStorage', () => {
      const nodes: NodeData[] = [{ id: 'node-1', label: 'Node 1', type: 'custom' }];
      const edges: EdgeData[] = [{ id: 'edge-1', source: 'node-1', target: 'node-2', type: 'smoothstep' }];
      const layoutDirection = 'TB';

      storage.saveDataToStorage(nodes, edges, layoutDirection);
      const savedData = JSON.parse(localStorage.getItem('mermaid-proxy-data') || '{}');
      expect(savedData.nodes).toEqual(nodes);
      expect(savedData.edges).toEqual(edges);
      expect(savedData.layoutDirection).toBe(layoutDirection);
    });

    it('should save data without layout direction', () => {
      const nodes: NodeData[] = [{ id: 'node-1', label: 'Node 1', type: 'custom' }];
      const edges: EdgeData[] = [{ id: 'edge-1', source: 'node-1', target: 'node-2', type: 'smoothstep' }];

      storage.saveDataToStorage(nodes, edges);
      const savedData = JSON.parse(localStorage.getItem('mermaid-proxy-data') || '{}');
      expect(savedData.nodes).toEqual(nodes);
      expect(savedData.edges).toEqual(edges);
      expect(savedData.layoutDirection).toBeUndefined();
    });
  });

  describe('clearSavedData', () => {
    it('should clear saved data from localStorage', () => {
      localStorage.setItem('mermaid-proxy-data', JSON.stringify({ nodes: [], edges: [] }));
      localStorage.setItem('node-counter', '10');
      localStorage.setItem('edge-counter', '5');

      storage.clearSavedData();
      expect(localStorage.getItem('mermaid-proxy-data')).toBeNull();
    });

    it('should reset counters when clearing data', () => {
      localStorage.setItem('mermaid-proxy-data', JSON.stringify({ nodes: [], edges: [] }));
      localStorage.setItem('node-counter', '10');
      localStorage.setItem('edge-counter', '5');

      storage.clearSavedData();
      const id1 = storage.generateNodeId();
      const id2 = storage.generateEdgeId();
      expect(id1).toBe('node-1');
      expect(id2).toBe('edge-1');
    });
  });

  describe('generateNodeId', () => {
    it('should generate unique node IDs', () => {
      const id1 = storage.generateNodeId();
      const id2 = storage.generateNodeId();
      expect(id1).not.toBe(id2);
      expect(id1).toMatch(/^node-\d+$/);
      expect(id2).toMatch(/^node-\d+$/);
    });

    it('should increment counter', () => {
      const id1 = storage.generateNodeId();
      const id2 = storage.generateNodeId();
      const counter1 = parseInt(id1.split('-')[1]!);
      const counter2 = parseInt(id2.split('-')[1]!);
      expect(counter2).toBe(counter1 + 1);
    });

    it('should persist counter in localStorage', () => {
      storage.generateNodeId();
      const storedCounter = localStorage.getItem('node-counter');
      expect(storedCounter).toBe('1');
    });
  });

  describe('generateEdgeId', () => {
    it('should generate unique edge IDs', () => {
      const id1 = storage.generateEdgeId();
      const id2 = storage.generateEdgeId();
      expect(id1).not.toBe(id2);
      expect(id1).toMatch(/^edge-\d+$/);
      expect(id2).toMatch(/^edge-\d+$/);
    });

    it('should increment counter', () => {
      const id1 = storage.generateEdgeId();
      const id2 = storage.generateEdgeId();
      const counter1 = parseInt(id1.split('-')[1]!);
      const counter2 = parseInt(id2.split('-')[1]!);
      expect(counter2).toBe(counter1 + 1);
    });

    it('should persist counter in localStorage', () => {
      storage.generateEdgeId();
      const storedCounter = localStorage.getItem('edge-counter');
      expect(storedCounter).toBe('1');
    });
  });

  describe('resetCounters', () => {
    it('should reset counters to zero', () => {
      storage.generateNodeId();
      storage.generateEdgeId();
      storage.resetCounters();
      const id1 = storage.generateNodeId();
      const id2 = storage.generateEdgeId();
      expect(id1).toBe('node-1');
      expect(id2).toBe('edge-1');
    });

    it('should reset counters in localStorage', () => {
      storage.generateNodeId();
      storage.generateEdgeId();
      storage.resetCounters();
      expect(localStorage.getItem('node-counter')).toBe('0');
      expect(localStorage.getItem('edge-counter')).toBe('0');
    });
  });
});
