import de from "./dictionaries/de.json";
import en from "./dictionaries/en.json";

export type DICT = typeof en | typeof de;
const DICTIONARIES = {
  en,
  de,
} as const;

export const LOCALES = Object.keys(DICTIONARIES);
export const LABELS: {
  [locale: string]: string;
} = {
  en: "English",
  de: "Deutsch",
};

export const DEFAULT_LOCALE = "en";

export const isLang = (lang?: string) => {
  return typeof lang !== "undefined" && LOCALES.includes(lang);
};

export const loadDictionary = (lang = DEFAULT_LOCALE) => {
  if (!isLang(lang)) {
    return DICTIONARIES[DEFAULT_LOCALE];
  }

  return DICTIONARIES[lang as keyof typeof DICTIONARIES];
};
