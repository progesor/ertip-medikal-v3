export const siteLocales = ["en", "tr"] as const;

export type SiteLocale = (typeof siteLocales)[number];

// Payload keeps Turkish as its schema/default locale so the first localization
// migration can preserve the existing Turkish-only production content safely.
// The public website still prefers English at the routing layer.
export const payloadDefaultLocale: SiteLocale = "tr";
export const publicDefaultLocale: SiteLocale = "en";

export const localeCookieName = "ertip-locale";
export const localeRequestHeader = "x-ertip-locale";
export const publicPathRequestHeader = "x-ertip-public-path";

export const payloadLocalization = {
  locales: [
    { code: "tr", label: "Türkçe" },
    { code: "en", label: "English" },
  ],
  defaultLocale: payloadDefaultLocale,
  fallback: false,
};

export function isSiteLocale(value: string): value is SiteLocale {
  return siteLocales.includes(value as SiteLocale);
}
