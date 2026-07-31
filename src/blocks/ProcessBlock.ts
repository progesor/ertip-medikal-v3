import type { Block } from "payload";
import { sectionField } from "@/fields/section";

export const ProcessBlock: Block = {
  slug: "process",
  labels: { singular: "Süreç Bloğu", plural: "Süreç Blokları" },
  fields: [
    {
      name: "eyebrow",
      type: "text",
      label: "Küçük Üst Başlık",
    },
    {
      name: "title",
      type: "text",
      label: "Başlık",
      defaultValue: "Nasıl Çalışıyoruz?",
    },
    {
      name: "subtitle",
      type: "textarea",
      label: "Alt Başlık",
    },
    {
      type: "row",
      fields: [
        {
          name: "layoutMode",
          type: "select",
          label: "Yerleşim Modu",
          defaultValue: "horizontal",
          options: [
            { label: "Yatay Süreç", value: "horizontal" },
            { label: "Dikey Zaman Çizgisi", value: "timeline" },
            { label: "Kart Grid", value: "cards" },
          ],
        },
        {
          name: "alignment",
          type: "select",
          label: "Başlık Hizalama",
          defaultValue: "center",
          options: [
            { label: "Orta", value: "center" },
            { label: "Sol", value: "left" },
          ],
        },
        {
          name: "connectorStyle",
          type: "select",
          label: "Bağlantı Stili",
          defaultValue: "arrows",
          options: [
            { label: "Oklar", value: "arrows" },
            { label: "Çizgi", value: "line" },
            { label: "Yok", value: "none" },
          ],
        },
      ],
    },
    {
      type: "row",
      fields: [
        {
          name: "showArrows",
          type: "checkbox",
          label: "Adımlar Arasına Ok Koy (Eski Kayıt Uyumluluğu)",
          defaultValue: true,
        },
        {
          name: "animateConnectors",
          type: "checkbox",
          label: "Bağlantılara Hafif Hareket Ver",
          defaultValue: false,
        },
      ],
    },
    {
      name: "steps",
      type: "array",
      label: "Adımlar",
      minRows: 2,
      maxRows: 8,
      fields: [
        {
          type: "row",
          fields: [
            {
              name: "stepNumber",
              type: "text",
              label: "Adım No (Opsiyonel)",
              admin: { placeholder: "01" },
            },
            {
              name: "icon",
              type: "select",
              label: "İkon (Opsiyonel)",
              options: [
                { label: "Yok", value: "none" },
                { label: "Arama / Analiz", value: "search" },
                { label: "Mesaj / İletişim", value: "message" },
                { label: "Ayarlar / Planlama", value: "settings" },
                { label: "Ürün / Paket", value: "package" },
                { label: "Üretim / Teknik", value: "wrench" },
                { label: "Teslimat", value: "truck" },
                { label: "Onay", value: "check" },
                { label: "Destek", value: "headset" },
              ],
            },
          ],
        },
        {
          name: "image",
          type: "upload",
          relationTo: "media",
          label: "Adım Görseli (Opsiyonel)",
        },
        {
          name: "title",
          type: "text",
          label: "Adım Başlığı",
          required: true,
        },
        {
          name: "description",
          type: "textarea",
          label: "Açıklama",
        },
        {
          type: "row",
          fields: [
            {
              name: "linkText",
              type: "text",
              label: "Bağlantı Metni (Opsiyonel)",
            },
            {
              name: "link",
              type: "text",
              label: "Bağlantı (Opsiyonel)",
              admin: { placeholder: "/iletisim" },
            },
          ],
        },
      ],
    },
    sectionField({
      background: "light",
      spacing: "large",
      contentWidth: "wide",
    }),
  ],
};
