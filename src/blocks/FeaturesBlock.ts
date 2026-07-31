import type { Block } from "payload";
import { sectionField } from "@/fields/section";

export const FeaturesBlock: Block = {
  slug: "features",
  labels: {
    singular: "Özellik Kartları",
    plural: "Özellik Kartları",
  },
  fields: [
    {
      name: "eyebrow",
      type: "text",
      label: "Küçük Üst Başlık",
    },
    {
      name: "title",
      type: "text",
      label: "Blok Başlığı",
      admin: { placeholder: "Örn: Neden Ertip Medikal?" },
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
          defaultValue: "auto",
          options: [
            { label: "Otomatik", value: "auto" },
            { label: "Grid", value: "grid" },
            { label: "Öne Çıkan", value: "featured" },
            { label: "Kompakt", value: "compact" },
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
          name: "cardStyle",
          type: "select",
          label: "Kart Stili",
          defaultValue: "elevated",
          options: [
            { label: "Yükseltilmiş", value: "elevated" },
            { label: "Çerçeveli", value: "outlined" },
            { label: "Yumuşak Dolgu", value: "soft" },
            { label: "Minimal", value: "minimal" },
          ],
        },
        {
          name: "iconStyle",
          type: "select",
          label: "İkon Stili",
          defaultValue: "boxed",
          options: [
            { label: "Köşeli Kutu", value: "boxed" },
            { label: "Daire", value: "circle" },
            { label: "Sade", value: "plain" },
          ],
        },
      ],
    },
    {
      name: "features",
      type: "array",
      label: "Özellikler",
      minRows: 1,
      maxRows: 8,
      fields: [
        {
          type: "row",
          fields: [
            {
              name: "icon",
              type: "select",
              label: "İkon Seçimi",
              defaultValue: "star",
              options: [
                { label: "Yıldız", value: "star" },
                { label: "Kalkan / Güvenlik", value: "shield" },
                { label: "Cihaz / Teknoloji", value: "cpu" },
                { label: "Küresel / Dünya", value: "globe" },
                { label: "Kalp / Sağlık", value: "heart" },
                { label: "Ayarlar / Mühendislik", value: "settings" },
                { label: "Onay", value: "check" },
                { label: "Ödül / Kalite", value: "award" },
                { label: "Teknik Servis", value: "wrench" },
                { label: "Ürün / Paket", value: "package" },
                { label: "Teslimat", value: "truck" },
                { label: "Destek", value: "headset" },
              ],
            },
            {
              name: "accent",
              type: "select",
              label: "Vurgu Rengi",
              defaultValue: "primary",
              options: [
                { label: "Marka Rengi", value: "primary" },
                { label: "Mavi", value: "blue" },
                { label: "Turkuaz", value: "teal" },
                { label: "Amber", value: "amber" },
                { label: "Mor", value: "violet" },
                { label: "Gül", value: "rose" },
              ],
            },
          ],
        },
        {
          name: "image",
          type: "upload",
          relationTo: "media",
          label: "Kart Görseli (Opsiyonel)",
        },
        {
          name: "featureTitle",
          type: "text",
          label: "Özellik Başlığı",
          required: true,
        },
        {
          name: "featureDescription",
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
              admin: { placeholder: "Detaylı bilgi" },
            },
            {
              name: "link",
              type: "text",
              label: "Bağlantı (Opsiyonel)",
              admin: { placeholder: "/urunler" },
            },
          ],
        },
      ],
    },
    sectionField({
      background: "muted",
      spacing: "standard",
      contentWidth: "wide",
    }),
  ],
};
