import fs from 'node:fs';
import path from 'node:path';
import CryptoJS from 'crypto-js';
import { describe, expect, it } from 'vitest';

interface AesVector {
  id: string;
  algorithm: 'AES-128' | 'AES-192' | 'AES-256';
  mode: 'ECB' | 'CBC';
  padding: 'NONE';
  keyHex: string;
  ivHex?: string;
  plaintextHex: string;
  ciphertextHex: string;
}

const dataset = JSON.parse(
  fs.readFileSync(path.join(process.cwd(), 'public/test-vectors/aes.json'), 'utf8'),
) as { vectors: AesVector[] };

const encryptCryptoJs = (vector: AesVector): string => {
  const options = {
    mode: vector.mode === 'CBC' ? CryptoJS.mode.CBC : CryptoJS.mode.ECB,
    padding: CryptoJS.pad.NoPadding,
    ...(vector.ivHex ? { iv: CryptoJS.enc.Hex.parse(vector.ivHex) } : {}),
  };
  return CryptoJS.AES.encrypt(
    CryptoJS.enc.Hex.parse(vector.plaintextHex),
    CryptoJS.enc.Hex.parse(vector.keyHex),
    options,
  ).ciphertext.toString().toUpperCase();
};

describe('published AES known-answer validation set', () => {
  it.each(dataset.vectors)('reproduces $id with CryptoJS', vector => {
    expect(encryptCryptoJs(vector)).toBe(vector.ciphertextHex);
  });

  it('reproduces the CBC vector with Web Crypto', async () => {
    const vector = dataset.vectors.find(item => item.mode === 'CBC');
    expect(vector).toBeDefined();
    const key = await crypto.subtle.importKey(
      'raw',
      Uint8Array.from(Buffer.from(vector!.keyHex, 'hex')),
      'AES-CBC',
      false,
      ['encrypt'],
    );
    const ciphertext = await crypto.subtle.encrypt(
      { name: 'AES-CBC', iv: Uint8Array.from(Buffer.from(vector!.ivHex!, 'hex')) },
      key,
      Uint8Array.from(Buffer.from(vector!.plaintextHex, 'hex')),
    );
    const webCryptoHex = Buffer.from(ciphertext).toString('hex').toUpperCase();
    expect(webCryptoHex.slice(0, vector!.ciphertextHex.length)).toBe(vector!.ciphertextHex);
    expect(webCryptoHex.length).toBe(vector!.ciphertextHex.length + 32);
  });
});