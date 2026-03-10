import { ref, type Ref } from 'vue';
import { useGraphOperations } from '../../src/composables/graph/useGraphOperations';
import type { NodeData, EdgeData, PlottedNodeData } from '../../src/types';
import { DIR, DEFAULT_HANDLES } from '../../src/utils/direction';

describe('useGraphOperations', () => {
  let selectedNode: Ref<PlottedNodeData | null>;
  let selectedEdge: Ref<EdgeData | null>;
  let generateNodeId: () => string;
  let generateEdgeId: () => string;
  let initialNodes: NodeData[];
  let initialEdges: EdgeData[];

  beforeEach(() => {
    initialNodes = [
      { id: 'node-1', label: 'Node 1', type: 'custom', handlePositions: DEFAULT_HANDLES },
      { id: 'node-2', label: 'Node 2', type: 'custom', handlePositions: DEFAULT_HANDLES }
    ];
    initialEdges = [
      { id: 'edge-1', source: 'node-1', target: 'node-2', sourceHandle: DIR.BOTTOM, targetHandle: DIR.TOP, type: 'smoothstep' }
    ];
    selectedNode = ref(null);
    selectedEdge = ref(null);
    generateNodeId = () => 'new-node-id';
    generateEdgeId = () => 'new-edge-id';
  });

  test('should create graph operations instance with initial data', () => {
    const graphOps = useGraphOperations({
      generateNodeId,
      generateEdgeId,
      initialNodes,
      initialEdges
    });

    expect(graphOps).toBeDefined();
    expect(graphOps.rawNodes.value).toEqual(initialNodes);
    expect(graphOps.rawEdges.value).toEqual(initialEdges);
    expect(typeof graphOps.addChildNode).toBe('function');
    expect(typeof graphOps.addSiblingNode).toBe('function');
    expect(typeof graphOps.deleteSelected).toBe('function');
    expect(typeof graphOps.updateNode).toBe('function');
    expect(typeof graphOps.getChildEdgeIds).toBe('function');
    expect(typeof graphOps.getSiblingEdgeIds).toBe('function');
  });



  test('should update node label', () => {
    const graphOps = useGraphOperations({
      generateNodeId,
      generateEdgeId,
      initialNodes,
      initialEdges
    });

    graphOps.updateNodeLabel('node-1', 'Updated Node 1');
    expect(graphOps.rawNodes.value[0].label).toBe('Updated Node 1');
  });

  test('should add child node with correct edge', () => {
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
      isEditing: false,
      handlePositions: DEFAULT_HANDLES
    };

    const newNodeId = graphOps.addChildNode(mockSelectedNode);

    expect(newNodeId).toBe('new-node-id');
    expect(graphOps.rawNodes.value.length).toBe(3);
    expect(graphOps.rawEdges.value.length).toBe(2);

    // 验证新节点是否正确创建
    const newNode = graphOps.rawNodes.value.find(node => node.id === newNodeId);
    expect(newNode).toBeDefined();
    expect(newNode?.label).toBe('请输入文字');
    expect(newNode?.type).toBe('custom');

    // 验证新边是否正确创建
    const newEdge = graphOps.rawEdges.value.find(edge => edge.target === newNodeId);
    expect(newEdge).toBeDefined();
    expect(newEdge?.source).toBe('node-1');
    expect(newEdge?.sourceHandle).toBe(DIR.BOTTOM);
    expect(newEdge?.targetHandle).toBe(DIR.TOP);
  });

  test('should not add child node when no node is selected', () => {
    const graphOps = useGraphOperations({
      generateNodeId,
      generateEdgeId,
      initialNodes,
      initialEdges
    });

    const newNodeId = graphOps.addChildNode(null);

    expect(newNodeId).toBeNull();
    expect(graphOps.rawNodes.value.length).toBe(2);
    expect(graphOps.rawEdges.value.length).toBe(1);
  });

  test('should add sibling node with correct edge', () => {
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
      isEditing: false,
      handlePositions: DEFAULT_HANDLES
    };

    const newNodeId = graphOps.addSiblingNode(mockSelectedNode);

    expect(newNodeId).toBe('new-node-id');
    expect(graphOps.rawNodes.value.length).toBe(3);
    expect(graphOps.rawEdges.value.length).toBe(2);

    // 验证新节点是否正确创建
    const newNode = graphOps.rawNodes.value.find(node => node.id === newNodeId);
    expect(newNode).toBeDefined();
    expect(newNode?.label).toBe('请输入文字');
    expect(newNode?.type).toBe('custom');

    // 验证新边是否正确创建（应该连接到与选中节点相同的父节点）
    const newEdge = graphOps.rawEdges.value.find(edge => edge.target === newNodeId);
    expect(newEdge).toBeDefined();
    expect(newEdge?.source).toBe('node-1');
    expect(newEdge?.sourceHandle).toBe(DIR.BOTTOM);
    expect(newEdge?.targetHandle).toBe(DIR.TOP);
  });

  test('should not add sibling node when no node is selected', () => {
    const graphOps = useGraphOperations({
      generateNodeId,
      generateEdgeId,
      initialNodes,
      initialEdges
    });

    const newNodeId = graphOps.addSiblingNode(null);

    expect(newNodeId).toBeNull();
    expect(graphOps.rawNodes.value.length).toBe(2);
    expect(graphOps.rawEdges.value.length).toBe(1);
  });

  test('should not add sibling node when selected node has no parent', () => {
    const graphOps = useGraphOperations({
      generateNodeId,
      generateEdgeId,
      initialNodes: [
        { id: 'node-1', label: 'Node 1', type: 'custom', handlePositions: DEFAULT_HANDLES }
      ],
      initialEdges: []
    });

    const mockSelectedNode: PlottedNodeData = {
      id: 'node-1',
      label: 'Node 1',
      type: 'custom',
      position: { x: 0, y: 0 },
      isEditing: false,
      handlePositions: DEFAULT_HANDLES
    };

    const newNodeId = graphOps.addSiblingNode(mockSelectedNode);

    expect(newNodeId).toBeNull();
    expect(graphOps.rawNodes.value.length).toBe(1);
    expect(graphOps.rawEdges.value.length).toBe(0);
  });

  test('should handle connect and add new edge', () => {
    const graphOps = useGraphOperations({
      generateNodeId,
      generateEdgeId,
      initialNodes,
      initialEdges: [] // 清空初始边，避免重复
    });

    const connection = {
      source: 'node-1',
      target: 'node-2',
      sourceHandle: 'bottom',
      targetHandle: 'top'
    };

    graphOps.handleConnect(connection, 'TB');

    // 应该添加一条新边
    expect(graphOps.rawEdges.value.length).toBe(1);
  });

  test('should not add duplicate edge', () => {
    const graphOps = useGraphOperations({
      generateNodeId,
      generateEdgeId,
      initialNodes,
      initialEdges: [] // 清空初始边，避免重复
    });

    const connection = {
      source: 'node-1',
      target: 'node-2',
      sourceHandle: 'bottom',
      targetHandle: 'top'
    };

    // 第一次添加
    graphOps.handleConnect(connection, 'TB');
    expect(graphOps.rawEdges.value.length).toBe(1);

    // 第二次添加相同的连接，应该不会增加边的数量
    graphOps.handleConnect(connection, 'TB');
    expect(graphOps.rawEdges.value.length).toBe(1);
  });

  test('should delete selected node and its edges', () => {
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
      isEditing: false,
      handlePositions: DEFAULT_HANDLES
    };

    graphOps.deleteSelected(mockSelectedNode, null, selectedNode, selectedEdge);
    expect(graphOps.rawNodes.value.length).toBe(1);
    expect(graphOps.rawEdges.value.length).toBe(0);
    // 验证选中状态被设置为父节点，而不是 null
    expect(selectedNode.value).toBeDefined();
    expect(selectedNode.value?.id).toBe('node-1');
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
    expect(selectedEdge.value).toBeNull();
  });

  test('should update node with new data', () => {
    const graphOps = useGraphOperations({
      generateNodeId,
      generateEdgeId,
      initialNodes,
      initialEdges
    });

    graphOps.updateNode('node-1', { label: 'Updated Node 1', type: 'custom' });
    expect(graphOps.rawNodes.value[0].label).toBe('Updated Node 1');
    expect(graphOps.rawNodes.value[0].type).toBe('custom');
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
      initialNodes: [
        { id: 'node-1', label: 'Node 1', type: 'custom', handlePositions: DEFAULT_HANDLES },
        { id: 'node-2', label: 'Node 2', type: 'custom', handlePositions: DEFAULT_HANDLES },
        { id: 'node-3', label: 'Node 3', type: 'custom', handlePositions: DEFAULT_HANDLES }
      ],
      initialEdges: [
        { id: 'edge-1', source: 'node-1', target: 'node-2', sourceHandle: DIR.BOTTOM, targetHandle: DIR.TOP, type: 'smoothstep' },
        { id: 'edge-2', source: 'node-1', target: 'node-3', sourceHandle: DIR.BOTTOM, targetHandle: DIR.TOP, type: 'smoothstep' }
      ]
    });

    const siblingEdgeIds = graphOps.getSiblingEdgeIds('node-2');
    expect(siblingEdgeIds).toEqual(['node-3']);
  });

  test('should return empty array when node has no siblings', () => {
    const graphOps = useGraphOperations({
      generateNodeId,
      generateEdgeId,
      initialNodes,
      initialEdges
    });

    const siblingEdgeIds = graphOps.getSiblingEdgeIds('node-2');
    expect(siblingEdgeIds).toEqual([]);
  });

  test('should return empty array when node has no parent', () => {
    const graphOps = useGraphOperations({
      generateNodeId,
      generateEdgeId,
      initialNodes: [
        { id: 'node-1', label: 'Node 1', type: 'custom', handlePositions: DEFAULT_HANDLES }
      ],
      initialEdges: []
    });

    const siblingEdgeIds = graphOps.getSiblingEdgeIds('node-1');
    expect(siblingEdgeIds).toEqual([]);
  });
});
