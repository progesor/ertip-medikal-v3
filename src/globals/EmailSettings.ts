import type { GlobalConfig } from "payload";

export const EmailSettings: GlobalConfig = {
  slug: "emailSettings",
  label: "E-Posta Yönlendirmeleri",
  admin: {
    group: "Sistem",
  },
  access: {
    // Bildirim alıcıları dahili yapılandırmadır; public API üzerinden okunmamalıdır.
    read: ({ req }) => Boolean(req.user),
  },
  fields: [
    {
      type: "tabs",
      tabs: [
        {
          label: "Teklif Sepeti (B2B)",
          description:
            "Müşteriler sepet üzerinden teklif istediğinde bildirim gidecek e-posta adresleri.",
          fields: [
            {
              name: "quoteReceivers",
              type: "array",
              label: "Alıcı E-Posta Adresleri",
              labels: { singular: "Alıcı", plural: "Alıcılar" },
              fields: [
                {
                  name: "email",
                  type: "email",
                  required: true,
                  label: "E-Posta Adresi",
                },
              ],
            },
          ],
        },
        {
          label: "İletişim Formları",
          description:
            "Sitedeki genel iletişim formları doldurulduğunda bildirim gidecek adresler.",
          fields: [
            {
              name: "contactReceivers",
              type: "array",
              label: "Alıcı E-Posta Adresleri",
              labels: { singular: "Alıcı", plural: "Alıcılar" },
              fields: [
                {
                  name: "email",
                  type: "email",
                  required: true,
                  label: "E-Posta Adresi",
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};
