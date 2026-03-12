import { inject, provide } from 'vue';
import type { InjectionKey } from 'vue';
import { useFlowState, type FlowState } from './useFlowState';

export interface FlowDependencies {
  store: FlowState;
  graphOps: FlowState['services']['graphOps'];
  generateMermaidCode: FlowState['services']['generateMermaidCode'];
}

const FLOW_DEPENDENCIES_KEY: InjectionKey<FlowDependencies> = Symbol('flowDependencies');

export function provideFlowDependencies() {
  const flowState = useFlowState();

  const dependencies: FlowDependencies = {
    store: flowState,
    graphOps: flowState.services.graphOps,
    generateMermaidCode: flowState.services.generateMermaidCode
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