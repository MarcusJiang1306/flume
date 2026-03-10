import { describe, it, expect } from 'vitest';
import { useMermaid } from '../../src/composables/services/useMermaid';
import { ref } from 'vue';
import type { NodeData, EdgeData } from '../../src/types';
import { DIR, DEFAULT_HANDLES } from '../../src/utils/direction';

describe('useMermaid', () => {
  describe('useMermaid composable', () => {
    it('should return generateMermaidCode function', () => {
      const rawNodes = ref<NodeData[]>([]);
      const rawEdges = ref<EdgeData[]>([]);

      const mermaidService = useMermaid(rawNodes, rawEdges);
      expect(mermaidService).toBeDefined();
      expect(typeof mermaidService.generateMermaidCode).toBe('function');
    });
  });

  describe('generateMermaidCode', () => {
    it('should generate mermaid code for simple graph', () => {
      const rawNodes = ref<NodeData[]>([
        { id: 'node-1', label: 'Node 1', type: 'custom', handlePositions: DEFAULT_HANDLES },
        { id: 'node-2', label: 'Node 2', type: 'custom', handlePositions: DEFAULT_HANDLES }
      ]);
      const rawEdges = ref<EdgeData[]>([
        { id: 'edge-1', source: 'node-1', target: 'node-2', sourceHandle: DIR.BOTTOM, targetHandle: DIR.TOP, type: 'smoothstep' }
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
        { id: 'node-1', label: 'Node 1', type: 'custom', handlePositions: DEFAULT_HANDLES },
        { id: 'node-2', label: 'Node 2', type: 'custom', handlePositions: DEFAULT_HANDLES },
        { id: 'node-3', label: 'Node 3', type: 'custom', handlePositions: DEFAULT_HANDLES }
      ]);
      const rawEdges = ref<EdgeData[]>([
        { id: 'edge-1', source: 'node-1', target: 'node-2', sourceHandle: DIR.BOTTOM, targetHandle: DIR.TOP, type: 'smoothstep' },
        { id: 'edge-2', source: 'node-1', target: 'node-3', sourceHandle: DIR.BOTTOM, targetHandle: DIR.TOP, type: 'smoothstep' }
      ]);

      const { generateMermaidCode } = useMermaid(rawNodes, rawEdges);
      const mermaidCode = generateMermaidCode();

      expect(mermaidCode).toContain('node-1 --> node-2');
      expect(mermaidCode).toContain('node-1 --> node-3');
    });

    it('should handle nodes with special characters in labels', () => {
      const rawNodes = ref<NodeData[]>([
        { id: 'node-1', label: 'Node 1: Test', type: 'custom', handlePositions: DEFAULT_HANDLES },
        { id: 'node-2', label: 'Node 2 (Example)', type: 'custom', handlePositions: DEFAULT_HANDLES }
      ]);
      const rawEdges = ref<EdgeData[]>([
        { id: 'edge-1', source: 'node-1', target: 'node-2', sourceHandle: DIR.BOTTOM, targetHandle: DIR.TOP, type: 'smoothstep' }
      ]);

      const { generateMermaidCode } = useMermaid(rawNodes, rawEdges);
      const mermaidCode = generateMermaidCode();

      expect(mermaidCode).toContain('node-1["Node 1: Test"]');
      expect(mermaidCode).toContain('node-2["Node 2 (Example)"]');
      expect(mermaidCode).toContain('node-1 --> node-2');
    });

    it('should handle single node graph', () => {
      const rawNodes = ref<NodeData[]>([
        { id: 'node-1', label: 'Single Node', type: 'custom', handlePositions: DEFAULT_HANDLES }
      ]);
      const rawEdges = ref<EdgeData[]>([]);

      const { generateMermaidCode } = useMermaid(rawNodes, rawEdges);
      const mermaidCode = generateMermaidCode();

      expect(mermaidCode).toContain('flowchart TB');
      expect(mermaidCode).toContain('node-1["Single Node"]');
    });

    it('should generate code with correct syntax for multiple levels', () => {
      const rawNodes = ref<NodeData[]>([
        { id: 'node-1', label: 'Level 1', type: 'custom', handlePositions: DEFAULT_HANDLES },
        { id: 'node-2', label: 'Level 2', type: 'custom', handlePositions: DEFAULT_HANDLES },
        { id: 'node-3', label: 'Level 3', type: 'custom', handlePositions: DEFAULT_HANDLES }
      ]);
      const rawEdges = ref<EdgeData[]>([
        { id: 'edge-1', source: 'node-1', target: 'node-2', sourceHandle: DIR.BOTTOM, targetHandle: DIR.TOP, type: 'smoothstep' },
        { id: 'edge-2', source: 'node-2', target: 'node-3', sourceHandle: DIR.BOTTOM, targetHandle: DIR.TOP, type: 'smoothstep' }
      ]);

      const { generateMermaidCode } = useMermaid(rawNodes, rawEdges);
      const mermaidCode = generateMermaidCode();

      expect(mermaidCode).toContain('node-1["Level 1"]');
      expect(mermaidCode).toContain('node-2["Level 2"]');
      expect(mermaidCode).toContain('node-3["Level 3"]');
      expect(mermaidCode).toContain('node-1 --> node-2');
      expect(mermaidCode).toContain('node-2 --> node-3');
    });
  });
});
