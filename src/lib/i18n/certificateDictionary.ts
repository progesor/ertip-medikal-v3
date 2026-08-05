import type { SiteLocale } from "@/lib/i18n/config";

const certificateDictionaries = {
  tr: {
    trustBadge: "Kurumsal Güven",
    defaultTitle: "Sertifikalarımız",
    previous: "Önceki sertifika",
    next: "Sonraki sertifika",
    close: "Sertifika görüntüleyicisini kapat",
    officialDocument: "Resmi Belge",
    scopeDetails: "Kapsam Detayları",
    defaultDescription:
      "Bu sertifika, Ertip Medikal'in global standartlara, kalite kontrol süreçlerine ve medikal üretim yönetmeliklerine olan tam uygunluğunu tescillemektedir.",
    viewPdf: "PDF Olarak Görüntüle",
    saveHint:
      "Cihazınıza kaydetmek için butona sağ tıklayıp “Farklı Kaydet” seçeneğini kullanabilirsiniz.",
    originalStored:
      "Bu belgenin ıslak imzalı orijinal nüshası merkez ofisimizde muhafaza edilmektedir.",
  },
  en: {
    trustBadge: "Corporate Assurance",
    defaultTitle: "Our Certificates",
    previous: "Previous certificate",
    next: "Next certificate",
    close: "Close certificate viewer",
    officialDocument: "Official Document",
    scopeDetails: "Scope Details",
    defaultDescription:
      "This certificate confirms Ertip Medical's compliance with international standards, quality-control processes, and applicable medical manufacturing requirements.",
    viewPdf: "View PDF",
    saveHint:
      "To save the file to your device, right-click the button and choose “Save link as”.",
    originalStored:
      "The original signed copy of this document is retained at our head office.",
  },
} as const satisfies Record<SiteLocale, Record<string, string>>;

export function getCertificateDictionary(locale: SiteLocale) {
  return certificateDictionaries[locale];
}
