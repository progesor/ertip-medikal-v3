import type { CollectionConfig } from "payload";
import { metaFields } from "@/fields/meta";
import { slugField } from "@/fields/slug";

// Matematiksel Kombinasyon (Kartezyen Çarpım) Hesaplayıcı
function getCombinations(arrays: string[][]): string[][] {
  if (!arrays || arrays.length === 0) return [];
  // DÜZELTME: reduce metoduna başlangıç değeri olarak [[]] atandı.
  // Bu sayede metinler harf harf parçalanmayacak.
  return arrays.reduce<string[][]>(
    (a, b) => a.flatMap((x) => b.map((y) => [...x, y])),
    [[]],
  );
}

export const Products: CollectionConfig = {
  slug: "products",
  labels: { singular: "Ürün", plural: "Ürünler" },
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "sku", "_status"],
  },
  versions: { drafts: true },
  // --- AKILLI SKU VE VARYANT MOTORU (HOOK) ---
  hooks: {
    beforeChange: [
      ({ data }) => {
        if (
          data.triggerVariantGeneration &&
          data.attributes &&
          data.attributes.length > 0
        ) {
          // GÜVENLİK DÜZELTMESİ: Boş eklenen özellikleri filtrele
          const parsedAttributes = data.attributes
            .filter((attr: any) => attr && attr.name && attr.values)
            .map((attr: any) => ({
              name: attr.name,
              values: attr.values
                .split("-")
                .map((v: string) => v.trim())
                .filter(Boolean),
            }));

          if (parsedAttributes.length === 0) {
            data.triggerVariantGeneration = false;
            return data;
          }

          const arraysToCombine = parsedAttributes.map(
            (attr: any) => attr.values,
          );
          const combinations = getCombinations(arraysToCombine);

          const generatedVariants = combinations.map((combo) => {
            let dia = "";
            let len = "";
            const titleParts: string[] = [];

            combo.forEach((val, index) => {
              // index aşımı olmaması için ekstra güvenlik kontrolü
              if (parsedAttributes[index]) {
                const attrName = parsedAttributes[index].name;
                titleParts.push(`${val} mm ${attrName}`);
                if (attrName.toLowerCase().includes("çap")) dia = val;
                if (attrName.toLowerCase().includes("uzunluk")) len = val;
              }
            });

            // --- ERTIP PUNCH SKU MANTIĞI ---
            let skuCode = "";

            if (dia && len) {
              const cleanLen = len.replace(/\./g, "");
              const cleanDia = dia.replace(/\./g, "");

              if (len.includes(".")) {
                skuCode = `${parseInt(cleanDia, 10)}${cleanLen}`;
              } else {
                skuCode = `${cleanDia}${cleanLen}`;
              }
            } else {
              skuCode = combo.join("").replace(/\./g, "");
            }

            const finalPrefix = data.skuPrefix || "";
            const finalSuffix = data.skuSuffix
              ? ` ${data.skuSuffix.trim()}`
              : "";

            return {
              title: titleParts.join(" - "),
              sku: `${finalPrefix}${skuCode}${finalSuffix}`,
              isActive: true,
            };
          });

          data.variants = generatedVariants;
          data.triggerVariantGeneration = false;
        }
        return data;
      },
    ],
  },
  fields: [
    {
      type: "tabs",
      tabs: [
        {
          label: "Genel Bilgiler",
          fields: [
            {
              name: "title",
              type: "text",
              required: true,
              label: "Ürün Adı (Örn: Dijital Trikoskop)",
            },
            {
              name: "shortDescription",
              type: "textarea",
              label: "Kısa Özet",
              maxLength: 300,
            },
            {
              name: "description",
              type: "code",
              label: "Detaylı Açıklama",
              admin: {
                components: {
                  Field: "/components/admin/MarkdownEditor#MarkdownEditor",
                },
                language: "markdown",
                description:
                  "Buraya Markdown (## Başlık, | Tablo |) veya doğrudan HTML (<p><strong>...</strong></p>) yapıştırabilirsiniz.",
              },
            },
            // DİNAMİK TEMEL ÖZELLİKLER (YENİ EKLENDİ)
            {
              name: "specs",
              type: "array",
              label: "Temel/Teknik Özellikler",
              fields: [
                {
                  name: "key",
                  type: "text",
                  label: "Özellik (Örn: Malzeme)",
                  required: true,
                  admin: { width: "50%" },
                },
                {
                  name: "value",
                  type: "text",
                  label: "Değer (Örn: Paslanmaz Çelik)",
                  required: true,
                  admin: { width: "50%" },
                },
              ],
            },
          ],
        },
        {
          label: "Görseller ve Medya",
          fields: [
            {
              name: "mainImage",
              type: "upload",
              relationTo: "media",
              required: true,
              label: "Ana Görsel",
            },
            {
              name: "gallery",
              type: "array",
              label: "Ürün Galerisi",
              fields: [
                {
                  name: "image",
                  type: "upload",
                  relationTo: "media",
                  required: true,
                  label: "Görsel Seç",
                },
              ],
            },
            {
              name: "videoUrl",
              type: "text",
              label: "Tanıtım Videosu (YouTube Linki)",
            },
          ],
        },
        {
          label: "Varyantlar ve Stok",
          fields: [
            {
              type: "row",
              fields: [
                {
                  name: "skuPrefix",
                  type: "text",
                  label: "SKU Öneki (Örn: 110-)",
                  admin: { width: "50%" },
                },
                {
                  name: "skuSuffix",
                  type: "text",
                  label: "SKU Soneki (Örn: S-303)",
                  admin: { width: "50%" },
                },
              ],
            },
            {
              name: "attributes",
              type: "array",
              label: "Ürün Özellikleri (Çap, Uzunluk vb.)",
              admin: {
                description:
                  "Değerleri TİRE (-) ile ayırarak yazın. Örn: 0.6-0.65-0.7",
              },
              fields: [
                {
                  name: "name",
                  type: "text",
                  label: "Özellik Adı (Örn: Çap)",
                  required: true,
                },
                {
                  name: "values",
                  type: "textarea",
                  label: "Değerler",
                  required: true,
                },
              ],
            },
            {
              name: "triggerVariantGeneration",
              type: "checkbox",
              label: "⚡ Varyantları ve SKU Kodlarını Otomatik Oluştur",
              admin: {
                description:
                  "Bunu işaretleyip kaydettiğinizde, yukarıdaki özelliklerin tüm kombinasyonları hesaplanır, özel kurallara göre SKU kodları oluşturulur ve aşağıdaki listeye otomatik eklenir.",
              },
            },
            {
              name: "variants",
              type: "array",
              label: "Üretilen Varyantlar",
              admin: {
                description:
                  "Bu liste otomatik dolar ancak sonrasında manuel müdahale edip istisnai durumları düzeltebilirsiniz.",
              },
              fields: [
                {
                  name: "title",
                  type: "text",
                  label: "Varyant Adı",
                  required: true,
                },
                {
                  name: "sku",
                  type: "text",
                  label: "Varyant SKU (Barkod)",
                  required: true,
                },
                {
                  name: "price",
                  type: "text",
                  label: "Liste Fiyatı (Opsiyonel)",
                },
                {
                  name: "isActive",
                  type: "checkbox",
                  label: "Aktif / Satışta",
                  defaultValue: true,
                },
              ],
            },
          ],
        },
        {
          label: "Lojistik & Ölçüler",
          fields: [
            {
              name: "logisticDisplayPosition",
              type: "select",
              label: "Lojistik Bilgi Yerleşimi",
              defaultValue: "below",
              options: [
                { label: "Açıklamanın Altında (Geniş Tablo)", value: "below" },
                {
                  label: "Yan Panelde (Sidebar - Özet Kartlar)",
                  value: "sidebar",
                },
                { label: "Her İki Yerde de Göster", value: "both" },
              ],
              admin: {
                description:
                  "Teknik ve lojistik verilerin ürün sayfasındaki konumunu belirler.",
              },
            },
            {
              type: "row",
              fields: [
                {
                  name: "width",
                  type: "text",
                  label: "Net Genişlik (mm)",
                  admin: { width: "25%" },
                },
                {
                  name: "height",
                  type: "text",
                  label: "Net Yükseklik (mm)",
                  admin: { width: "25%" },
                },
                {
                  name: "depth",
                  type: "text",
                  label: "Net Derinlik (mm)",
                  admin: { width: "25%" },
                },
                {
                  name: "weight",
                  type: "text",
                  label: "Net Ağırlık (gr)",
                  admin: { width: "25%" },
                },
              ],
            },
            {
              name: "packaging",
              type: "array",
              label: "Ambalaj ve Paketleme Seçenekleri",
              admin: {
                description:
                  "Ürünün farklı paketleme formlarını (Örn: Tekli Kutu, 50’li Ana Koli) buraya ekleyebilirsiniz.",
              },
              fields: [
                {
                  type: "row",
                  fields: [
                    {
                      name: "packageLabel",
                      type: "text",
                      label: "Paket Tipi (Örn: Master Carton)",
                      required: true,
                      admin: { width: "40%" },
                    },
                    {
                      name: "quantity",
                      type: "number",
                      label: "İçindeki Adet",
                      admin: { width: "20%" },
                    },
                    {
                      name: "grossWeight",
                      type: "text",
                      label: "Brüt Ağırlık (kg)",
                      admin: { width: "40%" },
                    },
                  ],
                },
                {
                  type: "row",
                  fields: [
                    {
                      name: "p_width",
                      type: "text",
                      label: "Ambalaj Genişlik (cm)",
                      admin: { width: "33%" },
                    },
                    {
                      name: "p_height",
                      type: "text",
                      label: "Ambalaj Yükseklik (cm)",
                      admin: { width: "33%" },
                    },
                    {
                      name: "p_depth",
                      type: "text",
                      label: "Ambalaj Derinlik (cm)",
                      admin: { width: "34%" },
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: "Dokümanlar & Kılavuzlar",
          fields: [
            {
              name: "publicDocs",
              type: "array",
              label: "Halka Açık Belgeler (Katalog, Broşür vb.)",
              fields: [
                {
                  name: "label",
                  type: "text",
                  label: "Belge Adı",
                  required: true,
                },
                {
                  name: "file",
                  type: "upload",
                  relationTo: "media",
                  required: true,
                },
              ],
            },
            {
              name: "protectedDocs",
              type: "array",
              label: "Korumalı Belgeler (Kullanma Kılavuzu)",
              fields: [
                {
                  name: "label",
                  type: "text",
                  label: "Belge Adı",
                  required: true,
                },
                {
                  name: "file",
                  type: "upload",
                  relationTo: "media",
                  required: true,
                },
                {
                  name: "accessCodes",
                  type: "array",
                  label: "Yetkili Kodlar / Seri Numaraları",
                  fields: [
                    {
                      type: "row",
                      fields: [
                        {
                          name: "code",
                          type: "text",
                          label: "Kod",
                          required: true,
                          admin: { width: "70%" },
                        },
                        {
                          name: "isActive",
                          type: "checkbox",
                          label: "Aktif",
                          defaultValue: true,
                          admin: { width: "30%" },
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: "SEO Ayarları",
          fields: [
            metaFields, // Merkezi SEO alanımız
          ],
        },
      ],
    },
    // --- YAN BAR (Sidebar) ALANLARI ---
    {
      name: "sku",
      type: "text",
      label: "Ana Ürün Kodu (Varyantsız Ürünler İçin)",
      admin: { position: "sidebar" },
    },
    {
      name: "category",
      type: "relationship",
      relationTo: "categories",
      hasMany: true,
      required: true,
      label: "Kategoriler",
      admin: { position: "sidebar" },
    },
    {
      name: "relatedProducts",
      type: "relationship",
      relationTo: "products",
      hasMany: true,
      label: "İlişkili / Benzer Ürünler",
      admin: { position: "sidebar" },
    },
    {
      name: "isFeatured",
      type: "checkbox",
      label: "Anasayfada Öne Çıkar",
      defaultValue: false,
      admin: { position: "sidebar" },
    },
    {
      name: "isOriginalErtipProduct",
      type: "checkbox",
      label: "Orijinal Ertip Ürünü",
      defaultValue: true,
      admin: {
        position: "sidebar",
        description:
            "Ürün sayfasında 'Orijinal Ertip Ürünü' etiketinin gösterilip gösterilmeyeceğini belirler.",
      },
    },
    slugField("title"), // Akıllı URL üretici
  ],
};
