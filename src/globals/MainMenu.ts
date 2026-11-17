import type { GlobalConfig } from "payload";

export const MainMenu: GlobalConfig = {
  slug: "main-menu",
  label: "Ana Menü",
  admin: {
    group: "Site Yapılandırması",
  },
  access: {
    read: () => true, // Frontend'in okuyabilmesi için herkese açık
  },
  fields: [
    {
      name: "menuPreview",
      type: "ui",
      admin: {
        components: {
          Field: "/components/admin/MenuPreview#MenuPreview",
        },
      },
    },
    {
      name: "items",
      type: "array",
      label: "Menü bağlantıları",
      admin: {
        initCollapsed: true,
        components: {
          RowLabel: "/components/admin/AdminArrayRowLabel#AdminArrayRowLabel",
        },
      },
      labels: {
        singular: "Bağlantı",
        plural: "Bağlantılar",
      },
      fields: [
        {
          name: "label",
          type: "text",
          required: true,
          label: "Menüde görünen ad",
        },
        {
          name: "type",
          type: "radio",
          label: "Bağlantı hedefi",
          defaultValue: "reference",
          options: [
            {
              label: "Sitedeki bir sayfa",
              value: "reference",
            },
            { label: "Başka bir adres", value: "custom" },
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
          label: "Bağlantı adresi",
          admin: {
            condition: (_, siblingData) => siblingData?.type === "custom",
          },
        },
      ],
    },
  ],
};
