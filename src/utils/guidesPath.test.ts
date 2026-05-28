import { describe, it, expect } from 'vitest'
import { getGuidesPath, parseGuidesLanguage, isGuidesPage, getGuidesSlug } from './guidesPath'

describe('guidesPath utilities', () => {
  describe('getGuidesPath', () => {
    it('returns English path for en language', () => {
      expect(getGuidesPath('en')).toBe('/guides')
      expect(getGuidesPath('en', 'aes-encryption')).toBe('/guides/aes-encryption')
    })

    it('returns localized path for non-English languages', () => {
      expect(getGuidesPath('zh')).toBe('/zh/guides')
      expect(getGuidesPath('ja')).toBe('/ja/guides')
      expect(getGuidesPath('ko')).toBe('/ko/guides')
      expect(getGuidesPath('de')).toBe('/de/guides')
      expect(getGuidesPath('fr')).toBe('/fr/guides')
    })

    it('includes slug when provided', () => {
      expect(getGuidesPath('zh', 'aes-encryption')).toBe('/zh/guides/aes-encryption')
      expect(getGuidesPath('ja', 'rsa-encryption')).toBe('/ja/guides/rsa-encryption')
    })
  })

  describe('parseGuidesLanguage', () => {
    it('parses language from localized paths', () => {
      expect(parseGuidesLanguage('/zh/guides')).toBe('zh')
      expect(parseGuidesLanguage('/ja/guides/some-slug')).toBe('ja')
      expect(parseGuidesLanguage('/ko/guides')).toBe('ko')
      expect(parseGuidesLanguage('/de/guides')).toBe('de')
      expect(parseGuidesLanguage('/fr/guides')).toBe('fr')
    })

    it('returns en for English paths', () => {
      expect(parseGuidesLanguage('/guides')).toBe('en')
      expect(parseGuidesLanguage('/guides/some-slug')).toBe('en')
    })

    it('returns null for non-guides paths', () => {
      expect(parseGuidesLanguage('/')).toBeNull()
      expect(parseGuidesLanguage('/aes-encryption')).toBeNull()
      expect(parseGuidesLanguage('/about')).toBeNull()
    })
  })

  describe('isGuidesPage', () => {
    it('returns true for guides pages', () => {
      expect(isGuidesPage('/guides')).toBe(true)
      expect(isGuidesPage('/guides/some-slug')).toBe(true)
      expect(isGuidesPage('/zh/guides')).toBe(true)
      expect(isGuidesPage('/ja/guides/some-slug')).toBe(true)
    })

    it('returns false for non-guides pages', () => {
      expect(isGuidesPage('/')).toBe(false)
      expect(isGuidesPage('/aes-encryption')).toBe(false)
      expect(isGuidesPage('/about')).toBe(false)
    })
  })

  describe('getGuidesSlug', () => {
    it('extracts slug from English paths', () => {
      expect(getGuidesSlug('/guides')).toBeNull()
      expect(getGuidesSlug('/guides/aes-encryption')).toBe('aes-encryption')
      expect(getGuidesSlug('/guides/rsa-encryption')).toBe('rsa-encryption')
    })

    it('extracts slug from localized paths', () => {
      expect(getGuidesSlug('/zh/guides')).toBeNull()
      expect(getGuidesSlug('/zh/guides/aes-encryption')).toBe('aes-encryption')
      expect(getGuidesSlug('/ja/guides/rsa-encryption')).toBe('rsa-encryption')
    })

    it('returns null for non-guides paths', () => {
      expect(getGuidesSlug('/')).toBeNull()
      expect(getGuidesSlug('/aes-encryption')).toBeNull()
    })
  })
})
