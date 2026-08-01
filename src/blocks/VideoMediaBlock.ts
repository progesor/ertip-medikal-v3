import type { Block } from "payload";
import { sectionField } from "@/fields/section";

export const VideoMediaBlock: Block = {
  slug: "videoMedia",
  labels: {
    singular: "Video ve Medya",
    plural: "Video ve Medya Blokları",
  },
  fields: [
    { name: "eyebrow", type: "text", label: "Küçük Üst Başlık" },
    { name: "title", type: "text", label: "Başlık" },
    { name: "subtitle", type: "textarea", label: "Kısa Açıklama" },
    {
      name: "content",
      type: "richText",
      label: "Detaylı İçerik (Opsiyonel)",
    },
    {
      type: "row",
      fields: [
        {
          name: "sourceType",
          type: "select",
          label: "Video Kaynağı",
          defaultValue: "external",
          options: [
            { label: "YouTube / Vimeo", value: "external" },
            { label: "Yüklenen Video", value: "upload" },
          ],
        },
        {
          name: "layoutMode",
          type: "select",
          label: "Yerleşim",
          defaultValue: "full",
          options: [
            { label: "Tam Genişlik", value: "full" },
            { label: "Video ve Metin Yan Yana", value: "split" },
          ],
        },
        {
          name: "mediaPosition",
          type: "select",
          label: "Video Konumu",
          defaultValue: "left",
          options: [
            { label: "Solda", value: "left" },
            { label: "Sağda", value: "right" },
          ],
          admin: {
            condition: (_, siblingData) => siblingData?.layoutMode === "split",
          },
        },
      ],
    },
    {
      name: "externalUrl",
      type: "text",
      label: "YouTube / Vimeo Bağlantısı",
      admin: {
        condition: (_, siblingData) => siblingData?.sourceType !== "upload",
        placeholder: "https://www.youtube.com/watch?v=...",
        description: "Yalnızca YouTube veya Vimeo bağlantıları gömülür.",
      },
    },
    {
      name: "videoFile",
      type: "upload",
      relationTo: "media",
      label: "Video Dosyası",
      admin: {
        condition: (_, siblingData) => siblingData?.sourceType === "upload",
        description: "MP4, WebM veya OGG video dosyası seçin.",
      },
    },
    {
      name: "poster",
      type: "upload",
      relationTo: "media",
      label: "Poster Görseli (Opsiyonel)",
      admin: {
        description: "Video başlamadan önce gösterilecek kapak görseli.",
      },
    },
    {
      type: "row",
      fields: [
        {
          name: "aspectRatio",
          type: "select",
          label: "Video Oranı",
          defaultValue: "16:9",
          options: [
            { label: "16:9", value: "16:9" },
            { label: "4:3", value: "4:3" },
            { label: "Kare", value: "1:1" },
            { label: "Dikey", value: "9:16" },
          ],
        },
        {
          name: "frameStyle",
          type: "select",
          label: "Çerçeve Stili",
          defaultValue: "elevated",
          options: [
            { label: "Yükseltilmiş", value: "elevated" },
            { label: "Çerçeveli", value: "outlined" },
            { label: "Çerçevesiz", value: "plain" },
          ],
        },
        {
          name: "alignment",
          type: "select",
          label: "Başlık Hizası",
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
          name: "controls",
          type: "checkbox",
          label: "Kontrolleri Göster",
          defaultValue: true,
        },
        {
          name: "autoplay",
          type: "checkbox",
          label: "Otomatik Oynat",
          defaultValue: false,
          admin: {
            description: "Tarayıcı kuralları gereği otomatik oynatma sessiz başlar.",
          },
        },
        {
          name: "loop",
          type: "checkbox",
          label: "Tekrarla",
          defaultValue: false,
        },
        {
          name: "muted",
          type: "checkbox",
          label: "Sessiz Başlat",
          defaultValue: false,
        },
      ],
    },
    {
      name: "caption",
      type: "text",
      label: "Video Altyazısı / Açıklaması",
    },
    {
      name: "buttonText",
      type: "text",
      label: "Buton Metni (Opsiyonel)",
    },
    {
      name: "buttonLink",
      type: "text",
      label: "Buton Bağlantısı (Opsiyonel)",
      admin: { placeholder: "/iletisim" },
    },
    sectionField({
      background: "light",
      spacing: "large",
      contentWidth: "wide",
    }),
  ],
};
