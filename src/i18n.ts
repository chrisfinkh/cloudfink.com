import { createI18n } from 'vue-i18n'
import en from './locales/en.json'
import de from './locales/de.json'

export const SUPPORTED_LOCALES = [
  { code: 'en', name: 'English', country: 'gb' },
  { code: 'de', name: 'Deutsch', country: 'de' }
] as const

export type LocaleCode = (typeof SUPPORTED_LOCALES)[number]['code']

const savedLocale = localStorage.getItem('locale') as LocaleCode | null
const browserLocale = navigator.language.split('-')[0] as LocaleCode
const defaultLocale = SUPPORTED_LOCALES.some((l) => l.code === browserLocale) ? browserLocale : 'en'

export const i18n = createI18n({
  legacy: false,
  locale: savedLocale || defaultLocale,
  fallbackLocale: 'en',
  messages: {
    en,
    de
  }
})
