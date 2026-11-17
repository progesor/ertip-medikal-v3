import type { ArrayField, GlobalConfig } from "payload";

function recipientList(
  name: string,
  label: string,
  description: string,
): ArrayField {
  return {
    name,
    type: "array",
    label,
    labels: { singular: "Alıcı", plural: "Alıcılar" },
    admin: {
      description,
      components: {
        RowLabel: "/components/admin/AdminArrayRowLabel#AdminArrayRowLabel",
      },
    },
    fields: [
      { name: "email", type: "email", required: true, label: "E-posta adresi" },
    ],
  };
}

export const EmailSettings: GlobalConfig = {
  slug: "emailSettings",
  label: "E-posta yönlendirmeleri",
  admin: { group: "Sistem" },
  access: { read: ({ req }) => Boolean(req.user) },
  fields: [
    recipientList(
      "quoteReceivers",
      "Teklif taleplerini alacak kişiler",
      "Bir müşteri teklif istediğinde bu kişilere e-posta gönderilir.",
    ),
    recipientList(
      "contactReceivers",
      "İletişim mesajlarını alacak kişiler",
      "Sitedeki iletişim formuna gelen mesajlar bu kişilere iletilir.",
    ),
  ],
};
