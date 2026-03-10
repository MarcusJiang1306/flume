import { describe, it, expect } from 'vitest';
import { useLayout } from '../../src/composables';
import type { NodeData, EdgeData } from '../../src/types';

describe('useLayout', () => {
  it('should return correct structure', () => {
    const rawNodes: NodeData[] = [];
    const rawEdges: EdgeData[] = [];
    const layoutDirection = 'TB';

    const result = useLayout({
      rawNodes,
      rawEdges,
      layoutDirection
    });

    expect(result).toHaveProperty('plottedNodes');
    expect(result).toHaveProperty('plottedEdges');
    expect(Array.isArray(result.plottedNodes)).toBe(true);
    expect(Array.isArray(result.plottedEdges)).toBe(true);
  });

  it('should calculate layout for single node', () => {
    const rawNodes: NodeData[] = [
      { id: 'node-1', label: 'Node 1', type: 'custom' }
    ];
    const rawEdges: EdgeData[] = [];
    const layoutDirection = 'TB';

    const result = useLayout({
      rawNodes,
      rawEdges,
      layoutDirection
    });

    expect(result.plottedNodes.length).toBe(1);
    expect(result.plottedEdges.length).toBe(0);
    expect(result.plottedNodes[0].id).toBe('node-1');
    expect(result.plottedNodes[0].position).toBeDefined();
  });

  it('should handle layout direction', () => {
    const rawNodes: NodeData[] = [
      { id: 'node-1', label: 'Node 1', type: 'custom' },
      { id: 'node-2', label: 'Node 2', type: 'custom' }
    ];
    const rawEdges: EdgeData[] = [
      { id: 'edge-1', source: 'node-1', target: 'node-2', type: 'smoothstep' }
    ];
    const layoutDirection = 'LR';

    const result = useLayout({
      rawNodes,
      rawEdges,
      layoutDirection
    });

    expect(result.plottedNodes.length).toBe(2);
    expect(result.plottedEdges.length).toBe(1);
  });

  it('should handle empty nodes', () => {
    const rawNodes: NodeData[] = [];
    const rawEdges: EdgeData[] = [];
    const layoutDirection = 'TB';

    const result = useLayout({
      rawNodes,
      rawEdges,
      layoutDirection
    });

    expect(result.plottedNodes).toEqual([]);
    expect(result.plottedEdges).toEqual([]);
  });
});
