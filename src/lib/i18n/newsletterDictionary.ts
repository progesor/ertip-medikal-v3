import type { SiteLocale } from "@/lib/i18n/config";

const newsletterDictionaries = {
  tr: {
    emailPlaceholder: "E-Posta adresinizi girin...",
    error: "Bir hata oluştu. Lütfen tekrar deneyin.",
    connectionError: "Bağlantı hatası yaşandı.",
    subscribing: "Kayıt...",
    success: "Başarılı",
    defaultButton: "Kayıt Ol",
  },
  en: {
    emailPlaceholder: "Enter your email address...",
    error: "Something went wrong. Please try again.",
    connectionError: "A connection error occurred.",
    subscribing: "Subscribing...",
    success: "Subscribed",
    defaultButton: "Subscribe",
  },
} as const satisfies Record<SiteLocale, Record<string, string>>;

export function getNewsletterDictionary(locale: SiteLocale) {
  return newsletterDictionaries[locale];
}
