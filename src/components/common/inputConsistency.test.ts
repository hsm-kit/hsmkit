import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const componentsRoot = path.resolve(process.cwd(), 'src/components');
const toolDirectories = ['cipher', 'generic', 'keys', 'payment', 'pki'];

const toolSources = toolDirectories.flatMap(directory => {
  const directoryPath = path.join(componentsRoot, directory);
  return fs.readdirSync(directoryPath)
    .filter(file => file.endsWith('.tsx'))
    .map(file => ({
      file: `${directory}/${file}`,
      source: fs.readFileSync(path.join(directoryPath, file), 'utf8'),
    }));
});

const findFiles = (pattern: RegExp) => toolSources
  .filter(({ source }) => pattern.test(source))
  .map(({ file }) => file);

describe('tool input consistency', () => {
  it('does not render length indicators inside input suffixes', () => {
    expect(findFiles(/suffix=\{(?:lengthIndicator|<LengthIndicator)/)).toEqual([]);
  });

  it('does not render input lengths as unconditional success', () => {
    expect(findFiles(/type=["']success["'][^>]*>\s*\[\{/)).toEqual([]);
    expect(findFiles(/color:\s*["']#52c41a["'][^}]*}\s*>\s*\[\{/)).toEqual([]);
  });

  it('does not substitute expected lengths for empty values', () => {
    expect(findFiles(/\[\{[^}\n]+\|\|\s*(?:8|16|20|24|32|48|64)\s*}\]/)).toEqual([]);
  });

  it('keeps sensitive example values out of initial state', () => {
    const expectedEmptyInitializers = [
      ['cipher/CipherTool.tsx', "const [iv, setIv] = useState('');"],
      ['cipher/DESTool.tsx', "const [iv, setIv] = useState('');"],
      ['keys/ThalesKeyBlockTool.tsx', "const [desKbpk, setDesKbpk] = useState('');"],
      ['keys/ThalesKeyBlockTool.tsx', "const [aesKbpk, setAesKbpk] = useState('');"],
      ['payment/PinPVVTool.tsx', "const [pdkPVV, setPdkPVV] = useState('');"],
      ['payment/PinPVVTool.tsx', "const [panPVV, setPanPVV] = useState('');"],
      ['payment/PinPVVTool.tsx', "const [pinPVV, setPinPVV] = useState('');"],
    ] as const;

    expectedEmptyInitializers.forEach(([file, initializer]) => {
      const source = toolSources.find(entry => entry.file === file)?.source;
      expect(source, file).toContain(initializer);
    });
  });
});
