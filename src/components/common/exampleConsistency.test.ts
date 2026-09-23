import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';
import { describe, expect, it } from 'vitest';

const componentsRoot = path.resolve(process.cwd(), 'src/components');
const toolDirectories = ['cipher', 'generic', 'keys', 'payment', 'pki'];
const forbiddenContextSetters = /\bset(?:Mode|Algorithm|ActiveTab|Format|InputType|EncodeInputEncoding|KeyType|Version|UseTweak|UseCustomMfk)\s*\(/;

const sourceFiles = toolDirectories.flatMap(directory => {
  const directoryPath = path.join(componentsRoot, directory);
  return fs.readdirSync(directoryPath)
    .filter(file => file.endsWith('.tsx'))
    .map(file => path.join(directoryPath, file));
});

const getTagName = (node: ts.JsxOpeningLikeElement): string => node.tagName.getText();

const findContextSwitches = (): string[] => {
  const violations: string[] = [];

  sourceFiles.forEach(filePath => {
    const source = fs.readFileSync(filePath, 'utf8');
    const file = ts.createSourceFile(filePath, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);

    const visit = (node: ts.Node) => {
      if ((ts.isJsxSelfClosingElement(node) || ts.isJsxOpeningElement(node)) && getTagName(node) === 'ExampleButton') {
        const onClick = node.attributes.properties.find(property => (
          ts.isJsxAttribute(property) && property.name.getText() === 'onClick'
        ));
        if (onClick && ts.isJsxAttribute(onClick) && onClick.initializer) {
          const callback = onClick.initializer.getText(file);
          if (forbiddenContextSetters.test(callback)) {
            const line = file.getLineAndCharacterOfPosition(onClick.getStart(file)).line + 1;
            violations.push(`${path.relative(process.cwd(), filePath)}:${line}`);
          }
        }
      }
      ts.forEachChild(node, visit);
    };

    visit(file);
  });

  return violations;
};

describe('tool examples', () => {
  it('never change the selected mode, algorithm, format, tab, or enabling toggle', () => {
    expect(findContextSwitches()).toEqual([]);
  });
});
