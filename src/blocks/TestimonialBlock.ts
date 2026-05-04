import { Block } from "payload";

export const TestimonialBlock: Block = {
  slug: "testimonial",
  labels: { singular: "Müşteri Yorumu", plural: "Müşteri Yorumları" },
  fields: [
    { name: "title", type: "text", label: "Bölüm Başlığı" },
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
      name: "testimonials",
      type: "array",
      label: "Yorumlar",
      fields: [
        { name: "name", type: "text", label: "İsim / Ünvan", required: true },
        { name: "content", type: "textarea", label: "Yorum", required: true },
        {
          name: "avatar",
          type: "upload",
          relationTo: "media",
          label: "Profil Fotoğrafı",
        },
      ],
    },
  ],
};
