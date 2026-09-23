import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Client } from '@modelcontextprotocol/client';
import { StdioClientTransport } from '@modelcontextprotocol/client/stdio';

const directory = path.dirname(fileURLToPath(import.meta.url));
const serverPath = path.resolve(directory, '../dist/cli.js');
const { version } = createRequire(import.meta.url)('../package.json');
const client = new Client({ name: 'hsmkit-e2e', version: '0.1.0' });
const transport = new StdioClientTransport({ command: process.execPath, args: [serverPath], stderr: 'pipe' });

try {
  await client.connect(transport);
  assert.equal(client.getServerVersion()?.version, version);
  const { tools } = await client.listTools();
  assert.deepEqual(tools.map(tool => tool.name).sort(), [
    'base64_decode',
    'base64_encode',
    'iso0_pin_block',
    'luhn_calculate_check_digit',
    'luhn_validate',
    'xor_key_components',
  ]);

  const luhn = await client.callTool({ name: 'luhn_calculate_check_digit', arguments: { payload: '7992739871' } });
  assert.equal(luhn.isError, undefined);
  assert.equal(luhn.structuredContent?.result, '3');

  const pinBlock = await client.callTool({ name: 'iso0_pin_block', arguments: { pin: '1234', pan: '4111111111111111' } });
  assert.equal(pinBlock.structuredContent?.result, '041225EEEEEEEEEE');
  assert.match(String(pinBlock.structuredContent?.warning), /real PIN/);

  const base64 = await client.callTool({ name: 'base64_encode', arguments: { text: 'HSM Kit' } });
  assert.equal(base64.structuredContent?.result, 'SFNNIEtpdA==');

  console.log(`MCP stdio e2e passed: ${tools.length} tools and 3 calls.`);
} finally {
  await transport.close();
}
