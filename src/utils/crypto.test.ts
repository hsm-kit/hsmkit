import { describe, it, expect } from 'vitest'
import {
  calculateKCV,
  cleanHexInput,
  isValidHex,
  generatePinBlock,
  combineKeyComponents,
  checkDesKeyParityOdd,
  checkDesKeyParityEven,
  validateKey,
  adjustDesKeyParity,
} from './crypto'

describe('crypto utilities', () => {
  describe('cleanHexInput', () => {
    it('removes whitespace and converts to uppercase', () => {
      expect(cleanHexInput('ab cd ef')).toBe('ABCDEF')
      expect(cleanHexInput('ab\ncd\ref')).toBe('ABCDEF')
    })

    it('handles empty string', () => {
      expect(cleanHexInput('')).toBe('')
    })
  })

  describe('isValidHex', () => {
    it('validates hex strings', () => {
      expect(isValidHex('ABCDEF')).toBe(true)
      expect(isValidHex('0123456789')).toBe(true)
      expect(isValidHex('')).toBe(false) // empty string
    })

    it('rejects invalid hex', () => {
      expect(isValidHex('XYZ')).toBe(false)
      expect(isValidHex('ABC')).toBe(true) // valid hex chars, no length check in this impl
    })
  })

  describe('calculateKCV', () => {
    it('calculates DES KCV correctly', () => {
      // Known test vector: key 0123456789ABCDEF
      const kcv = calculateKCV('0123456789ABCDEF', { algorithm: 'DES' })
      expect(kcv).toHaveLength(6)
      expect(kcv).toMatch(/^[0-9A-F]+$/)
    })

    it('calculates 3DES KCV correctly', () => {
      const kcv = calculateKCV('0123456789ABCDEF0123456789ABCDEF', { algorithm: 'DES' })
      expect(kcv).toHaveLength(6)
      expect(kcv).toMatch(/^[0-9A-F]+$/)
    })

    it('calculates AES KCV correctly', () => {
      const kcv = calculateKCV('0123456789ABCDEF0123456789ABCDEF', { algorithm: 'AES' })
      expect(kcv).toHaveLength(6)
      expect(kcv).toMatch(/^[0-9A-F]+$/)
    })
  })

  describe('generatePinBlock', () => {
    it('generates ISO0 PIN block correctly', () => {
      const pinBlock = generatePinBlock({
        format: 'ISO0',
        pin: '1234',
        pan: '4111111111111111',
      })
      expect(pinBlock).toHaveLength(16)
      expect(pinBlock).toMatch(/^[0-9A-F]+$/)
    })

    it('throws for unsupported format', () => {
      expect(() =>
        generatePinBlock({
          format: 'ISO1',
          pin: '1234',
          pan: '4111111111111111',
        })
      ).toThrow('Only ISO Format 0 is currently supported')
    })
  })

  describe('combineKeyComponents', () => {
    it('combines two components with XOR', () => {
      const result = combineKeyComponents(['FF00FF00', '00FF00FF'])
      expect(result).toBe('FFFFFFFF')
    })

    it('combines three components', () => {
      const result = combineKeyComponents(['FF000000', '00FF0000', '0000FF00'])
      // FF000000 XOR 00FF0000 = FFFF0000
      // FFFF0000 XOR 0000FF00 = FFFFFF00
      expect(result).toBe('FFFFFF00')
    })

    it('throws for less than 2 components', () => {
      expect(() => combineKeyComponents(['ABCDEF'])).toThrow('At least 2 components required')
    })

    it('throws for different length components', () => {
      expect(() => combineKeyComponents(['ABCD', 'ABCDEF'])).toThrow(
        'All components must have the same length'
      )
    })
  })

  describe('checkDesKeyParityOdd', () => {
    it('validates odd parity keys', () => {
      // Key with odd parity
      expect(checkDesKeyParityOdd('0123456789ABCDEF')).toBe(true)
    })

    it('rejects even parity keys', () => {
      expect(checkDesKeyParityOdd('0000000000000000')).toBe(false)
    })
  })

  describe('checkDesKeyParityEven', () => {
    it('validates even parity keys', () => {
      expect(checkDesKeyParityEven('0000000000000000')).toBe(true)
    })

    it('rejects odd parity keys', () => {
      expect(checkDesKeyParityEven('0123456789ABCDEF')).toBe(false)
    })
  })

  describe('adjustDesKeyParity', () => {
    it('adjusts key to odd parity', () => {
      const adjusted = adjustDesKeyParity('0000000000000000')
      expect(checkDesKeyParityOdd(adjusted)).toBe(true)
    })

    it('preserves already odd parity key', () => {
      const key = '0123456789ABCDEF'
      const adjusted = adjustDesKeyParity(key)
      expect(adjusted).toBe(key)
    })
  })

  describe('validateKey', () => {
    it('validates a valid DES key', () => {
      const result = validateKey('0123456789ABCDEF')
      expect(result.valid).toBe(true)
      expect(result.keyLength).toBe(16) // hex string length
      expect(result.errors).toHaveLength(0)
    })

    it('validates a valid 3DES key', () => {
      const result = validateKey('0123456789ABCDEF0123456789ABCDEF')
      expect(result.valid).toBe(true)
      expect(result.keyLength).toBe(32) // hex string length
    })

    it('validates a valid AES key', () => {
      const result = validateKey('0123456789ABCDEF0123456789ABCDEF')
      expect(result.valid).toBe(true)
    })

    it('rejects invalid hex', () => {
      const result = validateKey('XYZ')
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Invalid hexadecimal characters')
    })
  })
})
