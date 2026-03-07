import { describe, it, expect, vi } from 'vitest';
import { useLayout } from '../../src/composables/useLayout';
import { ref } from 'vue';
import type { NodeData, EdgeData, PlottedNodeData, RenderedEdgeData } from '../../src/types';

describe('useLayout', () => {
  it('should initialize with correct structure', () => {
    const rawNodes = ref<NodeData[]>([]);
    const rawEdges = ref<EdgeData[]>([]);
    const layoutDirection = ref('TB');
    const plottedNodes = ref<PlottedNodeData[]>([]);
    const plottedEdges = ref<RenderedEdgeData[]>([]);
    const saveDataToStorage = vi.fn();

    const layout = useLayout({
      rawNodes,
      rawEdges,
      layoutDirection,
      plottedNodes,
      plottedEdges,
      saveDataToStorage
    });

    expect(layout).toHaveProperty('updateLayout');
    expect(layout).toHaveProperty('runLayout');
    expect(layout).toHaveProperty('setLayoutDirection');
  });

  it('should update layout when updateLayout is called', () => {
    const rawNodes = ref<NodeData[]>([
      { id: 'node-1', label: 'Node 1', type: 'custom' }
    ]);
    const rawEdges = ref<EdgeData[]>([]);
    const layoutDirection = ref('TB');
    const plottedNodes = ref<PlottedNodeData[]>([]);
    const plottedEdges = ref<RenderedEdgeData[]>([]);
    const saveDataToStorage = vi.fn();

    const layout = useLayout({
      rawNodes,
      rawEdges,
      layoutDirection,
      plottedNodes,
      plottedEdges,
      saveDataToStorage
    });

    layout.updateLayout();

    expect(plottedNodes.value.length).toBe(1);
    expect(saveDataToStorage).toHaveBeenCalled();
  });

  it('should set layout direction when setLayoutDirection is called', () => {
    const rawNodes = ref<NodeData[]>([
      { id: 'node-1', label: 'Node 1', type: 'custom' }
    ]);
    const rawEdges = ref<EdgeData[]>([]);
    const layoutDirection = ref('TB');
    const plottedNodes = ref<PlottedNodeData[]>([]);
    const plottedEdges = ref<RenderedEdgeData[]>([]);
    const saveDataToStorage = vi.fn();

    const layout = useLayout({
      rawNodes,
      rawEdges,
      layoutDirection,
      plottedNodes,
      plottedEdges,
      saveDataToStorage
    });

    layout.setLayoutDirection('LR');
    expect(layoutDirection.value).toBe('LR');
  });

  it('should handle empty nodes', () => {
    const rawNodes = ref<NodeData[]>([]);
    const rawEdges = ref<EdgeData[]>([]);
    const layoutDirection = ref('TB');
    const plottedNodes = ref<PlottedNodeData[]>([]);
    const plottedEdges = ref<RenderedEdgeData[]>([]);
    const saveDataToStorage = vi.fn();

    const layout = useLayout({
      rawNodes,
      rawEdges,
      layoutDirection,
      plottedNodes,
      plottedEdges,
      saveDataToStorage
    });

    layout.updateLayout();
    expect(plottedNodes.value).toEqual([]);
    expect(plottedEdges.value).toEqual([]);
  });
});
