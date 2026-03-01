import { ref, nextTick } from 'vue';
import type { NodeData, EdgeData, PlottedNodeData } from '../types';
import * as dagre from 'dagre';

// 生成唯一 ID
let edgeCounter = parseInt(localStorage.getItem('edge-counter') || '0');
let nodeCounter = parseInt(localStorage.getItem('node-counter') || '0');

// 2. 定义生成函数
export const generateEdgeId = () => {
  edgeCounter++; // 先自增
  localStorage.setItem('edge-counter', edgeCounter.toString()); // 立刻存盘！
  return `edge-${edgeCounter}`;
};

export const generateNodeId = () => {
  nodeCounter++;
  localStorage.setItem('node-counter', nodeCounter.toString());
  return `node-${nodeCounter}`;
};

// 从 localStorage 加载保存的数据
const loadSavedData = () => {
  try {
    const savedData = localStorage.getItem('mermaid-proxy-data');
    if (savedData) {
      const parsed = JSON.parse(savedData);
      return {
        nodes: parsed.nodes || [],
        edges: parsed.edges || [],
        nodePositions: parsed.nodePositions || {},
        edgePositions: parsed.edgePositions || {}
      };
    }
  } catch (error) {
    console.error('加载保存的数据失败:', error);
  }
  return null;
};

// 保存数据到 localStorage
const saveDataToStorage = (nodes: NodeData[], edges: EdgeData[], nodePositions?: any, edgePositions?: any) => {
  try {
    // 加载原来的数据
    const savedData = localStorage.getItem('mermaid-proxy-data');
    let oldNodePositions = {};
    let oldEdgePositions = {};
    
    if (savedData) {
      const parsed = JSON.parse(savedData);
      oldNodePositions = parsed.nodePositions || {};
      oldEdgePositions = parsed.edgePositions || {};
    }
    
    // 如果新传入的 nodePositions 是空对象，使用原来的值
    const finalNodePositions = (nodePositions && Object.keys(nodePositions).length > 0) 
      ? nodePositions 
      : oldNodePositions;
    
    // 如果新传入的 edgePositions 是空对象，使用原来的值
    const finalEdgePositions = (edgePositions && Object.keys(edgePositions).length > 0) 
      ? edgePositions 
      : oldEdgePositions;
    
    const data = {
      nodes: nodes,
      edges: edges,
      nodePositions: finalNodePositions,
      edgePositions: finalEdgePositions
    };
    localStorage.setItem('mermaid-proxy-data', JSON.stringify(data));
    console.log('数据已保存到 localStorage');
  } catch (error) {
    console.error('保存数据到 localStorage 失败:', error);
  }
};

// 清除 localStorage
const clearSavedData = () => {
  localStorage.removeItem('mermaid-proxy-data');
  nodeCounter = 0;
  edgeCounter = 0;
  console.log('已清除 localStorage');
};

