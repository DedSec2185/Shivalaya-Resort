import { createContext, useContext, useState, useEffect, type FC, type ReactNode } from 'react'
import { translations, type Language, type TranslationDict } from './translations'

interface LanguageContextType {
  lang: Language
  setLang: (lang: Language) => void
  toggleLang: () => void
  t: (key: keyof TranslationDict) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

const STORAGE_KEY = 'panache_kitchen_lang'

export const LanguageProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<Language>(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    return (saved === 'hi' || saved === 'en') ? saved : 'en'
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, lang)
    // Add language attribute to document
    document.documentElement.lang = lang
  }, [lang])

  const setLang = (newLang: Language) => {
    setLangState(newLang)
  }

  const toggleLang = () => {
    setLangState(prev => (prev === 'en' ? 'hi' : 'en'))
  }

  const t = (key: keyof TranslationDict): string => {
    return translations[lang][key] || translations.en[key] || key
  }

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLang, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}
