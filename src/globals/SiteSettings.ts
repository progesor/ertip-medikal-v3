import type { GlobalConfig } from "payload";

export const SiteSettings: GlobalConfig = {
  slug: "site-settings",
  label: "Site Ayarları",
  access: {
    read: () => true, // Frontend'den okunabilmesi için herkese açık
  },
  fields: [
    {
      name: "general",
      label: "Genel Site Ayarları",
      type: "group",
      fields: [
        {
          name: "siteLogo",
          type: "upload",
          relationTo: "media",
          label: "Site Logosu (Renkli)",
          required: true,
        },
        {
          name: "whiteLogo",
          type: "upload",
          relationTo: "media",
          label: "Site Logosu (Beyaz Versiyon - Footer İçin)",
        },
        {
          name: "symbolLogo",
          type: "upload",
          relationTo: "media",
          label: "Sembol Logo (Yazısız)",
          admin: {
            description:
                "Header, mobil menü veya kompakt alanlarda kullanılabilecek sadece sembolden oluşan logo.",
          },
        },
      ],
    },
    {
      name: "header",
      label: "Header Ayarları",
      type: "group",
      fields: [
        {
          type: "row",
          fields: [
            {
              name: "showLogoInHeader",
              type: "checkbox",
              label: "Header'da logoyu göster",
              defaultValue: false,
              admin: { width: "50%" },
            },
            {
              name: "headerLogoVariant",
              type: "select",
              label: "Logo Versiyonu",
              defaultValue: "auto",
              options: [
                { label: "Otomatik", value: "auto" },
                { label: "Renkli Logo", value: "default" },
                { label: "Beyaz Logo", value: "white" },
                { label: "Sembol Logo", value: "symbol" },
              ],
              admin: { width: "50%" },
            },
          ],
        },
        {
          type: "row",
          fields: [
            {
              name: "showCompanyNameInHeader",
              type: "checkbox",
              label: "Firma adını göster",
              defaultValue: true,
              admin: { width: "50%" },
            },
            {
              name: "showTaglineInHeader",
              type: "checkbox",
              label: "Sloganı göster",
              defaultValue: true,
              admin: { width: "50%" },
            },
          ],
        },
        {
          type: "row",
          fields: [
            {
              name: "headerCompanyName",
              type: "text",
              label: "Header Firma Adı",
              defaultValue: "Ertip Medikal",
              admin: { width: "50%" },
            },
            {
              name: "headerTagline",
              type: "text",
              label: "Header Sloganı",
              defaultValue: "Medical Instruments",
              admin: { width: "50%" },
            },
          ],
        },
        {
          type: "row",
          fields: [
            {
              name: "headerLayout",
              type: "select",
              label: "Header Yerleşimi",
              defaultValue: "default",
              options: [
                { label: "Varsayılan", value: "default" },
                { label: "Kompakt", value: "compact" },
                { label: "Marka Odaklı", value: "brand" },
              ],
              admin: { width: "33%" },
            },
            {
              name: "headerCtaLabel",
              type: "text",
              label: "Header CTA Metni",
              defaultValue: "Bize Ulaşın",
              admin: { width: "34%" },
            },
            {
              name: "headerCtaHref",
              type: "text",
              label: "Header CTA Linki",
              defaultValue: "/iletisim",
              admin: { width: "33%" },
            },
          ],
        },
      ],
    },
    {
      name: "contact",
      label: "İletişim Bilgileri",
      type: "group",
      fields: [
        { name: "email", type: "email", label: "E-Posta Adresi" },
        { name: "phone", type: "text", label: "Telefon Numarası" },
        { name: "address", type: "textarea", label: "Açık Adres" },
      ],
    },
    {
      name: "floatingAction",
      label: "Hızlı İletişim Butonu",
      type: "group",
      fields: [
        {
          name: "enabled",
          type: "checkbox",
          label: "Hızlı iletişim butonunu göster",
          defaultValue: false,
          admin: {
            description:
                "Sitenin sağ veya sol alt köşesinde sabit hızlı iletişim butonu gösterir.",
          },
        },
        {
          type: "row",
          fields: [
            {
              name: "type",
              type: "select",
              label: "Buton Türü",
              defaultValue: "whatsapp",
              options: [
                { label: "WhatsApp", value: "whatsapp" },
                { label: "Telefon", value: "phone" },
                { label: "E-posta", value: "email" },
                { label: "Özel Link", value: "custom" },
              ],
              admin: {
                width: "50%",
                description:
                    "WhatsApp seçildiğinde mesaj ve WhatsApp'a özel görünüm seçenekleri kullanılabilir.",
              },
            },
            {
              name: "position",
              type: "select",
              label: "Konum",
              defaultValue: "bottom-right",
              options: [
                { label: "Sağ Alt", value: "bottom-right" },
                { label: "Sol Alt", value: "bottom-left" },
              ],
              admin: {
                width: "50%",
              },
            },
          ],
        },
        {
          type: "row",
          fields: [
            {
              name: "label",
              type: "text",
              label: "Buton Metni",
              defaultValue: "WhatsApp ile İletişim",
              admin: {
                width: "50%",
                description:
                    "Buton üzerinde görünecek metin. Sadece ikon görünümünde aria-label olarak kullanılır.",
              },
            },
            {
              name: "openInNewTab",
              type: "checkbox",
              label: "Yeni sekmede aç",
              defaultValue: true,
              admin: {
                width: "50%",
              },
            },
          ],
        },
        {
          type: "row",
          fields: [
            {
              name: "styleMode",
              type: "select",
              label: "Renk Stili",
              defaultValue: "whatsapp",
              options: [
                { label: "Tema Rengi ile Uyumlu", value: "theme" },
                { label: "WhatsApp Yeşili", value: "whatsapp" },
              ],
              admin: {
                width: "50%",
                description:
                    "WhatsApp yeşili sadece WhatsApp türü için özel marka görünümü sağlar.",
              },
            },
            {
              name: "appearance",
              type: "select",
              label: "Görünüm Tipi",
              defaultValue: "pill",
              options: [
                { label: "Kapsül Buton", value: "pill" },
                { label: "Mesaj Balonu", value: "chat-bubble" },
                { label: "Sadece İkon", value: "icon-only" },
              ],
              admin: {
                width: "50%",
              },
            },
          ],
        },
        {
          type: "row",
          fields: [
            {
              name: "showIcon",
              type: "checkbox",
              label: "İkonu göster",
              defaultValue: true,
              admin: {
                width: "50%",
              },
            },
            {
              name: "showPulse",
              type: "checkbox",
              label: "Hafif kıpırdama efekti göster",
              defaultValue: true,
              admin: {
                width: "50%",
                description:
                    "Butona belirli aralıklarla çok hafif bir dikkat çekme hareketi verir.",
              },
            },
          ],
        },
        {
          type: "row",
          fields: [
            {
              name: "showHelperText",
              type: "checkbox",
              label: "Yardımcı metin göster",
              defaultValue: false,
              admin: {
                width: "50%",
                description:
                    "Butonun üstünde küçük bir açıklama balonu gösterir.",
              },
            },
            {
              name: "helperText",
              type: "text",
              label: "Yardımcı Metin",
              defaultValue: "Size nasıl yardımcı olabiliriz?",
              admin: {
                width: "50%",
              },
            },
          ],
        },
        {
          name: "phoneNumber",
          type: "text",
          label: "Telefon / WhatsApp Numarası",
          admin: {
            description:
                "WhatsApp ve telefon için ülke kodu ile boşluksuz girin. Örn: 905315149711",
          },
        },
        {
          name: "message",
          type: "textarea",
          label: "Varsayılan WhatsApp Mesajı",
          defaultValue:
              "Merhaba, ürünleriniz hakkında bilgi almak istiyorum.",
          admin: {
            description:
                "Sadece WhatsApp türünde kullanılır. Link içinde otomatik encode edilir.",
          },
        },
        {
          name: "email",
          type: "email",
          label: "E-posta Adresi",
          admin: {
            description: "Buton türü E-posta ise kullanılır.",
          },
        },
        {
          name: "customUrl",
          type: "text",
          label: "Özel Link",
          admin: {
            description:
                "Buton türü Özel Link ise kullanılır. Örn: /iletisim veya https://...",
          },
        },
      ],
    },
    {
      name: "socialMedia",
      label: "Sosyal Medya Linkleri",
      type: "array",
      fields: [
        {
          name: "platform",
          type: "text",
          label: "Platform Adı (Örn: LinkedIn)",
        },
        { name: "url", type: "text", label: "Profil URL" },
      ],
    },
    {
      name: "footer",
      type: "group",
      label: "Footer Ayarları",
      fields: [
        {
          name: "columns",
          type: "blocks",
          label: "Footer Sütunları",
          maxRows: 4, // Maksimum 4 sütun
          blocks: [
            // 1. Tip: Logo ve Metin Sütunu
            {
              slug: "textColumn",
              labels: { singular: "Metin Sütunu", plural: "Metin Sütunları" },
              fields: [
                {
                  name: "showLogo",
                  type: "checkbox",
                  label: "Logoyu Göster",
                  defaultValue: true,
                },
                { name: "text", type: "textarea", label: "Açıklama Metni" },
              ],
            },
            // 2. Tip: Menü / Link Sütunu
            {
              slug: "menuColumn",
              labels: {
                singular: "Menü/Link Sütunu",
                plural: "Menü Sütunları",
              },
              fields: [
                {
                  name: "title",
                  type: "text",
                  label: "Sütun Başlığı",
                  required: true,
                },
                {
                  name: "links",
                  type: "array",
                  label: "Sütun Linkleri",
                  fields: [
                    {
                      name: "label",
                      type: "text",
                      label: "Görünen Metin (Örn: Hakkımızda)",
                      required: true,
                    },
                    {
                      name: "url",
                      type: "text",
                      label: "Gideceği URL (Örn: /hakkimizda)",
                      required: true,
                    },
                  ],
                },
              ],
            },
            // 3. Tip: İletişim Bilgileri Sütunu
            {
              slug: "contactColumn",
              labels: {
                singular: "İletişim Sütunu",
                plural: "İletişim Sütunları",
              },
              fields: [
                {
                  name: "title",
                  type: "text",
                  label: "Sütun Başlığı",
                  defaultValue: "İletişim",
                },
                {
                  name: "showAddress",
                  type: "checkbox",
                  label: "Adresi Göster",
                  defaultValue: true,
                },
                {
                  name: "showPhone",
                  type: "checkbox",
                  label: "Telefonu Göster",
                  defaultValue: true,
                },
                {
                  name: "showEmail",
                  type: "checkbox",
                  label: "E-Postayı Göster",
                  defaultValue: true,
                },
              ],
            },
          ],
        },
        {
          name: "bottomLinks",
          type: "array",
          label: "Alt Bar Linkleri (Yasal/Ek)",
          fields: [
            {
              name: "label",
              type: "text",
              label: "Link Metni (Örn: Gizlilik Politikası)",
              required: true,
            },
            {
              name: "url",
              type: "text",
              label: "Link URL (Örn: /gizlilik)",
              required: true,
            },
          ],
        },
        {
          name: "copyright",
          type: "text",
          label: "Copyright Metni",
          defaultValue: "© 2026 Ertip Medikal. Tüm Hakları Saklıdır.",
        },
      ],
    },
  ],
};
