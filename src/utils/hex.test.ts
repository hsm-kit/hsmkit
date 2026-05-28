import { describe, it, expect } from 'vitest'
import {
  cleanHex,
  isValidHexChars,
  isValidHex,
  isValidCleanHex,
  getLengthColor,
} from './hex'

describe('hex utilities', () => {
  describe('cleanHex', () => {
    it('removes whitespace and converts to uppercase', () => {
      expect(cleanHex('ab cd ef')).toBe('ABCDEF')
      expect(cleanHex('ab\ncd\ref')).toBe('ABCDEF')
      expect(cleanHex('  AB  CD  ')).toBe('ABCD')
    })

    it('handles empty string', () => {
      expect(cleanHex('')).toBe('')
    })

    it('handles already clean hex', () => {
      expect(cleanHex('ABCDEF')).toBe('ABCDEF')
    })
  })

  describe('isValidHexChars', () => {
    it('validates hex characters', () => {
      expect(isValidHexChars('0123456789ABCDEF')).toBe(true)
      expect(isValidHexChars('0123456789abcdef')).toBe(true)
      expect(isValidHexChars('')).toBe(true)
    })

    it('rejects non-hex characters', () => {
      expect(isValidHexChars('XYZ')).toBe(false)
      expect(isValidHexChars('123G')).toBe(false)
      expect(isValidHexChars('hello')).toBe(false)
    })
  })

  describe('isValidHex', () => {
    it('validates hex with even length', () => {
      expect(isValidHex('ABCD')).toBe(true)
      expect(isValidHex('0123456789ABCDEF')).toBe(true)
      expect(isValidHex('')).toBe(true)
    })

    it('rejects odd length hex', () => {
      expect(isValidHex('ABC')).toBe(false)
      expect(isValidHex('A')).toBe(false)
    })

    it('rejects non-hex characters', () => {
      expect(isValidHex('XYZW')).toBe(false)
    })
  })

  describe('isValidCleanHex', () => {
    it('validates and cleans hex input', () => {
      expect(isValidCleanHex('AB CD')).toBe(true)
      expect(isValidCleanHex('ab cd ef')).toBe(true)
    })

    it('rejects invalid input', () => {
      expect(isValidCleanHex('XYZ')).toBe(false)
      expect(isValidCleanHex('ABC')).toBe(false)
    })
  })

  describe('getLengthColor', () => {
    it('returns grey for disabled or zero length', () => {
      expect(getLengthColor(0, 16)).toBe('#999')
      expect(getLengthColor(10, 16, true)).toBe('#999')
    })

    it('returns green for matching length', () => {
      expect(getLengthColor(16, 16)).toBe('#52c41a')
    })

    it('returns red for non-matching length', () => {
      expect(getLengthColor(10, 16)).toBe('#ff4d4f')
    })

    it('handles array of expected lengths', () => {
      expect(getLengthColor(16, [16, 24, 32])).toBe('#52c41a')
      expect(getLengthColor(24, [16, 24, 32])).toBe('#52c41a')
      expect(getLengthColor(10, [16, 24, 32])).toBe('#ff4d4f')
    })
  })
})
