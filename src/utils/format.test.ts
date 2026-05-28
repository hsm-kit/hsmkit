import { describe, it, expect } from 'vitest'
import { formatHexDisplay, sanitizeDigits } from './format'

describe('format utilities', () => {
  describe('formatHexDisplay', () => {
    it('formats hex with default group size of 4', () => {
      expect(formatHexDisplay('ABCDEF12')).toBe('ABCD EF12')
      expect(formatHexDisplay('0123456789')).toBe('0123 4567 89')
    })

    it('formats hex with custom group size', () => {
      expect(formatHexDisplay('ABCDEF', 2)).toBe('AB CD EF')
      expect(formatHexDisplay('ABCDEF', 3)).toBe('ABC DEF')
      expect(formatHexDisplay('ABCDEF', 6)).toBe('ABCDEF')
    })

    it('handles empty string', () => {
      expect(formatHexDisplay('')).toBe('')
    })

    it('handles string shorter than group size', () => {
      expect(formatHexDisplay('AB')).toBe('AB')
    })
  })

  describe('sanitizeDigits', () => {
    it('removes non-digit characters', () => {
      expect(sanitizeDigits('123abc456')).toBe('123456')
      expect(sanitizeDigits('abc')).toBe('')
      expect(sanitizeDigits('123-456-789')).toBe('123456789')
    })

    it('preserves digits', () => {
      expect(sanitizeDigits('1234567890')).toBe('1234567890')
    })

    it('handles empty string', () => {
      expect(sanitizeDigits('')).toBe('')
    })

    it('handles special characters', () => {
      expect(sanitizeDigits('!@#$%^&*()')).toBe('')
      expect(sanitizeDigits('123 456 789')).toBe('123456789')
    })
  })
})
