import type { Block } from "payload";
import { sectionField } from "@/fields/section";

export const CTABlock: Block = {
  slug: "cta",
  labels: { singular: "CTA (Aksiyon) Bloğu", plural: "CTA Blokları" },
  fields: [
    {
      name: "eyebrow",
      type: "text",
      label: "Küçük Üst Başlık (Opsiyonel)",
    },
    { name: "title", type: "text", label: "Ana Slogan", required: true },
    { name: "description", type: "textarea", label: "Alt Metin" },
    {
      name: "backgroundImage",
      type: "upload",
      relationTo: "media",
      label: "Arka Plan Görseli (Opsiyonel)",
    },
    {
      type: "row",
      fields: [
        {
          name: "layoutMode",
          type: "select",
          label: "Görünüm",
          defaultValue: "card",
          options: [
            { label: "Büyük Kart", value: "card" },
            { label: "Kompakt Banner", value: "banner" },
          ],
        },
        {
          name: "alignment",
          type: "select",
          label: "İçerik Hizası",
          defaultValue: "center",
          options: [
            { label: "Sol", value: "left" },
            { label: "Orta", value: "center" },
          ],
        },
        {
          name: "theme",
          type: "select",
          label: "Renk Teması",
          defaultValue: "primary",
          options: [
            { label: "Marka Rengi", value: "primary" },
            { label: "Koyu", value: "dark" },
            { label: "Açık", value: "light" },
          ],
        },
      ],
    },
    {
      name: "buttons",
      type: "array",
      maxRows: 2,
      labels: { singular: "Buton", plural: "Butonlar" },
      fields: [
        { name: "label", type: "text", required: true, label: "Buton Metni" },
        { name: "link", type: "text", required: true, label: "Bağlantı" },
        {
          name: "style",
          type: "select",
          label: "Buton Stili",
          defaultValue: "solid",
          options: [
            { label: "Dolgulu", value: "solid" },
            { label: "İkincil", value: "secondary" },
            { label: "Çerçeveli", value: "outline" },
          ],
        },
      ],
    },
    {
      name: "trustNote",
      type: "text",
      label: "Güven Notu (Opsiyonel)",
      admin: {
        placeholder: "Örn: Ekibimiz bir iş günü içinde size dönüşür.",
      },
    },
    {
      type: "row",
      admin: { hidden: true },
      fields: [
        {
          name: "buttonText",
          type: "text",
          label: "Eski Buton Yazısı",
          defaultValue: "Bizimle İletişime Geçin",
        },
        {
          name: "buttonLink",
          type: "text",
          label: "Eski Buton Linki",
          defaultValue: "/iletisim",
        },
      ],
    },
    sectionField({
      background: "transparent",
      spacing: "compact",
      contentWidth: "wide",
    }),
  ],
};
