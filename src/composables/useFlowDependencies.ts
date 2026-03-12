import { inject, provide } from 'vue';
import type { InjectionKey } from 'vue';
import { useFlowStore, graphOps, generateMermaidCode } from '../stores/flowStore';

export interface FlowDependencies {
  store: ReturnType<typeof useFlowStore>;
  graphOps: typeof graphOps;
  generateMermaidCode: typeof generateMermaidCode;
}

const FLOW_DEPENDENCIES_KEY: InjectionKey<FlowDependencies> = Symbol('flowDependencies');

export function provideFlowDependencies() {
  const store = useFlowStore();
  
  const dependencies: FlowDependencies = {
    store,
    graphOps,
    generateMermaidCode
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