import { inject, provide } from 'vue';
import type { InjectionKey } from 'vue';
import { useFlowState, type FlowState } from './useFlowState';
import { useStorage } from './services/useStorage';
import { useGraphOperations } from './graph/useGraphOperations';
import { useLayout } from './services/useLayout';
import { DEFAULT_ROOT_NODE } from '../config/constants';

export interface FlowDependencies {
  store: FlowState;
  storage: ReturnType<typeof useStorage>;
  graphOps: ReturnType<typeof useGraphOperations>;
  layout: typeof useLayout;
}

const FLOW_DEPENDENCIES_KEY: InjectionKey<FlowDependencies> = Symbol('flowDependencies');

export function provideFlowDependencies() {
  const storage = useStorage();
  const { loadSavedData, generateNodeId, generateEdgeId } = storage;
  
  const savedData = loadSavedData();
  const initialNodes = savedData?.nodes || [DEFAULT_ROOT_NODE];
  const initialEdges = savedData?.edges || [];

  const graphOps = useGraphOperations({
    generateNodeId,
    generateEdgeId,
    initialNodes,
    initialEdges
  });

  const flowState = useFlowState(storage, graphOps, useLayout);

  const dependencies: FlowDependencies = {
    store: flowState,
    storage,
    graphOps,
    layout: useLayout
  };

  provide(FLOW_DEPENDENCIES_KEY, dependencies);

  return dependencies;
}

export function useFlowDependencies(): FlowDependencies {
  const dependencies = inject(FLOW_DEPENDENCIES_KEY);

  if (!dependencies) {
    throw new Error('FlowDependencies not provided. Make sure to call provideFlowDependencies() in a parent component.');
  }

  return dependencies;
}