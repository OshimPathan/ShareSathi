import { create } from "zustand";
import en from "../i18n/en.json";
import ne from "../i18n/ne.json";

export type Locale = "en" | "ne";

type Translations = typeof en;

const translations: Record<Locale, Translations> = { en, ne };

interface I18nState {
  locale: Locale;
  t: Translations;
  setLocale: (locale: Locale) => void;
}

const saved = (typeof localStorage !== "undefined" && localStorage.getItem("sharesathi-locale")) as Locale | null;
const initial: Locale = saved === "ne" ? "ne" : "en";

// Set the lang attribute on <html> immediately
if (typeof document !== "undefined") {
  document.documentElement.lang = initial;
}

export const useI18nStore = create<I18nState>((set) => ({
  locale: initial,
  t: translations[initial],
  setLocale: (locale: Locale) => {
    localStorage.setItem("sharesathi-locale", locale);
    document.documentElement.lang = locale;
    set({ locale, t: translations[locale] });
  },
}));

/** Shorthand hook: const t = useT(); t.nav.dashboard */
export const useT = () => useI18nStore((s) => s.t);
