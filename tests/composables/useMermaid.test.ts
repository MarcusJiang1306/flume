import { describe, it, expect } from 'vitest';
import { useMermaid } from '../../src/composables';
import { ref } from 'vue';
import type { NodeData, EdgeData } from '../../src/types';

describe('useMermaid', () => {
  describe('generateMermaidCode', () => {
    it('should generate mermaid code for simple graph', () => {
      const rawNodes = ref<NodeData[]>([
        { id: 'node-1', label: 'Node 1', type: 'custom' },
        { id: 'node-2', label: 'Node 2', type: 'custom' }
      ]);
      const rawEdges = ref<EdgeData[]>([
        { id: 'edge-1', source: 'node-1', target: 'node-2', type: 'smoothstep' }
      ]);

      const { generateMermaidCode } = useMermaid(rawNodes, rawEdges);
      const mermaidCode = generateMermaidCode();

      expect(mermaidCode).toContain('flowchart TB');
      expect(mermaidCode).toContain('node-1["Node 1"]');
      expect(mermaidCode).toContain('node-2["Node 2"]');
      expect(mermaidCode).toContain('node-1 --> node-2');
    });

    it('should generate mermaid code for empty graph', () => {
      const rawNodes = ref<NodeData[]>([]);
      const rawEdges = ref<EdgeData[]>([]);

      const { generateMermaidCode } = useMermaid(rawNodes, rawEdges);
      const mermaidCode = generateMermaidCode();

      expect(mermaidCode).toBe('flowchart TB\n');
    });

    it('should generate mermaid code for graph with multiple edges', () => {
      const rawNodes = ref<NodeData[]>([
        { id: 'node-1', label: 'Node 1', type: 'custom' },
        { id: 'node-2', label: 'Node 2', type: 'custom' },
        { id: 'node-3', label: 'Node 3', type: 'custom' }
      ]);
      const rawEdges = ref<EdgeData[]>([
        { id: 'edge-1', source: 'node-1', target: 'node-2', type: 'smoothstep' },
        { id: 'edge-2', source: 'node-1', target: 'node-3', type: 'smoothstep' }
      ]);

      const { generateMermaidCode } = useMermaid(rawNodes, rawEdges);
      const mermaidCode = generateMermaidCode();

      expect(mermaidCode).toContain('node-1 --> node-2');
      expect(mermaidCode).toContain('node-1 --> node-3');
    });
  });
});
