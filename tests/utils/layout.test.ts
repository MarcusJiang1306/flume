import { describe, it, expect } from 'vitest';
import { createDagreGraph, computeBounds, CANVAS_CONFIG, DEFAULT_NODE_INFO } from '../../src/utils/layout';
import * as dagre from 'dagre';
import type { NodeData, EdgeData } from '../../src/types';

describe('layout utils', () => {
  describe('createDagreGraph', () => {
    it('should create a dagre graph with nodes and edges', () => {
      const nodes: NodeData[] = [
        { id: 'node-1', label: 'Node 1', type: 'custom' },
        { id: 'node-2', label: 'Node 2', type: 'custom' }
      ];
      const edges: EdgeData[] = [
        { id: 'edge-1', source: 'node-1', target: 'node-2', type: 'smoothstep' }
      ];
      const direction = 'TB';

      const graph = createDagreGraph(nodes, edges, direction);
      expect(graph).toBeInstanceOf(dagre.graphlib.Graph);
      expect(graph.node('node-1')).toBeDefined();
      expect(graph.node('node-2')).toBeDefined();
    });
  });

  describe('computeBounds', () => {
    it('should compute correct bounds for multiple nodes', () => {
      const nodes = [
        { id: 'node-1', label: 'Node 1', type: 'custom' },
        { id: 'node-2', label: 'Node 2', type: 'custom' }
      ];
      const graph = new dagre.graphlib.Graph();
      graph.setNode('node-1', { x: 0, y: 0, width: 100, height: 50 });
      graph.setNode('node-2', { x: 200, y: 100, width: 100, height: 50 });

      const bounds = computeBounds(graph, nodes);
      expect(bounds.minX).toBe(-50); // 0 - 100/2
      expect(bounds.maxX).toBe(250); // 200 + 100/2
      expect(bounds.minY).toBe(-25); // 0 - 50/2
      expect(bounds.maxY).toBe(125); // 100 + 50/2
    });

    it('should compute correct bounds for single node', () => {
      const nodes = [
        { id: 'node-1', label: 'Node 1', type: 'custom' }
      ];
      const graph = new dagre.graphlib.Graph();
      graph.setNode('node-1', { x: 100, y: 100, width: 100, height: 50 });

      const bounds = computeBounds(graph, nodes);
      expect(bounds.minX).toBe(50); // 100 - 100/2
      expect(bounds.maxX).toBe(150); // 100 + 100/2
      expect(bounds.minY).toBe(75); // 100 - 50/2
      expect(bounds.maxY).toBe(125); // 100 + 50/2
    });
  });

  describe('CANVAS_CONFIG', () => {
    it('should have correct canvas configuration', () => {
      expect(CANVAS_CONFIG.rootTargetX).toBe(267);
      expect(CANVAS_CONFIG.rootTargetY).toBe(100);
      expect(CANVAS_CONFIG.nodeWidth).toBe(120);
      expect(CANVAS_CONFIG.nodeHeight).toBe(60);
      expect(CANVAS_CONFIG.margin).toBe(40);
      expect(CANVAS_CONFIG.edgesep).toBe(35);
    });
  });

  describe('DEFAULT_NODE_INFO', () => {
    it('should have correct default node info', () => {
      expect(DEFAULT_NODE_INFO.x).toBe(60); // 120/2
      expect(DEFAULT_NODE_INFO.y).toBe(30); // 60/2
      expect(DEFAULT_NODE_INFO.width).toBe(120);
      expect(DEFAULT_NODE_INFO.height).toBe(60);
    });
  });
});
