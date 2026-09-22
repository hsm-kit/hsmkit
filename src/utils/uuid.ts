import CryptoJS from 'crypto-js';

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const GREGORIAN_EPOCH_OFFSET = 122192928000000000n;

let lastV1Timestamp = 0n;
const v1ClockSequence = randomBytes(2);
const v1Node = randomBytes(6);
v1Node[0] |= 0x01;

function randomBytes(length: number): Uint8Array {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return bytes;
}

function bytesToUuid(bytes: Uint8Array): string {
  const hex = Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

function uuidToBytes(uuid: string): Uint8Array {
  if (!UUID_PATTERN.test(uuid)) {
    throw new Error('Namespace must be a valid UUID');
  }

  const hex = uuid.replace(/-/g, '');
  return Uint8Array.from({ length: 16 }, (_, index) => parseInt(hex.slice(index * 2, index * 2 + 2), 16));
}

function nameBasedUuid(namespace: string, name: string, version: 3 | 5): string {
  const namespaceBytes = uuidToBytes(namespace);
  const nameBytes = new TextEncoder().encode(name);
  const inputHex = [...namespaceBytes, ...nameBytes]
    .map(byte => byte.toString(16).padStart(2, '0'))
    .join('');
  const input = CryptoJS.enc.Hex.parse(inputHex);
  const digest = version === 3 ? CryptoJS.MD5(input) : CryptoJS.SHA1(input);
  const bytes = Uint8Array.from(
    digest.toString(CryptoJS.enc.Hex).slice(0, 32).match(/.{2}/g)!.map(byte => parseInt(byte, 16))
  );

  bytes[6] = (bytes[6] & 0x0f) | (version << 4);
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  return bytesToUuid(bytes);
}

export function generateUuidV1(now = Date.now()): string {
  let timestamp = BigInt(now) * 10000n + GREGORIAN_EPOCH_OFFSET;
  if (timestamp <= lastV1Timestamp) {
    timestamp = lastV1Timestamp + 1n;
  }
  lastV1Timestamp = timestamp;

  const timeLow = Number(timestamp & 0xffffffffn);
  const timeMid = Number((timestamp >> 32n) & 0xffffn);
  const timeHigh = Number((timestamp >> 48n) & 0x0fffn) | 0x1000;
  const clockSequence = ((v1ClockSequence[0] << 8) | v1ClockSequence[1]) & 0x3fff;

  const bytes = new Uint8Array(16);
  bytes[0] = timeLow >>> 24;
  bytes[1] = timeLow >>> 16;
  bytes[2] = timeLow >>> 8;
  bytes[3] = timeLow;
  bytes[4] = timeMid >>> 8;
  bytes[5] = timeMid;
  bytes[6] = timeHigh >>> 8;
  bytes[7] = timeHigh;
  bytes[8] = (clockSequence >>> 8) | 0x80;
  bytes[9] = clockSequence;
  bytes.set(v1Node, 10);
  return bytesToUuid(bytes);
}

export function generateUuidV3(namespace: string, name: string): string {
  return nameBasedUuid(namespace, name, 3);
}

export function generateUuidV4(): string {
  const bytes = randomBytes(16);
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  return bytesToUuid(bytes);
}

export function generateUuidV5(namespace: string, name: string): string {
  return nameBasedUuid(namespace, name, 5);
}