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
