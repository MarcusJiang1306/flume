import { ref, type Ref } from 'vue';
import { useGraphOperations } from '../../src/composables';
import type { NodeData, EdgeData, PlottedNodeData } from '../../src/types';
import { DIR } from '../../src/types';

describe('useGraphOperations', () => {
  let selectedNode: Ref<PlottedNodeData | null>;
  let selectedEdge: Ref<EdgeData | null>;
  let generateNodeId: () => string;
  let generateEdgeId: () => string;
  let initialNodes: NodeData[];
  let initialEdges: EdgeData[];

  beforeEach(() => {
    initialNodes = [
      { id: 'node-1', label: 'Node 1', type: 'custom' },
      { id: 'node-2', label: 'Node 2', type: 'custom' }
    ];
    initialEdges = [
      { id: 'edge-1', source: 'node-1', target: 'node-2', sourceHandle: DIR.BOTTOM, targetHandle: DIR.TOP, type: 'smoothstep' }
    ];
    selectedNode = ref(null);
    selectedEdge = ref(null);
    generateNodeId = () => 'new-node-id';
    generateEdgeId = () => 'new-edge-id';
  });

  test('should create graph operations instance', () => {
    const graphOps = useGraphOperations({
      generateNodeId,
      generateEdgeId,
      initialNodes,
      initialEdges
    });

    expect(graphOps).toBeDefined();
    expect(typeof graphOps.addChildNode).toBe('function');
    expect(typeof graphOps.addSiblingNode).toBe('function');
    expect(typeof graphOps.deleteSelected).toBe('function');
  });

  test('should select node', () => {
    const graphOps = useGraphOperations({
      generateNodeId,
      generateEdgeId,
      initialNodes,
      initialEdges
    });

    const mockNode: PlottedNodeData = {
      id: 'node-1',
      label: 'Node 1',
      type: 'custom',
      position: { x: 0, y: 0 },
      isEditing: false
    };

    graphOps.selectNode(selectedNode, mockNode);
    expect(selectedNode.value).toEqual(mockNode);
  });

  test('should select edge', () => {
    const graphOps = useGraphOperations({
      generateNodeId,
      generateEdgeId,
      initialNodes,
      initialEdges
    });

    graphOps.selectEdge(selectedNode, selectedEdge, 'edge-1');
    expect(selectedNode.value).toBeNull();
    expect(selectedEdge.value).toEqual(initialEdges[0]);
  });

  test('should add child node', () => {
    const graphOps = useGraphOperations({
      generateNodeId,
      generateEdgeId,
      initialNodes,
      initialEdges
    });

    const mockSelectedNode: PlottedNodeData = {
      id: 'node-1',
      label: 'Node 1',
      type: 'custom',
      position: { x: 0, y: 0 },
      isEditing: false
    };

    const newNodeId = graphOps.addChildNode(mockSelectedNode);

    expect(newNodeId).toBeDefined();
    expect(graphOps.rawNodes.value.length).toBe(3);
    expect(graphOps.rawEdges.value.length).toBe(2);
  });

  test('should add sibling node', () => {
    const graphOps = useGraphOperations({
      generateNodeId,
      generateEdgeId,
      initialNodes,
      initialEdges
    });

    const mockSelectedNode: PlottedNodeData = {
      id: 'node-2',
      label: 'Node 2',
      type: 'custom',
      position: { x: 0, y: 0 },
      isEditing: false
    };
    const newNodeId = graphOps.addSiblingNode(mockSelectedNode);

    expect(newNodeId).toBeDefined();

    expect(graphOps.rawNodes.value.length).toBe(3);
    expect(graphOps.rawEdges.value.length).toBe(2);
  });

  test('should handle connect', () => {
    const graphOps = useGraphOperations({
      generateNodeId,
      generateEdgeId,
      initialNodes,
      initialEdges
    });

    const connection = {
      source: 'node-1',
      target: 'node-2',
      sourceHandle: 'bottom',
      targetHandle: 'top'
    };

    graphOps.handleConnect(connection, 'TB');
  });

  test('should delete selected node', () => {
    const graphOps = useGraphOperations({
      generateNodeId,
      generateEdgeId,
      initialNodes,
      initialEdges
    });

    const mockSelectedNode: PlottedNodeData = {
      id: 'node-2',
      label: 'Node 2',
      type: 'custom',
      position: { x: 0, y: 0 },
      isEditing: false
    };

    graphOps.deleteSelected(mockSelectedNode, null, selectedNode, selectedEdge);
    expect(graphOps.rawNodes.value.length).toBe(1);
    expect(graphOps.rawEdges.value.length).toBe(0);
  });

  test('should delete selected edge', () => {
    const graphOps = useGraphOperations({
      generateNodeId,
      generateEdgeId,
      initialNodes,
      initialEdges
    });

    const mockSelectedEdge = initialEdges[0];

    graphOps.deleteSelected(null, mockSelectedEdge, selectedNode, selectedEdge);
    expect(graphOps.rawEdges.value.length).toBe(0);
  });

  test('should update node', () => {
    const graphOps = useGraphOperations({
      generateNodeId,
      generateEdgeId,
      initialNodes,
      initialEdges
    });

    graphOps.updateNode('node-1', { label: 'Updated Node 1' });
    expect(graphOps.rawNodes.value[0].label).toBe('Updated Node 1');
  });

  test('should get child edge IDs', () => {
    const graphOps = useGraphOperations({
      generateNodeId,
      generateEdgeId,
      initialNodes,
      initialEdges
    });

    const childEdgeIds = graphOps.getChildEdgeIds('node-1');
    expect(childEdgeIds).toEqual(['node-2']);
  });

  test('should get sibling edge IDs', () => {
    const graphOps = useGraphOperations({
      generateNodeId,
      generateEdgeId,
      initialNodes,
      initialEdges
    });

    const siblingEdgeIds = graphOps.getSiblingEdgeIds('node-2');
    expect(siblingEdgeIds).toEqual([]);
  });
});
