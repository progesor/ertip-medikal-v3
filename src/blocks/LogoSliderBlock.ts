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
