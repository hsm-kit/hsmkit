import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import aiTools from './ai-tools.json';
import { toolDirectory } from './toolRelations';

const root = process.cwd();
const read = (file: string) => fs.readFileSync(path.join(root, file), 'utf8');

describe('AI and search discovery artifacts', () => {
  it('keeps the public tool catalog aligned with application routes', () => {
    const publicCatalog = JSON.parse(read('public/ai/tools.json'));
    expect(publicCatalog.tools).toHaveLength(44);
    expect(aiTools.map(tool => [tool.id, tool.path])).toEqual(
      toolDirectory.map(tool => [tool.seoKey, tool.path]),
    );
  });

  it('publishes real discovery and error documents', () => {
    expect(read('public/llms.txt')).toMatch(/^# HSM Kit/m);
    expect(read('public/llms.txt')).toContain('https://hsmkit.com/ai/tools.json');
    expect(read('public/404.html')).toContain('noindex, nofollow');
    expect(read('public/55bc76b3ce475067e11cca8d69e2edd4.txt').trim()).toBe('55bc76b3ce475067e11cca8d69e2edd4');
  });
});