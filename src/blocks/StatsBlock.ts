import type { Block } from "payload";
import { sectionField } from "@/fields/section";

export const StatsBlock: Block = {
  slug: "stats",
  labels: { singular: "İstatistik Bloğu", plural: "İstatistik Blokları" },
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
          defaultValue: "cards",
          options: [
            { label: "Kartlar", value: "cards" },
            { label: "Güven Bandı", value: "band" },
            { label: "Minimal", value: "minimal" },
          ],
        },
        {
          name: "columns",
          type: "select",
          label: "Masaüstü Sütun Sayısı",
          defaultValue: "auto",
          options: [
            { label: "Otomatik", value: "auto" },
            { label: "2 Sütun", value: "two" },
            { label: "3 Sütun", value: "three" },
            { label: "4 Sütun", value: "four" },
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
      ],
    },
    {
      type: "row",
      fields: [
        {
          name: "animateValues",
          type: "checkbox",
          label: "Sayısal Değerleri Animasyonla Göster",
          defaultValue: false,
        },
        {
          name: "showDividers",
          type: "checkbox",
          label: "Öğeler Arasında Ayırıcı Göster",
          defaultValue: true,
        },
      ],
    },
    {
      name: "stats",
      type: "array",
      label: "Rakamlar",
      minRows: 1,
      maxRows: 8,
      fields: [
        {
          name: "icon",
          type: "select",
          label: "İkon (Opsiyonel)",
          options: [
            { label: "Yok", value: "none" },
            { label: "Takvim / Deneyim", value: "calendar" },
            { label: "Küresel / Ülke", value: "globe" },
            { label: "Ürün / Paket", value: "package" },
            { label: "Kullanıcı / Müşteri", value: "users" },
            { label: "Ödül / Kalite", value: "award" },
            { label: "Kalkan / Güven", value: "shield" },
            { label: "Teslimat", value: "truck" },
          ],
        },
        {
          type: "row",
          fields: [
            {
              name: "prefix",
              type: "text",
              label: "Ön Ek",
              admin: { placeholder: "+" },
            },
            {
              name: "value",
              type: "text",
              label: "Değer",
              required: true,
              admin: { placeholder: "25" },
            },
            {
              name: "suffix",
              type: "text",
              label: "Son Ek",
              admin: { placeholder: "+ / % / ülke" },
            },
          ],
        },
        {
          name: "label",
          type: "text",
          label: "Etiket",
          required: true,
          admin: { placeholder: "Yıllık deneyim" },
        },
        {
          name: "note",
          type: "textarea",
          label: "Kısa Açıklama / Veri Notu (Opsiyonel)",
        },
      ],
    },
    sectionField({
      background: "primary",
      spacing: "compact",
      contentWidth: "wide",
    }),
  ],
};
