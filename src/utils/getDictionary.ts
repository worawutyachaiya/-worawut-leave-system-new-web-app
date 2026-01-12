// Third-party Imports
// import 'server-only'

// Type Imports
import type { Locale } from '@configs/i18n'

import en from '@_workspace/navigation/dictionaries/en.json'
import th from '@_workspace/navigation/dictionaries/th.json'

const dictionaries = {
  en,
  th
}

export const getDictionary = (locale: Locale) => dictionaries[locale]
