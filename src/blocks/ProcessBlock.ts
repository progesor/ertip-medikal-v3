import { Block } from "payload";

export const ProcessBlock: Block = {
  slug: "process",
  labels: { singular: "Süreç Bloğu", plural: "Süreç Blokları" },
  fields: [
    {
      name: "title",
      type: "text",
      label: "Başlık",
      defaultValue: "Nasıl Çalışıyoruz?",
    },
    {
      name: "showArrows",
      type: "checkbox",
      label: "Adımlar Arasına Ok Koy",
      defaultValue: true,
    },
    {
      name: "steps",
      type: "array",
      label: "Adımlar",
      minRows: 3,
      maxRows: 5,
      admin: {
        components: {
          RowLabel: "/components/admin/AdminArrayRowLabel#AdminArrayRowLabel",
        },
      },
      fields: [
        {
          name: "stepNumber",
          type: "text",
          label: "Adım No (Örn: 01)",
          required: true,
        },
        { name: "title", type: "text", label: "Adım Başlığı", required: true },
        { name: "description", type: "textarea", label: "Açıklama" },
      ],
    },
  ],
};
