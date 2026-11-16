import { Block } from "payload";

export const LogoSliderBlock: Block = {
  slug: "logoSlider",
  labels: {
    singular: "Marka/Sertifika Bandı",
    plural: "Marka/Sertifika Bantları",
  },
  fields: [
    {
      name: "title",
      type: "text",
      label: "Başlık (Opsiyonel)",
      admin: { placeholder: "Örn: Birlikte Çalıştığımız Markalar" },
    },
    {
      name: "logos",
      type: "array",
      label: "Logolar ve Sertifikalar",
      minRows: 3,
      admin: {
        components: {
          RowLabel: "/components/admin/AdminArrayRowLabel#AdminArrayRowLabel",
        },
      },
      fields: [
        {
          name: "logo",
          type: "upload",
          relationTo: "media",
          required: true,
          label: "Logo Görseli",
        },
      ],
    },
  ],
};
