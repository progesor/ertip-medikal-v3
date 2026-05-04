import { Block } from "payload";

export const TeamBlock: Block = {
  slug: "team",
  labels: { singular: "Ekip Bloğu", plural: "Ekip Blokları" },
  fields: [
    {
      name: "title",
      type: "text",
      label: "Bölüm Başlığı",
      defaultValue: "Uzman Kadromuz",
    },
    {
      name: "layoutMode",
      type: "select",
      label: "Yerleşim Modu",
      defaultValue: "auto",
      options: [
        { label: "Otomatik", value: "auto" },
        { label: "Öne Çıkan", value: "featured" },
        { label: "Grid", value: "grid" },
      ],
    },
    {
      name: "members",
      type: "array",
      label: "Ekip Üyeleri",
      minRows: 1,
      fields: [
        { name: "name", type: "text", label: "İsim Soyisim", required: true },
        { name: "role", type: "text", label: "Ünvan / Görev", required: true },
        {
          name: "image",
          type: "upload",
          relationTo: "media",
          label: "Profil Fotoğrafı",
        },
        { name: "linkedin", type: "text", label: "LinkedIn Linki (Opsiyonel)" },
      ],
    },
  ],
};
