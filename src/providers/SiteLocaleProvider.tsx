"use client";

import React, { createContext, useContext } from "react";
import type { SiteLocale } from "@/lib/i18n/config";
import {
  getUiDictionary,
  type UiDictionary,
} from "@/lib/i18n/uiDictionary";

type SiteLocaleContextValue = {
  locale: SiteLocale;
  dictionary: UiDictionary;
};

const SiteLocaleContext = createContext<SiteLocaleContextValue>({
  locale: "en",
  dictionary: getUiDictionary("en"),
});

export function SiteLocaleProvider({
  children,
  locale,
  dictionary,
}: {
  children: React.ReactNode;
  locale: SiteLocale;
  dictionary: UiDictionary;
}) {
  return (
    <SiteLocaleContext.Provider value={{ locale, dictionary }}>
      {children}
    </SiteLocaleContext.Provider>
  );
}

export function useSiteLocale() {
  return useContext(SiteLocaleContext).locale;
}

export function useUiDictionary() {
  return useContext(SiteLocaleContext).dictionary;
}
