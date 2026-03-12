import { useFlowDependencies } from '../useFlowDependencies';
import { generateMermaidCode } from '../services/useMermaid';

export function useToolbarEvents(fitView: (options?: any) => void) {
  const { store } = useFlowDependencies();

  // 状态管理
  let status: string = '就绪';
  let statusCallback: ((msg: string) => void) | null = null;

  // 设置状态回调
  const setStatusCallback = (callback: (msg: string) => void) => {
    statusCallback = callback;
  };

  // 显示状态
  const showStatus = (msg: string) => {
    status = msg;
    if (statusCallback) {
      statusCallback(msg);
    }
    setTimeout(() => {
      status = '就绪';
      if (statusCallback) {
        statusCallback('就绪');
      }
    }, 2000);
  };

  // 通用布局后自动缩放函数
  const runWithFitView = async (layoutAction: () => void) => {
    layoutAction();
    // 等待布局更新完成
    await new Promise(resolve => setTimeout(resolve, 10));
    await import('vue').then(({ nextTick }) => nextTick());
    // 布局完成后自动调整视口
    fitView({ padding: 0.1 });
  };

  // 处理布局方向切换
  const handleLayoutDirectionChange = (direction: string) => {
    runWithFitView(() => store.setLayoutDirection(direction));
  };

  // 处理自动整理
  const handleAutoArrange = () => {
    runWithFitView(() => store.runLayout());
  };

  // 处理复制Mermaid代码
  const handleCopyMermaid = async () => {
    try {
      await navigator.clipboard.writeText(generateMermaidCode(store.rawNodes, store.rawEdges));
      showStatus('Mermaid 代码已复制到剪贴板');
    } catch {
      showStatus('复制失败，请手动复制');
    }
  };

  // 处理清除数据
  const handleClearData = () => {
    if (confirm('确定要清除所有数据吗？')) {
      store.clearSavedData();
      location.reload();
    }
  };

  // 获取布局方向
  const getLayoutDirection = () => store.layoutDirection;

  // 获取选中节点
  const getSelectedNode = () => store.selectedNode;

  return {
    status,
    setStatusCallback,
    showStatus,
    handleLayoutDirectionChange,
    handleAutoArrange,
    handleCopyMermaid,
    handleClearData,
    getLayoutDirection,
    getSelectedNode
  };
}
