import { describe, expect, it } from 'vitest';
import { generateUuidV1, generateUuidV3, generateUuidV4, generateUuidV5 } from './uuid';

const DNS_NAMESPACE = '6ba7b810-9dad-11d1-80b4-00c04fd430c8';

describe('UUID utilities', () => {
  it('matches the RFC 9562 UUID v3 DNS vector', () => {
    expect(generateUuidV3(DNS_NAMESPACE, 'www.widgets.com')).toBe('3d813cbb-47fb-32ba-91df-831e1593ac29');
  });

  it('matches the RFC 9562 UUID v5 DNS vector', () => {
    expect(generateUuidV5(DNS_NAMESPACE, 'www.widgets.com')).toBe('21f7f8de-8051-5b89-8680-0195ef798b6a');
  });

  it.each([
    [generateUuidV1(), '1'],
    [generateUuidV4(), '4'],
  ])('sets version %s and the RFC variant', (uuid, version) => {
    expect(uuid[14]).toBe(version);
    expect(['8', '9', 'a', 'b']).toContain(uuid[19]);
  });

  it('rejects an invalid namespace', () => {
    expect(() => generateUuidV5('not-a-uuid', 'name')).toThrow('Namespace must be a valid UUID');
  });
});