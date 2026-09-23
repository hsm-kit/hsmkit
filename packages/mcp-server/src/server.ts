import { createRequire } from 'node:module';
import { McpServer } from '@modelcontextprotocol/server';
import * as z from 'zod/v4';
import {
  calculateLuhnCheckDigit,
  combineHexComponents,
  createIso0PinBlock,
  decodeTextBase64,
  encodeTextBase64,
  validateLuhn,
  type ToolResult,
} from './tools.js';

const { version } = createRequire(import.meta.url)('../package.json') as { version: string };

const response = (value: ToolResult) => ({
  content: [{ type: 'text' as const, text: JSON.stringify(value, null, 2) }],
  structuredContent: value,
});

const guarded = (handler: () => ToolResult) => {
  try {
    return response(handler());
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return {
      content: [{ type: 'text' as const, text: message }],
      isError: true,
    };
  }
};

export const createServer = (): McpServer => {
  const server = new McpServer({ name: 'hsmkit', version });

  server.registerTool('luhn_calculate_check_digit', {
    description: 'Calculate the Luhn (Mod 10) check digit for a digits-only payload.',
    inputSchema: z.object({ payload: z.string().regex(/^\d+$/).describe('Digits without the final check digit') }),
  }, ({ payload }) => guarded(() => calculateLuhnCheckDigit(payload)));

  server.registerTool('luhn_validate', {
    description: 'Validate a complete number using the Luhn (Mod 10) algorithm.',
    inputSchema: z.object({ value: z.string().regex(/^\d{2,}$/).describe('Complete digits including the check digit') }),
  }, ({ value }) => guarded(() => validateLuhn(value)));

  server.registerTool('xor_key_components', {
    description: 'XOR equal-length hexadecimal key components for synthetic interoperability tests.',
    inputSchema: z.object({
      components: z.array(z.string()).min(2).describe('Two or more equal-length hexadecimal values'),
    }),
  }, ({ components }) => guarded(() => combineHexComponents(components)));

  server.registerTool('iso0_pin_block', {
    description: 'Generate an ISO 9564-1 format 0 clear PIN block from synthetic PIN and PAN test data.',
    inputSchema: z.object({
      pin: z.string().regex(/^\d{4,12}$/).describe('Synthetic PIN containing 4 to 12 digits'),
      pan: z.string().regex(/^\d{13,19}$/).describe('Synthetic PAN containing 13 to 19 digits'),
    }),
  }, ({ pin, pan }) => guarded(() => createIso0PinBlock(pin, pan)));

  server.registerTool('base64_encode', {
    description: 'Encode UTF-8 text as standard Base64.',
    inputSchema: z.object({ text: z.string() }),
  }, ({ text }) => guarded(() => encodeTextBase64(text)));

  server.registerTool('base64_decode', {
    description: 'Decode standard Base64 into UTF-8 text.',
    inputSchema: z.object({ base64: z.string() }),
  }, ({ base64 }) => guarded(() => decodeTextBase64(base64)));

  return server;
};
