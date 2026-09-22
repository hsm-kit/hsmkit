function encodeLength(length: number): string {
  if (length < 0x80) return length.toString(16).padStart(2, '0');
  const hex = length.toString(16).padStart(Math.ceil(length.toString(16).length / 2) * 2, '0');
  return (0x80 | (hex.length / 2)).toString(16) + hex;
}

function decodeLength(hex: string, offset: number): { length: number; offset: number } | null {
  if (offset + 2 > hex.length) return null;
  const first = parseInt(hex.slice(offset, offset + 2), 16);
  if (first < 0x80) return { length: first, offset: offset + 2 };

  const byteCount = first & 0x7f;
  if (byteCount === 0 || byteCount > 4 || offset + 2 + byteCount * 2 > hex.length) return null;
  const length = parseInt(hex.slice(offset + 2, offset + 2 + byteCount * 2), 16);
  if (length < 0x80) return null;
  return { length, offset: offset + 2 + byteCount * 2 };
}

function encodeInteger(hex: string): string {
  let value = hex.replace(/^0+/, '') || '00';
  if (value.length % 2 !== 0) value = `0${value}`;
  if (parseInt(value.slice(0, 2), 16) >= 0x80) value = `00${value}`;
  return `02${encodeLength(value.length / 2)}${value}`;
}

export function createEcdsaDerSignature(r: string, s: string): string {
  const content = encodeInteger(r) + encodeInteger(s);
  return `30${encodeLength(content.length / 2)}${content}`;
}

export function parseEcdsaDerSignature(derHex: string): { r: string; s: string } | null {
  const hex = derHex.toLowerCase();
  if (!/^[0-9a-f]+$/.test(hex) || hex.length % 2 !== 0 || !hex.startsWith('30')) return null;

  const sequenceLength = decodeLength(hex, 2);
  if (!sequenceLength || sequenceLength.offset + sequenceLength.length * 2 !== hex.length) return null;
  let offset = sequenceLength.offset;

  const readInteger = (): string | null => {
    if (hex.slice(offset, offset + 2) !== '02') return null;
    const integerLength = decodeLength(hex, offset + 2);
    if (!integerLength) return null;
    offset = integerLength.offset;
    const end = offset + integerLength.length * 2;
    if (end > hex.length) return null;
    let value = hex.slice(offset, end);
    offset = end;
    if (!value || parseInt(value.slice(0, 2), 16) >= 0x80) return null;
    if (value.startsWith('00')) {
      if (value.length === 2 || parseInt(value.slice(2, 4), 16) < 0x80) return null;
      value = value.slice(2);
    }
    return value;
  };

  const r = readInteger();
  const s = readInteger();
  return r && s && offset === hex.length ? { r, s } : null;
}