import type { Block } from "payload";

export const MediaTextBlock: Block = {
  slug: "mediaText",
  labels: {
    singular: "Görsel ve Metin",
    plural: "Görsel ve Metin Blokları",
  },
  fields: [
    {
      name: "eyebrow",
      type: "text",
      label: "Küçük Üst Başlık",
      admin: {
        placeholder: "Örn: Kurumsal Hikâyemiz",
        description:
          "Ana başlığın üzerinde küçük vurgu metni olarak gösterilir.",
      },
    },
    {
      name: "title",
      type: "text",
      required: true,
      label: "Ana Başlık",
    },
    {
      name: "content",
      type: "richText",
      required: true,
      label: "İçerik",
    },
    {
      name: "image",
      type: "upload",
      relationTo: "media",
      required: true,
      label: "Görsel",
    },
    {
      type: "row",
      fields: [
        {
          name: "imagePosition",
          type: "select",
          label: "Görsel Konumu",
          defaultValue: "left",
          options: [
            { label: "Solda", value: "left" },
            { label: "Sağda", value: "right" },
          ],
        },
        {
          name: "imageFit",
          type: "select",
          label: "Görsel Yerleşimi",
          defaultValue: "cover",
          options: [
            { label: "Alanı Doldur", value: "cover" },
            { label: "Görselin Tamamını Göster", value: "contain" },
          ],
        },
        {
          name: "theme",
          type: "select",
          label: "Arka Plan Teması",
          defaultValue: "light",
          options: [
            { label: "Açık", value: "light" },
            { label: "Yumuşak Gri", value: "muted" },
            { label: "Koyu", value: "dark" },
          ],
        },
      ],
    },
    {
      name: "highlight",
      type: "textarea",
      label: "Vurgu Kutusu (Opsiyonel)",
      admin: {
        description:
          "Kısa bir kurumsal mesaj veya önemli bilgi için kullanılır.",
      },
    },
    {
      type: "row",
      fields: [
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
      ],
    },
  ],
};
