import type { SiteLocale } from "@/lib/i18n/config";
import {
  getUiDictionary,
  type UiDictionary,
} from "@/lib/i18n/uiDictionary";

type UiDictionarySection = keyof UiDictionary;

export type UiTextOverrideKey = {
  [Section in UiDictionarySection]: {
    [Key in keyof UiDictionary[Section]]: `${Extract<Section, string>}.${Extract<Key, string>}`;
  }[keyof UiDictionary[Section]];
}[UiDictionarySection];

export type UiTextOverrides = Partial<Record<UiTextOverrideKey, string>>;

export type UiTextOverrideField = {
  key: UiTextOverrideKey;
  label: string;
  multiline?: boolean;
};

export type UiTextOverrideSection = {
  id: string;
  label: string;
  description: string;
  fields: readonly UiTextOverrideField[];
};

export const uiTextOverrideSections = [
  {
    id: "cart",
    label: "Sepet Bildirimi",
    description: "Ürün teklif listesine eklendiğinde gösterilen kısa bildirim metinleri.",
    fields: [
      { key: "cart.added", label: "Sepete eklendi başlığı" },
      { key: "cart.goToCart", label: "Sepete git bağlantısı" },
    ],
  },
  {
    id: "product",
    label: "Ürün Detayı",
    description: "Ürün detay ekranındaki başlıca buton, sekme ve durum metinleri.",
    fields: [
      { key: "product.originalErtipProduct", label: "Orijinal ürün rozeti" },
      { key: "product.addToQuoteCart", label: "Teklif sepetine ekle butonu" },
      { key: "product.descriptionTab", label: "Açıklama sekmesi" },
      { key: "product.variantsTab", label: "Modeller / SKU sekmesi" },
      { key: "product.videoTab", label: "Video sekmesi" },
      { key: "product.documentsTab", label: "Dokümanlar sekmesi" },
      {
        key: "product.noDescription",
        label: "Açıklama yok metni",
        multiline: true,
      },
      { key: "product.keyFeatures", label: "Temel özellikler başlığı" },
      { key: "product.variantModel", label: "Varyant modeli etiketi" },
      { key: "product.skuCode", label: "SKU etiketi" },
      { key: "product.status", label: "Durum etiketi" },
      { key: "product.inactive", label: "Pasif durumu" },
      { key: "product.inStock", label: "Stokta durumu" },
      { key: "product.promotionalMaterials", label: "Tanıtım materyalleri başlığı" },
      {
        key: "product.technicalDocumentation",
        label: "Teknik dokümantasyon başlığı",
      },
    ],
  },
  {
    id: "quote",
    label: "Teklif Sepeti",
    description: "Teklif sepeti, RFQ formu ve başarı ekranındaki ziyaretçi metinleri.",
    fields: [
      { key: "quote.title", label: "Sayfa başlığı" },
      { key: "quote.description", label: "Sayfa açıklaması", multiline: true },
      { key: "quote.emptyTitle", label: "Boş sepet başlığı" },
      {
        key: "quote.emptyDescription",
        label: "Boş sepet açıklaması",
        multiline: true,
      },
      { key: "quote.browseProducts", label: "Ürünleri incele butonu" },
      { key: "quote.selectedProducts", label: "Seçilen ürünler başlığı" },
      { key: "quote.contactDetails", label: "İletişim bilgileri başlığı" },
      { key: "quote.customerName", label: "Ad / yetkili alan etiketi" },
      { key: "quote.company", label: "Klinik / firma alan etiketi" },
      { key: "quote.email", label: "E-posta alan etiketi" },
      { key: "quote.phone", label: "Telefon alan etiketi" },
      { key: "quote.note", label: "Ek not alan etiketi" },
      { key: "quote.submit", label: "Teklif gönder butonu" },
      { key: "quote.privacy", label: "Form gizlilik notu", multiline: true },
      { key: "quote.successTitle", label: "Başarı başlığı" },
      {
        key: "quote.successDescription",
        label: "Başarı açıklaması",
        multiline: true,
      },
      { key: "quote.backToCatalog", label: "Kataloğa dönüş butonu" },
    ],
  },
  {
    id: "contact",
    label: "İletişim Formu",
    description: "İletişim formunun temel alan adları ve başarı ekranı metinleri.",
    fields: [
      { key: "contact.name", label: "Ad soyad alan etiketi" },
      { key: "contact.email", label: "E-posta alan etiketi" },
      { key: "contact.phone", label: "Telefon alan etiketi" },
      { key: "contact.department", label: "Departman alan etiketi" },
      { key: "contact.generalDepartment", label: "Genel departman seçeneği" },
      { key: "contact.message", label: "Mesaj alan etiketi" },
      { key: "contact.submit", label: "Mesaj gönder butonu" },
      { key: "contact.privacyLink", label: "Gizlilik / aydınlatma link metni" },
      { key: "contact.successTitle", label: "Başarı başlığı" },
      {
        key: "contact.successDescription",
        label: "Başarı açıklaması",
        multiline: true,
      },
      { key: "contact.newMessage", label: "Yeni mesaj butonu" },
    ],
  },
  {
    id: "unsubscribe",
    label: "Abonelikten Ayrılma",
    description: "E-bülten abonelik iptal akışının ziyaretçiye görünen temel metinleri.",
    fields: [
      { key: "unsubscribe.title", label: "Sayfa başlığı" },
      {
        key: "unsubscribe.requestDescription",
        label: "İptal bağlantısı isteme açıklaması",
        multiline: true,
      },
      {
        key: "unsubscribe.confirmationDescription",
        label: "İptal onay açıklaması",
        multiline: true,
      },
      { key: "unsubscribe.sendLink", label: "İptal bağlantısı gönder butonu" },
      { key: "unsubscribe.cancelSubscription", label: "Aboneliği iptal et butonu" },
      { key: "unsubscribe.cancelledTitle", label: "İptal edildi başlığı" },
      { key: "unsubscribe.checkEmailTitle", label: "E-postayı kontrol edin başlığı" },
      { key: "unsubscribe.confirmationTitle", label: "İptal onay başlığı" },
      { key: "unsubscribe.backHome", label: "Ana sayfaya dönüş butonu" },
      { key: "unsubscribe.metadataTitle", label: "Tarayıcı / SEO sayfa başlığı" },
    ],
  },
] as const satisfies readonly UiTextOverrideSection[];

const allowedKeys = new Set<UiTextOverrideKey>(
  uiTextOverrideSections.flatMap((section) => section.fields.map((field) => field.key)),
);

export function isUiTextOverrideKey(value: string): value is UiTextOverrideKey {
  return allowedKeys.has(value as UiTextOverrideKey);
}

export function normalizeUiTextOverrides(input: unknown): UiTextOverrides {
  if (!input || typeof input !== "object" || Array.isArray(input)) return {};

  const normalized: UiTextOverrides = {};

  for (const [rawKey, rawValue] of Object.entries(input)) {
    if (!isUiTextOverrideKey(rawKey) || typeof rawValue !== "string") continue;

    const value = rawValue.trim();
    if (!value) continue;

    normalized[rawKey] = value.slice(0, 2_000);
  }

  return normalized;
}

export function getUiTextDefaultValue(locale: SiteLocale, key: UiTextOverrideKey) {
  const dictionary = getUiDictionary(locale) as unknown as Record<
    string,
    Record<string, string>
  >;
  const [section, field] = key.split(".");

  return dictionary[section]?.[field] || "";
}
