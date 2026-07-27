import type { CollectionConfig } from "payload";
import { escapeHtml, sanitizeEmailSubject } from "@/lib/security/html";

export const Inquiries: CollectionConfig = {
  slug: "inquiries",
  labels: {
    singular: "Gelen Talep",
    plural: "Gelen Talepler",
  },
  admin: {
    useAsTitle: "name",
    group: "Müşteri İletişimi",
    defaultColumns: ["name", "email", "status", "createdAt"],
  },
  access: {
    create: () => true,
    read: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => Boolean(user),
  },
  fields: [
    {
      name: "status",
      type: "select",
      defaultValue: "unread",
      options: [
        { label: "Okunmadı", value: "unread" },
        { label: "İnceleniyor", value: "pending" },
        { label: "Yanıtlandı", value: "resolved" },
      ],
      admin: { position: "sidebar" },
    },
    { name: "name", type: "text", required: true, label: "Ad Soyad" },
    { name: "email", type: "email", required: true, label: "E-Posta" },
    { name: "phone", type: "text", label: "Telefon" },
    { name: "message", type: "textarea", required: true, label: "Mesaj" },
  ],
  hooks: {
    afterChange: [
      async ({ doc, operation, req }) => {
        if (operation === "create") {
          try {
            const emailSettings = await req.payload.findGlobal({
              slug: "emailSettings",
            });
            const receivers = (emailSettings.contactReceivers ?? [])
              .map((receiver) => receiver.email)
              .filter((email): email is string => Boolean(email));

            if (receivers.length > 0) {
              const safeName = escapeHtml(doc.name);
              const safeEmail = escapeHtml(doc.email);
              const safePhone = escapeHtml(doc.phone || "-");
              const safeMessage = escapeHtml(doc.message).replace(
                /\r?\n/g,
                "<br/>",
              );

              const htmlContent = `
                <div style="font-family: sans-serif; max-width: 600px; padding: 20px;">
                  <h2>Web Sitesinden Yeni Talep Geldi</h2>
                  <p><strong>Gönderen:</strong> ${safeName}</p>
                  <p><strong>E-Posta:</strong> ${safeEmail}</p>
                  <p><strong>Telefon:</strong> ${safePhone}</p>
                  <hr/>
                  <p><strong>Mesaj:</strong><br/>${safeMessage}</p>
                </div>
              `;

              await req.payload.sendEmail({
                to: receivers.join(","),
                subject: `YENİ TALEP: ${sanitizeEmailSubject(doc.name)} - Ertip Medikal`,
                html: htmlContent,
              });
            }
          } catch (error) {
            console.error("Mail gönderme hatası:", error);
          }
        }
        return doc;
      },
    ],
  },
};
