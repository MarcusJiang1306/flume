import { describe, it, expect, vi } from 'vitest';
import { useGraphOperations } from '../../src/composables/useGraphOperations';
import { ref } from 'vue';
import type { NodeData, EdgeData } from '../../src/types';

describe('useGraphOperations', () => {
  it('should initialize with correct structure', () => {
    const rawNodes = ref<NodeData[]>([]);
    const rawEdges = ref<EdgeData[]>([]);
    const selectedNodeId = ref<string | null>(null);
    const selectedEdgeId = ref<string | null>(null);
    const layoutDirection = ref('TB');
    const generateNodeId = vi.fn(() => 'node-1');
    const generateEdgeId = vi.fn(() => 'edge-1');
    const updateLayout = vi.fn();
    const runLayout = vi.fn();

    const graphOps = useGraphOperations({
      rawNodes,
      rawEdges,
      selectedNodeId,
      selectedEdgeId,
      layoutDirection,
      generateNodeId,
      generateEdgeId,
      updateLayout,
      runLayout
    });

    expect(graphOps).toHaveProperty('selectNode');
    expect(graphOps).toHaveProperty('selectEdge');
    expect(graphOps).toHaveProperty('addChildNode');
    expect(graphOps).toHaveProperty('handleConnect');
    expect(graphOps).toHaveProperty('deleteSelected');
    expect(graphOps).toHaveProperty('updateNodeLabel');
    expect(graphOps).toHaveProperty('updateNode');
  });

  it('should select node when selectNode is called', () => {
    const rawNodes = ref<NodeData[]>([{ id: 'node-1', label: 'Node 1', type: 'custom' }]);
    const rawEdges = ref<EdgeData[]>([]);
    const selectedNodeId = ref<string | null>(null);
    const selectedEdgeId = ref<string | null>(null);
    const layoutDirection = ref('TB');
    const generateNodeId = vi.fn();
    const generateEdgeId = vi.fn();
    const updateLayout = vi.fn();
    const runLayout = vi.fn();

    const graphOps = useGraphOperations({
      rawNodes,
      rawEdges,
      selectedNodeId,
      selectedEdgeId,
      layoutDirection,
      generateNodeId,
      generateEdgeId,
      updateLayout,
      runLayout
    });

    graphOps.selectNode('node-1');
    expect(selectedNodeId.value).toBe('node-1');
    expect(selectedEdgeId.value).toBe(null);
  });

  it('should select edge when selectEdge is called', () => {
    const rawNodes = ref<NodeData[]>([{ id: 'node-1', label: 'Node 1', type: 'custom' }]);
    const rawEdges = ref<EdgeData[]>([{ id: 'edge-1', source: 'node-1', target: 'node-2', type: 'smoothstep' }]);
    const selectedNodeId = ref<string | null>(null);
    const selectedEdgeId = ref<string | null>(null);
    const layoutDirection = ref('TB');
    const generateNodeId = vi.fn();
    const generateEdgeId = vi.fn();
    const updateLayout = vi.fn();
    const runLayout = vi.fn();

    const graphOps = useGraphOperations({
      rawNodes,
      rawEdges,
      selectedNodeId,
      selectedEdgeId,
      layoutDirection,
      generateNodeId,
      generateEdgeId,
      updateLayout,
      runLayout
    });

    graphOps.selectEdge('edge-1');
    expect(selectedEdgeId.value).toBe('edge-1');
    expect(selectedNodeId.value).toBe(null);
  });

  it('should add child node when addChildNode is called', () => {
    const rawNodes = ref<NodeData[]>([{ id: 'node-1', label: 'Node 1', type: 'custom' }]);
    const rawEdges = ref<EdgeData[]>([]);
    const selectedNodeId = ref<string | null>('node-1');
    const selectedEdgeId = ref<string | null>(null);
    const layoutDirection = ref('TB');
    const generateNodeId = vi.fn(() => 'node-2');
    const generateEdgeId = vi.fn(() => 'edge-1');
    const updateLayout = vi.fn();
    const runLayout = vi.fn();

    const graphOps = useGraphOperations({
      rawNodes,
      rawEdges,
      selectedNodeId,
      selectedEdgeId,
      layoutDirection,
      generateNodeId,
      generateEdgeId,
      updateLayout,
      runLayout
    });

    graphOps.addChildNode();
    expect(rawNodes.value.length).toBe(2);
    expect(rawEdges.value.length).toBe(1);
    // addChildNode 使用 nextTick(updateLayout)，所以不会直接调用 updateLayout
  });

  it('should update node label when updateNodeLabel is called', () => {
    const rawNodes = ref<NodeData[]>([{ id: 'node-1', label: 'Node 1', type: 'custom' }]);
    const rawEdges = ref<EdgeData[]>([]);
    const selectedNodeId = ref<string | null>('node-1');
    const selectedEdgeId = ref<string | null>(null);
    const layoutDirection = ref('TB');
    const generateNodeId = vi.fn();
    const generateEdgeId = vi.fn();
    const updateLayout = vi.fn();
    const runLayout = vi.fn();

    const graphOps = useGraphOperations({
      rawNodes,
      rawEdges,
      selectedNodeId,
      selectedEdgeId,
      layoutDirection,
      generateNodeId,
      generateEdgeId,
      updateLayout,
      runLayout
    });

    graphOps.updateNodeLabel('node-1', 'Updated Node');
    expect(rawNodes.value[0]?.label).toBe('Updated Node');
    // updateNodeLabel 调用 updateNode，updateNode 使用 nextTick(updateLayout)
  });
});
