import { Block } from "payload";

export const CertificateGridBlock: Block = {
  slug: "certificateGrid",
  labels: { singular: "Sertifika Galerisi", plural: "Sertifika Galerileri" },
  fields: [
    {
      name: "title",
      type: "text",
      label: "Blok Başlığı",
      defaultValue: "Kalite ve Başarı Sertifikalarımız",
    },
    {
      name: "certificates",
      type: "array",
      label: "Sertifikalar",
      fields: [
        {
          type: 'row',
          fields: [
            { name: "name", type: "text", label: "Sertifika Adı", required: true, admin: { width: '50%' } },
            { name: "issuer", type: "text", label: "Düzenleyen Kurum", admin: { width: '50%' } },
          ]
        },
        {
          type: 'row',
          fields: [
            {
              name: "image",
              type: "upload",
              relationTo: "media",
              required: true,
              label: "Kapak Görseli / Mühür (Kartta Görünecek)",
              admin: { width: '50%' }
            },
            {
              name: "document",
              type: "upload",
              relationTo: "media",
              label: "Orijinal Sertifika (PDF)",
              admin: { width: '50%' }
            },
          ]
        },
        {
          name: "description",
          type: "textarea",
          label: "Sertifika Açıklaması"
        },
      ],
    },
  ],
};