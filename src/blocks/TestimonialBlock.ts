import { Block } from "payload";

export const TestimonialBlock: Block = {
  slug: "testimonial",
  labels: { singular: "Müşteri Yorumu", plural: "Müşteri Yorumları" },
  fields: [
    { name: "title", type: "text", label: "Bölüm Başlığı" },
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
