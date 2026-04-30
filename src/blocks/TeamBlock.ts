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
      name: "members",
      type: "array",
      label: "Ekip Üyeleri",
      minRows: 1,
      admin: {
        initCollapsed: true,
        components: {
          RowLabel: "/components/admin/AdminArrayRowLabel#AdminArrayRowLabel",
        },
      },
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
