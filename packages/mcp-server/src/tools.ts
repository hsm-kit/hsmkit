import {
  decodeBase64,
  encodeBase64,
  generateIso0PinBlock,
  luhnCalculateCheckDigit,
  luhnValidate,
  xorHex,
} from '@hsmkit/crypto-tools';

export interface ToolResult {
  result: string | boolean;
  documentationUrl: string;
  warning?: string;
}

const HSMKIT = 'https://hsmkit.com';

export const calculateLuhnCheckDigit = (payload: string): ToolResult => ({
  result: luhnCalculateCheckDigit(payload),
  documentationUrl: `${HSMKIT}/check-digits/`,
});

export const validateLuhn = (value: string): ToolResult => ({
  result: luhnValidate(value),
  documentationUrl: `${HSMKIT}/check-digits/`,
});

export const combineHexComponents = (components: string[]): ToolResult => ({
  result: xorHex(...components),
  documentationUrl: `${HSMKIT}/keyshare-generator/`,
  warning: 'Use synthetic test components only. Do not expose production keys to an AI client.',
});

export const createIso0PinBlock = (pin: string, pan: string): ToolResult => ({
  result: generateIso0PinBlock(pin, pan),
  documentationUrl: `${HSMKIT}/payments-pin-blocks-general/`,
  warning: 'Use synthetic test data only. Never provide a real PIN or live PAN to an AI client.',
});

export const encodeTextBase64 = (text: string): ToolResult => ({
  result: encodeBase64(text),
  documentationUrl: `${HSMKIT}/base64/`,
});

export const decodeTextBase64 = (base64: string): ToolResult => ({
  result: decodeBase64(base64),
  documentationUrl: `${HSMKIT}/base64/`,
});
