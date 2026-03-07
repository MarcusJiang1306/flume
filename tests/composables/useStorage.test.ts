import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { loadSavedData, saveDataToStorage, clearSavedData, generateNodeId, generateEdgeId, resetCounters } from '../../src/composables/useStorage';
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
  beforeEach(() => {
    localStorage.clear();
    resetCounters();
  });

  afterEach(() => {
    localStorage.clear();
    resetCounters();
  });

  describe('loadSavedData', () => {
    it('should load saved data from localStorage', () => {
      const testData = {
        nodes: [{ id: 'node-1', label: 'Node 1', type: 'custom' }],
        edges: [{ id: 'edge-1', source: 'node-1', target: 'node-2', type: 'smoothstep' }],
        layoutDirection: 'TB'
      };
      localStorage.setItem('mermaid-proxy-data', JSON.stringify(testData));

      const result = loadSavedData();
      expect(result).toEqual({
        nodes: testData.nodes,
        edges: testData.edges,
        layoutDirection: testData.layoutDirection
      });
    });

    it('should return null if no data is saved', () => {
      const result = loadSavedData();
      expect(result).toBeNull();
    });

    it('should return null if data is corrupted', () => {
      localStorage.setItem('mermaid-proxy-data', 'invalid json');
      const result = loadSavedData();
      expect(result).toBeNull();
    });
  });

  describe('saveDataToStorage', () => {
    it('should save data to localStorage', () => {
      const nodes: NodeData[] = [{ id: 'node-1', label: 'Node 1', type: 'custom' }];
      const edges: EdgeData[] = [{ id: 'edge-1', source: 'node-1', target: 'node-2', type: 'smoothstep' }];
      const layoutDirection = 'TB';

      saveDataToStorage(nodes, edges, layoutDirection);
      const savedData = JSON.parse(localStorage.getItem('mermaid-proxy-data') || '{}');
      expect(savedData.nodes).toEqual(nodes);
      expect(savedData.edges).toEqual(edges);
      expect(savedData.layoutDirection).toBe(layoutDirection);
    });
  });

  describe('clearSavedData', () => {
    it('should clear saved data from localStorage', () => {
      localStorage.setItem('mermaid-proxy-data', JSON.stringify({ nodes: [], edges: [] }));
      localStorage.setItem('node-counter', '10');
      localStorage.setItem('edge-counter', '5');

      clearSavedData();
      expect(localStorage.getItem('mermaid-proxy-data')).toBeNull();
    });
  });

  describe('generateNodeId', () => {
    it('should generate unique node IDs', () => {
      const id1 = generateNodeId();
      const id2 = generateNodeId();
      expect(id1).not.toBe(id2);
      expect(id1).toMatch(/^node-\d+$/);
      expect(id2).toMatch(/^node-\d+$/);
    });

    it('should increment counter', () => {
      const id1 = generateNodeId();
      const id2 = generateNodeId();
      const counter1 = parseInt(id1.split('-')[1]!);
      const counter2 = parseInt(id2.split('-')[1]!);
      expect(counter2).toBe(counter1 + 1);
    });
  });

  describe('generateEdgeId', () => {
    it('should generate unique edge IDs', () => {
      const id1 = generateEdgeId();
      const id2 = generateEdgeId();
      expect(id1).not.toBe(id2);
      expect(id1).toMatch(/^edge-\d+$/);
      expect(id2).toMatch(/^edge-\d+$/);
    });

    it('should increment counter', () => {
      const id1 = generateEdgeId();
      const id2 = generateEdgeId();
      const counter1 = parseInt(id1.split('-')[1]!);
      const counter2 = parseInt(id2.split('-')[1]!);
      expect(counter2).toBe(counter1 + 1);
    });
  });

  describe('resetCounters', () => {
    it('should reset counters to zero', () => {
      generateNodeId();
      generateEdgeId();
      resetCounters();
      const id1 = generateNodeId();
      const id2 = generateEdgeId();
      expect(id1).toBe('node-1');
      expect(id2).toBe('edge-1');
    });
  });
});
