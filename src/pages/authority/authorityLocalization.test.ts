import { describe, expect, it } from 'vitest';
import de from '../../locales/de';
import en from '../../locales/en';
import fr from '../../locales/fr';
import ja from '../../locales/ja';
import ko from '../../locales/ko';
import zh from '../../locales/zh';
import type { Language } from '../../locales';
import { aboutContent, editorialContent, teamContent } from './authorityContent';

const languages: Language[] = ['en', 'zh', 'ja', 'ko', 'de', 'fr'];
const localeBundles = { en, zh, ja, ko, de, fr };

describe('authority and legal localization', () => {
  it('provides complete authority pages in every supported language', () => {
    for (const content of [aboutContent, editorialContent, teamContent]) {
      for (const language of languages) {
        const page = content[language];
        const minimumParagraphLength = ['zh', 'ja', 'ko'].includes(language) ? 20 : 40;
        expect(page.title.length, `${language} title`).toBeGreaterThan(3);
        expect(page.description.length, `${language} description`).toBeGreaterThan(30);
        expect(page.sections.length, `${language} sections`).toBeGreaterThanOrEqual(5);
        page.sections.forEach(section => {
          expect(
            section.paragraphs.join('').length,
            `${language}.${section.id} paragraph length`,
          ).toBeGreaterThan(minimumParagraphLength);
        });
        if (language !== 'en') {
          expect(page.title).not.toBe(content.en.title);
          expect(page.sections[0].paragraphs[0]).not.toBe(content.en.sections[0].paragraphs[0]);
        }
      }
    }
  });

  it('keeps footer authority labels localized', () => {
    for (const language of languages) {
      const footer = localeBundles[language].footer;
      expect(footer.about).toBeTruthy();
      expect(footer.editorialPolicy).toBeTruthy();
      expect(footer.editorialTeam).toBeTruthy();
      if (language !== 'en') {
        expect(footer.about).not.toBe(en.footer.about);
        expect(footer.editorialPolicy).not.toBe(en.footer.editorialPolicy);
      }
    }
  });

  it('provides localized legal-page titles and body content', () => {
    for (const language of languages) {
      const bundle = localeBundles[language];
      for (const pageKey of ['privacyPolicy', 'termsOfService', 'disclaimer'] as const) {
        const page = bundle[pageKey];
        expect(page.title.length, `${language}.${pageKey}.title`).toBeGreaterThan(3);
        if (language !== 'en') {
          expect(page.title).not.toBe(en[pageKey].title);
        }
      }
      expect(bundle.privacyPolicy.introContent.length).toBeGreaterThan(50);
      expect(bundle.termsOfService.acceptanceContent.length).toBeGreaterThan(50);
      expect(bundle.disclaimer.generalContent.length).toBeGreaterThan(50);
    }
  });
});
