import type { SiteLocale } from "@/lib/i18n/config";

const galleryBlockDictionaries = {
  tr: {
    imageFallback: "Galeri görseli",
    enlargeSuffix: "görselini büyüt",
    selectToEnlarge: "Görselleri büyütmek için seçin",
    viewer: "Galeri görüntüleyici",
    close: "Galeriyi kapat",
    previous: "Önceki görsel",
    next: "Sonraki görsel",
  },
  en: {
    imageFallback: "Gallery image",
    enlargeSuffix: "enlarge image",
    selectToEnlarge: "Select an image to enlarge",
    viewer: "Gallery viewer",
    close: "Close gallery",
    previous: "Previous image",
    next: "Next image",
  },
} as const satisfies Record<SiteLocale, Record<string, string>>;

export function getGalleryBlockDictionary(locale: SiteLocale) {
  return galleryBlockDictionaries[locale];
}
