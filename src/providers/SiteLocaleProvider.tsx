"use client";

import React, { createContext, useContext } from "react";
import type { SiteLocale } from "@/lib/i18n/config";
import { getUiDictionary } from "@/lib/i18n/uiDictionary";

const SiteLocaleContext = createContext<SiteLocale>("en");

export function SiteLocaleProvider({
  children,
  locale,
}: {
  children: React.ReactNode;
  locale: SiteLocale;
}) {
  return (
    <SiteLocaleContext.Provider value={locale}>
      {children}
    </SiteLocaleContext.Provider>
  );
}

export function useSiteLocale() {
  return useContext(SiteLocaleContext);
}

export function useUiDictionary() {
  return getUiDictionary(useSiteLocale());
}
