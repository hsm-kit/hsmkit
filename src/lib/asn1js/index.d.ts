// Type definitions for vendored asn1js library

export class Stream {
  constructor(enc: Stream | number[] | string, pos?: number);
  get(pos?: number): number;
  hexByte(b: number): string;
  hexDump(start: number, end: number, raw: boolean): string;
  isASCII(start: number, end: number): boolean;
  parseStringISO(start: number, end: number): string;
  parseStringT61(start: number, end: number): string;
  parseStringUTF(start: number, end: number): string;
  parseStringBMP(start: number, end: number): string;
  enc: number[] | string;
  pos: number;
  getRaw: (pos: number) => number;
}

export class ASN1 {
  constructor(stream: Stream, header: number, length: number, tag: ASN1Tag, tagLen: number, sub: ASN1[] | null);
  typeName(): string;
  content(maxLength?: number): string | ASN1[] | null;
  toString(): string;
  toPrettyString(indent?: string): string;
  toDOM(doc?: Document): DocumentFragment;
  decode(): void;
  static decode(stream: Stream | number[], start?: number): ASN1;
  static decodeDer(stream: Stream | number[], start?: number): ASN1;
  stream: Stream;
  header: number;
  length: number;
  tag: ASN1Tag;
  tagLen: number;
  sub: ASN1[] | null;
}

export class ASN1Tag {
  constructor(stream: Stream);
  isEOC(): boolean;
  isUniversal(): boolean;
  isApplication(): boolean;
  isContext(): boolean;
  isPrivate(): boolean;
  isConstructed(): boolean;
  isPrimitive(): boolean;
  tagClass: number;
  tagConstructed: boolean;
  tagNumber: number;
  stream: Stream;
}

export function pemToDer(pem: string): Stream;
export function derToPem(der: Stream | number[]): string;

export const rawDecode: typeof ASN1.decode;
export const rawDer: typeof ASN1.decodeDer;
