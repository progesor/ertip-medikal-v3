import type { Block } from "payload";

export const HeroBlock: Block = {
  slug: "hero",
  labels: { singular: "Hero Alanı", plural: "Hero Alanları" },
  fields: [
    { name: "heading", type: "text", required: true, label: "Ana Başlık" },
    { name: "subheading", type: "textarea", label: "Alt Başlık / Açıklama" },
    {
      name: "backgroundImage",
      type: "upload",
      relationTo: "media",
      label: "Arkaplan Görseli",
    },
    {
      name: "buttons",
      type: "array",
      maxRows: 2,
      labels: { singular: "Buton", plural: "Butonlar" },
      admin: {
        initCollapsed: true,
        components: {
          RowLabel: "/components/admin/AdminArrayRowLabel#AdminArrayRowLabel",
        },
      },
      fields: [
        { name: "label", type: "text", required: true },
        { name: "link", type: "text", required: true },
      ],
    },
  ],
};
