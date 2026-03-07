import { describe, it, expect } from 'vitest';
import { dirIndexToString, stringToDirIndex, getRenderDirIndex, rotatePoint, LAYOUT_ROTATION } from '../../src/utils/direction';
import { DIR, DIR_MAP } from '../../src/types';

describe('direction utils', () => {
  describe('dirIndexToString', () => {
    it('should convert direction index to string', () => {
      expect(dirIndexToString(0)).toBe('bottom');
      expect(dirIndexToString(1)).toBe('left');
      expect(dirIndexToString(2)).toBe('top');
      expect(dirIndexToString(3)).toBe('right');
    });
  });

  describe('stringToDirIndex', () => {
    it('should convert direction string to index', () => {
      expect(stringToDirIndex('bottom')).toBe(0);
      expect(stringToDirIndex('left')).toBe(1);
      expect(stringToDirIndex('top')).toBe(2);
      expect(stringToDirIndex('right')).toBe(3);
    });
  });

  describe('getRenderDirIndex', () => {
    it('should get correct render direction index for TB layout', () => {
      expect(getRenderDirIndex(0, 'TB')).toBe(0); // BOTTOM -> BOTTOM
      expect(getRenderDirIndex(1, 'TB')).toBe(1); // LEFT -> LEFT
      expect(getRenderDirIndex(2, 'TB')).toBe(2); // TOP -> TOP
      expect(getRenderDirIndex(3, 'TB')).toBe(3); // RIGHT -> RIGHT
    });

    it('should get correct render direction index for LR layout', () => {
      expect(getRenderDirIndex(0, 'LR')).toBe(3); // BOTTOM -> RIGHT
      expect(getRenderDirIndex(1, 'LR')).toBe(0); // LEFT -> BOTTOM
      expect(getRenderDirIndex(2, 'LR')).toBe(1); // TOP -> LEFT
      expect(getRenderDirIndex(3, 'LR')).toBe(2); // RIGHT -> TOP
    });
  });

  describe('rotatePoint', () => {
    it('should rotate point for TB layout (no rotation)', () => {
      const result = rotatePoint(100, 100, 0, 0, 0);
      expect(result.x).toBe(100);
      expect(result.y).toBe(100);
    });

    it('should rotate point for LR layout (counter-clockwise 90 degrees)', () => {
      const result = rotatePoint(100, 100, 3, 0, 0);
      expect(result.x).toBe(100);
      expect(result.y).toBe(-100);
    });
  });

  describe('LAYOUT_ROTATION', () => {
    it('should have correct rotation values', () => {
      expect(LAYOUT_ROTATION.TB).toBe(0);
      expect(LAYOUT_ROTATION.RL).toBe(1);
      expect(LAYOUT_ROTATION.BT).toBe(2);
      expect(LAYOUT_ROTATION.LR).toBe(3);
    });
  });

  describe('DIR_MAP', () => {
    it('should have correct direction mappings', () => {
      expect(DIR_MAP[0]).toBe('bottom');
      expect(DIR_MAP[1]).toBe('left');
      expect(DIR_MAP[2]).toBe('top');
      expect(DIR_MAP[3]).toBe('right');
    });
  });

  describe('DIR', () => {
    it('should have correct direction constants', () => {
      expect(DIR.BOTTOM).toBe(0);
      expect(DIR.LEFT).toBe(1);
      expect(DIR.TOP).toBe(2);
      expect(DIR.RIGHT).toBe(3);
    });
  });
});
