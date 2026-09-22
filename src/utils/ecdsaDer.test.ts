import { describe, expect, it } from 'vitest';
import { createEcdsaDerSignature, parseEcdsaDerSignature } from './ecdsaDer';

describe('ECDSA DER signatures', () => {
  it('round trips P-256 values', () => {
    const r = '7f'.repeat(32);
    const s = '80'.repeat(32);
    expect(parseEcdsaDerSignature(createEcdsaDerSignature(r, s))).toEqual({ r, s });
  });

  it('uses DER long-form lengths for P-521 signatures', () => {
    const r = '01' + '23'.repeat(65);
    const s = '01' + '45'.repeat(65);
    const der = createEcdsaDerSignature(r, s);
    expect(der.startsWith('3081')).toBe(true);
    expect(parseEcdsaDerSignature(der)).toEqual({ r, s });
  });

  it('rejects trailing data and non-minimal lengths', () => {
    expect(parseEcdsaDerSignature('300602010102010100')).toBeNull();
    expect(parseEcdsaDerSignature('308106020101020101')).toBeNull();
  });
});