import { describe, it, expect } from 'vitest';
import { useLayout } from '../../src/composables/services/useLayout';
import type { NodeData, EdgeData } from '../../src/types';
import { DIR, DEFAULT_HANDLES } from '../../src/utils/direction';

describe('useLayout', () => {
  it('should return empty arrays when no nodes are provided', () => {
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
    expect(result.plottedNodes).toEqual([]);
    expect(result.plottedEdges).toEqual([]);
  });

  it('should calculate layout for single node in TB direction', () => {
    const rawNodes: NodeData[] = [
      { id: 'node-1', label: 'Node 1', type: 'custom', handlePositions: DEFAULT_HANDLES }
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
    expect(result.plottedNodes[0].width).toBeDefined();
    expect(result.plottedNodes[0].height).toBeDefined();
    expect(result.plottedNodes[0].label).toBe('Node 1');
  });

  it('should calculate layout for multiple nodes in TB direction', () => {
    const rawNodes: NodeData[] = [
      { id: 'node-1', label: 'Node 1', type: 'custom', handlePositions: DEFAULT_HANDLES },
      { id: 'node-2', label: 'Node 2', type: 'custom', handlePositions: DEFAULT_HANDLES }
    ];
    const rawEdges: EdgeData[] = [
      { id: 'edge-1', source: 'node-1', target: 'node-2', sourceHandle: DIR.BOTTOM, targetHandle: DIR.TOP, type: 'smoothstep' }
    ];
    const layoutDirection = 'TB';

    const result = useLayout({
      rawNodes,
      rawEdges,
      layoutDirection
    });

    expect(result.plottedNodes.length).toBe(2);
    expect(result.plottedEdges.length).toBe(1);
    expect(result.plottedNodes[0].id).toBe('node-1');
    expect(result.plottedNodes[1].id).toBe('node-2');
    expect(result.plottedEdges[0].id).toBe('edge-1');
  });

  it('should handle LR layout direction', () => {
    const rawNodes: NodeData[] = [
      { id: 'node-1', label: 'Node 1', type: 'custom', handlePositions: DEFAULT_HANDLES },
      { id: 'node-2', label: 'Node 2', type: 'custom', handlePositions: DEFAULT_HANDLES }
    ];
    const rawEdges: EdgeData[] = [
      { id: 'edge-1', source: 'node-1', target: 'node-2', sourceHandle: DIR.RIGHT, targetHandle: DIR.LEFT, type: 'smoothstep' }
    ];
    const layoutDirection = 'LR';

    const result = useLayout({
      rawNodes,
      rawEdges,
      layoutDirection
    });

    expect(result.plottedNodes.length).toBe(2);
    expect(result.plottedEdges.length).toBe(1);
    expect(result.plottedNodes[0].id).toBe('node-1');
    expect(result.plottedNodes[1].id).toBe('node-2');
  });

  it('should handle RL layout direction', () => {
    const rawNodes: NodeData[] = [
      { id: 'node-1', label: 'Node 1', type: 'custom', handlePositions: DEFAULT_HANDLES },
      { id: 'node-2', label: 'Node 2', type: 'custom', handlePositions: DEFAULT_HANDLES }
    ];
    const rawEdges: EdgeData[] = [
      { id: 'edge-1', source: 'node-1', target: 'node-2', sourceHandle: DIR.LEFT, targetHandle: DIR.RIGHT, type: 'smoothstep' }
    ];
    const layoutDirection = 'RL';

    const result = useLayout({
      rawNodes,
      rawEdges,
      layoutDirection
    });

    expect(result.plottedNodes.length).toBe(2);
    expect(result.plottedEdges.length).toBe(1);
  });

  it('should handle BT layout direction', () => {
    const rawNodes: NodeData[] = [
      { id: 'node-1', label: 'Node 1', type: 'custom', handlePositions: DEFAULT_HANDLES },
      { id: 'node-2', label: 'Node 2', type: 'custom', handlePositions: DEFAULT_HANDLES }
    ];
    const rawEdges: EdgeData[] = [
      { id: 'edge-1', source: 'node-1', target: 'node-2', sourceHandle: DIR.TOP, targetHandle: DIR.BOTTOM, type: 'smoothstep' }
    ];
    const layoutDirection = 'BT';

    const result = useLayout({
      rawNodes,
      rawEdges,
      layoutDirection
    });

    expect(result.plottedNodes.length).toBe(2);
    expect(result.plottedEdges.length).toBe(1);
  });

  it('should filter out edges with missing nodes', () => {
    const rawNodes: NodeData[] = [
      { id: 'node-1', label: 'Node 1', type: 'custom', handlePositions: DEFAULT_HANDLES }
    ];
    const rawEdges: EdgeData[] = [
      { id: 'edge-1', source: 'node-1', target: 'node-2', sourceHandle: DIR.BOTTOM, targetHandle: DIR.TOP, type: 'smoothstep' }
    ];
    const layoutDirection = 'TB';

    const result = useLayout({
      rawNodes,
      rawEdges,
      layoutDirection
    });

    expect(result.plottedNodes.length).toBe(1);
    expect(result.plottedEdges.length).toBe(0);
  });

  it('should properly set handle positions based on layout direction', () => {
    const rawNodes: NodeData[] = [
      { id: 'node-1', label: 'Node 1', type: 'custom', handlePositions: DEFAULT_HANDLES },
      { id: 'node-2', label: 'Node 2', type: 'custom', handlePositions: DEFAULT_HANDLES }
    ];
    const rawEdges: EdgeData[] = [
      { id: 'edge-1', source: 'node-1', target: 'node-2', sourceHandle: DIR.BOTTOM, targetHandle: DIR.TOP, type: 'smoothstep' }
    ];
    const layoutDirection = 'LR';

    const result = useLayout({
      rawNodes,
      rawEdges,
      layoutDirection
    });

    expect(result.plottedEdges.length).toBe(1);
    expect(result.plottedEdges[0].sourceHandle).toBeDefined();
    expect(result.plottedEdges[0].targetHandle).toBeDefined();
  });
});
