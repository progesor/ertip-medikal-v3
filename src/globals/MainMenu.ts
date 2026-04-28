import type { GlobalConfig } from "payload";

export const MainMenu: GlobalConfig = {
  slug: "main-menu",
  label: "Ana Menü",
  access: {
    read: () => true, // Frontend'in okuyabilmesi için herkese açık
  },
  fields: [
    {
      name: "items",
      type: "array",
      label: "Menü Linkleri",
      labels: {
        singular: "Link",
        plural: "Linkler",
      },
      fields: [
        {
          name: "label",
          type: "text",
          required: true,
          label: "Menüde Görünecek İsim (Örn: Hakkımızda, Ürünler)",
        },
        {
          name: "type",
          type: "radio",
          defaultValue: "reference",
          options: [
            {
              label: "İç Sayfa (Dinamik Pages Koleksiyonu)",
              value: "reference",
            },
            { label: "Özel Link (Manuel URL)", value: "custom" },
          ],
        },
        {
          name: "reference",
          type: "relationship",
          relationTo: "pages",
          label: "Bağlanacak Sayfa",
          admin: {
            condition: (_, siblingData) => siblingData?.type === "reference",
          },
        },
        {
          name: "url",
          type: "text",
          label: "URL (Örn: /urunler veya https://...)",
          admin: {
            condition: (_, siblingData) => siblingData?.type === "custom",
          },
        },
      ],
    },
  ],
};