export function useFlowEditor() {
  // 尝试从 localStorage 加载保存的数据
  const savedData = loadSavedData();
  
  // 响应式状态
  const rawNodes = ref<NodeData[]>(savedData?.nodes || [
    {
      id: 'node-1',
      label: '思维导图',
      type: 'custom',
      handlePositions: ['top', 'bottom', 'left', 'right']
    }
  ]);
  
  const rawEdges = ref<EdgeData[]>(savedData?.edges || []);
  const selectedNodeId = ref<string | null>('node-1');
  const selectedEdgeId = ref<string | null>(null);
  const layoutDirection = ref<string>('TB'); // TB (top to bottom), LR (left to right), BT (bottom to top), RL (right to left)
  
  // 响应式引用：带坐标的节点和连线
  const plottedNodes = ref<PlottedNodeData[]>([]);
  const plottedEdges = ref<EdgeData[]>([]);
  
  // 计算布局
  const updateLayout = () => {
    // 如果没有节点，直接返回
    if (rawNodes.value.length === 0) {
      plottedNodes.value = [];
      plottedEdges.value = [];
      return;
    }
    
    const g = new dagre.graphlib.Graph({
      compound: true,
      directed: true,
      multigraph: true
    });
    
    g.setGraph({
      rankdir: layoutDirection.value, // 布局方向
      marginx: 40,
      marginy: 40,
      nodesep: 80, // 节点之间的水平距离
      ranksep: 100, // 层级之间的垂直距离
      edgesep: 35 // 边之间的距离
    });
    
    g.setDefaultEdgeLabel(() => ({}));
    
    // 添加节点
    rawNodes.value.forEach(node => {
      g.setNode(node.id, {
        label: node.label,
        width: 120,
        height: 60
      });
    });
    
    // 添加连线（只添加源和目标都存在的连线）
    rawEdges.value.forEach(edge => {
      const sourceExists = rawNodes.value.some(n => n.id === edge.source);
      const targetExists = rawNodes.value.some(n => n.id === edge.target);
      if (sourceExists && targetExists) {
        g.setEdge(edge.source, edge.target, {
          label: edge.label || '',
          type: edge.type
        });
      }
    });
    
    // 运行布局算法
    dagre.layout(g);
    
    // 计算所有节点的 x 坐标范围
    let minX = Infinity;
    let maxX = -Infinity;
    rawNodes.value.forEach(node => {
      const nodeInfo = g.node(node.id);
      if (nodeInfo) {
        minX = Math.min(minX, nodeInfo.x - nodeInfo.width / 2);
        maxX = Math.max(maxX, nodeInfo.x + nodeInfo.width / 2);
      }
    });
    
    // 如果没有有效的节点信息，使用默认偏移
    if (minX === Infinity) {
      minX = 0;
      maxX = 120;
    }
    
    // 计算偏移量，让根节点位于左三分之一的位置
    // 假设画布宽度为 1200px，左三分之一位置为 400px
    const canvasWidth = 1200;
    const targetRootX = canvasWidth / 3;
    const offsetX = targetRootX - minX;
    
    // 转换为 Vue Flow 格式
    plottedNodes.value = rawNodes.value.map(node => {
      const nodeInfo = g.node(node.id);
      if (!nodeInfo) {
        // 如果节点信息不存在，返回默认位置
        return {
          id: node.id,
          label: node.label,
          type: node.type,
          handlePositions: node.handlePositions,
          data: {
            label: node.label,
            handlePositions: node.handlePositions
          },
          position: {
            x: 0,
            y: 0
          },
          width: 120,
          height: 60
        } as PlottedNodeData;
      }
      return {
        id: node.id,
        label: node.label,
        type: node.type,
        handlePositions: node.handlePositions,
        data: {
          label: node.label,
          handlePositions: node.handlePositions
        },
        position: {
          x: nodeInfo.x - nodeInfo.width / 2 + offsetX,
          y: nodeInfo.y - nodeInfo.height / 2
        },
        width: nodeInfo.width,
        height: nodeInfo.height
      } as PlottedNodeData;
    });
    
    // 只复制有效的连线
    plottedEdges.value = rawEdges.value.filter(edge => {
      return rawNodes.value.some(n => n.id === edge.source) && 
             rawNodes.value.some(n => n.id === edge.target);
    });
    
    // 保存节点和连线位置到 localStorage
    const nodePositions: any = {};
    plottedNodes.value.forEach(node => {
      nodePositions[node.id] = node.position;
    });
    const edgePositions: any = {};
    plottedEdges.value.forEach(edge => {
      edgePositions[edge.id] = {
        source: edge.source,
        target: edge.target,
        sourceHandle: edge.sourceHandle,
        targetHandle: edge.targetHandle
      };
    });
    saveDataToStorage(rawNodes.value, rawEdges.value, nodePositions, edgePositions);
  };
  
  // 初始化布局
  updateLayout();
  
  // 选择节点
  const selectNode = (id: string) => {
    selectedNodeId.value = id;
    selectedEdgeId.value = null; // 清除连线选中状态
    console.log('选中节点:', id);
  };
  
  // 选择连线
  const selectEdge = (id: string) => {
    selectedEdgeId.value = id;
    selectedNodeId.value = null; // 清除节点选中状态
    console.log('选中连线:', id);
  };
  
  // 更新节点标签
  const updateNodeLabel = (id: string, label: string) => {
    console.log('updateNodeLabel 被调用:', id, label);
    const node = rawNodes.value.find(n => n.id === id);
    if (node) {
      console.log('找到节点:', node.id, '当前标签:', node.label);
      // 创建新的节点对象，确保响应式更新
      const updatedNodes = rawNodes.value.map(n => {
        if (n.id === id) {
          return { ...n, label: label };
        }
        return n;
      });
      rawNodes.value = updatedNodes;
      console.log('更新后的节点标签:', id, '新标签:', label);
      console.log('当前 rawNodes:', rawNodes.value);
      updateLayout();
    } else {
      console.log('未找到节点:', id);
    }
  };
  
  // 添加子节点
  const addChildNode = () => {
    if (!selectedNodeId.value) return;
    
    const parentId = selectedNodeId.value;
    
    const newId = generateNodeId();
    const newNode: NodeData = {
      id: newId,
      label: '请输入文字',
      type: 'custom',
      handlePositions: ['top', 'bottom', 'left', 'right']
    };
    
    rawNodes.value.push(newNode);
    
    const newEdge: EdgeData = {
      id: generateEdgeId(),
      source: parentId,
      target: newId,
      sourceHandle: 'bottom',
      targetHandle: 'top',
      type: 'smoothstep'
    };
    
    rawEdges.value.push(newEdge);
    
    console.log('添加节点:', newNode.id, '父节点:', parentId);
    console.log('添加连线:', newEdge.id, '从', newEdge.source, '到', newEdge.target);
    console.log('当前所有连线:', rawEdges.value);
    
    // 不自动选择新节点，保持当前选中状态，这样用户可以继续添加兄弟节点
    
    // 在下一个 tick 中更新布局，确保 Vue Flow 能看到所有节点和连线
    nextTick(() => {
      updateLayout();
    });
  };
  
  // 处理手动连线
    const handleConnect = (connection: any) => {
  // 1. 基础校验：防止重复连线
  const exists = rawEdges.value.some(
    e => e.source === connection.source && 
         e.target === connection.target && 
         e.sourceHandle === connection.sourceHandle && 
         e.targetHandle === connection.targetHandle
  );
  if (exists) {
    console.log('边已存在，忽略');
    return;
  }

  console.log('selectedNodeId:', selectedNodeId.value)
  console.log(connection)
  console.log('edges:', rawEdges.value)

  // 2. 创建新边：直接使用 connection 中的值，不要 || 'default'
  const newEdge: EdgeData = {
    id: generateEdgeId(), // 确保你有这个生成 ID 的函数
    source: connection.source,
    target: connection.target,
    
    // 【关键修改】：如果 connection 里有值就用，没有再给一个合理的默认值
    // 但通常 Vue Flow 的 @connect 事件一定会带上 sourceHandle 和 targetHandle
    sourceHandle: connection.sourceHandle || undefined, 
    targetHandle: connection.targetHandle || undefined,
    
    label: '', 
    type: 'default' // 先用平滑曲线，别用 smoothstep 了，容易乱
  };


  console.log('添加新边:', newEdge.id, '从', newEdge.source, '通过', newEdge.sourceHandle, '到', newEdge.target, '通过', newEdge.targetHandle);
  
  // 3. 更新数据
  rawEdges.value.push(newEdge);
  saveDataToStorage(rawNodes.value, rawEdges.value);
  
  // 4. 手动触发布局更新（Vue Flow 要求）
  setTimeout(() => {
     runLayout();
  }, 100);
};
  
  // 运行布局（触发重新计算）
  const runLayout = () => {
    updateLayout();
  };
  
  // 删除选中节点
  const deleteSelected = () => {
    if (selectedEdgeId.value) {
      // 删除选中的连线
      rawEdges.value = rawEdges.value.filter(edge => edge.id !== selectedEdgeId.value);
      // 同时更新 plottedEdges
      plottedEdges.value = plottedEdges.value.filter(edge => edge.id !== selectedEdgeId.value);
      console.log('删除连线:', selectedEdgeId.value);
      // 重置选中状态
      selectedEdgeId.value = null;
    } else if (selectedNodeId.value) {
      // 删除关联的连线
      rawEdges.value = rawEdges.value.filter(edge => 
        edge.source !== selectedNodeId.value && edge.target !== selectedNodeId.value
      );
      // 同时更新 plottedEdges
      plottedEdges.value = plottedEdges.value.filter(edge => 
        edge.source !== selectedNodeId.value && edge.target !== selectedNodeId.value
      );
      // 删除节点
      rawNodes.value = rawNodes.value.filter(node => node.id !== selectedNodeId.value);
      // 重置选中状态
      selectedNodeId.value = rawNodes.value.length > 0 ? (rawNodes.value[0]?.id || null) : null;
      // 手动触发布局更新
      updateLayout();
      console.log('删除节点:', selectedNodeId.value);
    }
    saveDataToStorage(rawNodes.value, rawEdges.value);
  };
  
  // 生成 Mermaid 代码
  const generateMermaidCode = (): string => {
    let code = 'flowchart TB\n';
    
    // 生成节点定义
    rawNodes.value.forEach(node => {
      code += `  ${node.id}["${node.label}"]\n`;
    });
    
    // 生成连线定义
    rawEdges.value.forEach(edge => {
      const label = edge.label ? `|${edge.label}|` : '';
      code += `  ${edge.source} -->${label} ${edge.target}\n`;
    });
    
    return code;
  };
  
  // 直接更新节点数据
  const updateNode = (id: string, data: Partial<NodeData>) => {
    console.log('updateNode 被调用:', id, data);
    const updatedNodes = rawNodes.value.map(node => {
      if (node.id === id) {
        return { ...node, ...data };
      }
      return node;
    });
    rawNodes.value = updatedNodes;
    console.log('更新后的节点数据:', id, data);
    console.log('当前 rawNodes:', rawNodes.value);
    updateLayout();
  };
  
  // 切换布局方向
  const setLayoutDirection = (direction: string) => {
    layoutDirection.value = direction;
    updateLayout();
    console.log('布局方向已切换为:', direction);
  };

  return {
    rawNodes,
    rawEdges,
    plottedNodes,
    plottedEdges,
    selectedNodeId,
    selectedEdgeId,
    layoutDirection,
    selectNode,
    selectEdge,
    addChildNode,
    handleConnect,
    runLayout,
    deleteSelected,
    generateMermaidCode,
    updateNodeLabel,
    updateNode,
    setLayoutDirection,
    clearSavedData
  };
}