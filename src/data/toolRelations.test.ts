import { describe, expect, it } from 'vitest';
import { getRelatedTools, getToolByPath, toolDirectory } from './toolRelations';

describe('tool relations', () => {
  it('contains all 44 unique tool routes and keys', () => {
    expect(toolDirectory).toHaveLength(44);
    expect(new Set(toolDirectory.map(tool => tool.path))).toHaveLength(44);
    expect(new Set(toolDirectory.map(tool => tool.seoKey))).toHaveLength(44);
  });

  it('looks up every tool by path', () => {
    toolDirectory.forEach(tool => {
      expect(getToolByPath(tool.path)).toEqual(tool);
    });
  });

  it('returns valid non-self workflow recommendations', () => {
    toolDirectory.forEach(tool => {
      const related = getRelatedTools(tool.seoKey);
      expect(related.length).toBeGreaterThan(0);
      expect(related.length).toBeLessThanOrEqual(3);
      expect(related.every(candidate => candidate.seoKey !== tool.seoKey)).toBe(true);
      expect(new Set(related.map(candidate => candidate.seoKey)).size).toBe(related.length);
    });
  });
});
