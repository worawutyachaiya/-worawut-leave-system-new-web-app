
import React, { createContext, useContext, useCallback, useMemo, useEffect } from 'react'

import { useNavigate, useLocation } from 'react-router'

import { getDictionary } from '@/utils/getDictionary'
import { i18n, type Locale } from '@configs/i18n'

type Dictionary = ReturnType<typeof getDictionary>

interface TranslationContextType {
  dictionary: Dictionary
  t: (key: string, fallback?: string) => string
  locale: Locale
  setLocale: (locale: Locale) => void
  availableLocales: readonly Locale[]
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined)

const LOCALE_STORAGE_KEY = 'app-locale'

const getNestedValue = (obj: Record<string, any>, path: string): string | undefined => {
  const keys = path.split('.')
  let result: any = obj

  for (const key of keys) {
    if (result && typeof result === 'object' && key in result) {
      result = result[key]
    } else {
      return undefined
    }
  }

  return typeof result === 'string' ? result : undefined
}

interface TranslationProviderProps {
  children: React.ReactNode
}

export const TranslationProvider: React.FC<TranslationProviderProps> = ({
  children
}) => {
  const navigate = useNavigate()
  const location = useLocation()


  const pathSegments = location.pathname.split('/')
  const urlLocale = pathSegments[1] as Locale


  const locale = i18n.locales.includes(urlLocale) ? urlLocale : (i18n.defaultLocale as Locale)


  const dictionary = useMemo(() => getDictionary(locale), [locale])

  const setLocale = useCallback((newLocale: Locale) => {
    if (!i18n.locales.includes(newLocale)) return

    if (typeof window !== 'undefined') {
        localStorage.setItem(LOCALE_STORAGE_KEY, newLocale)
    }

    const currentPathSegments = location.pathname.split('/')


    if (currentPathSegments.length > 1) {
        currentPathSegments[1] = newLocale
    } else {
        currentPathSegments.splice(1, 0, newLocale)
    }

    const newPath = currentPathSegments.join('/')


    navigate(newPath + location.search)

  }, [location, navigate])

  const t = useCallback((key: string, fallback?: string): string => {
    if (!dictionary) {
      return fallback ?? key
    }
    const translation = getNestedValue(dictionary as Record<string, any>, key)
    return translation ?? fallback ?? key
  }, [dictionary])

  const value = useMemo(() => ({
    dictionary,
    t,
    locale,
    setLocale,
    availableLocales: i18n.locales
  }), [dictionary, t, locale, setLocale])

  return (
    <TranslationContext.Provider value={value}>
      {children}
    </TranslationContext.Provider>
  )
}

export const useTranslation = (): TranslationContextType => {
  const context = useContext(TranslationContext)
  if (context === undefined) {
    return {
      dictionary: {} as Dictionary,
      t: (key: string, fallback?: string) => fallback ?? key,
      locale: i18n.defaultLocale as Locale,
      setLocale: () => {},
      availableLocales: i18n.locales
    }
  }
  return context
}

export default TranslationContext
