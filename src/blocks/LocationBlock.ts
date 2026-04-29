import { Block } from "payload";

export const LocationBlock: Block = {
  slug: "location",
  labels: { singular: "Lokasyon ve İletişim", plural: "Lokasyon Blokları" },
  fields: [
    {
      name: "title",
      type: "text",
      label: "Ana Başlık",
      defaultValue: "Tesislerimiz ve İletişim Bilgileri",
    },
    {
      name: "locations",
      type: "array",
      label: "Lokasyonlar / Ofisler",
      minRows: 1,
      fields: [
        { name: "title", type: "text", label: "Tesis Adı (Örn: Merkez Ofis - Şişli)", required: true },
        { name: "address", type: "textarea", label: "Açık Adres", required: true },
        {
          type: "row",
          fields: [
            { name: "phone", type: "text", label: "Telefon", admin: { width: "33%" } },
            { name: "email", type: "text", label: "E-Posta", admin: { width: "33%" } },
            { name: "workingHours", type: "text", label: "Çalışma Saatleri", admin: { width: "34%" } },
          ]
        },
        {
          name: "mapUrl",
          type: "text",
          label: "Google Maps Embed Linki",
          admin: { description: 'Harita Yerleştirme (Embed) kısmındaki src="" içindeki linki buraya yapıştırın.' },
        },
      ],
    },
  ],
};