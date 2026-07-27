import type { CollectionConfig } from "payload";
import { escapeHtml, sanitizeEmailSubject } from "@/lib/security/html";

export const QuoteRequests: CollectionConfig = {
  slug: "quote-requests",
  labels: { singular: "Teklif Talebi", plural: "Teklif Talepleri" },
  admin: {
    useAsTitle: "customerName",
    group: "Müşteri İletişimi",
    defaultColumns: ["customerName", "company", "createdAt", "status"],
  },
  access: {
    create: () => true,
    read: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => Boolean(user),
  },
  fields: [
    {
      type: "row",
      fields: [
        {
          name: "customerName",
          type: "text",
          label: "Müşteri / Yetkili Adı",
          required: true,
          admin: { width: "50%" },
        },
        {
          name: "company",
          type: "text",
          label: "Firma / Klinik Adı",
          admin: { width: "50%" },
        },
      ],
    },
    {
      type: "row",
      fields: [
        {
          name: "email",
          type: "email",
          label: "E-Posta Adresi",
          required: true,
          admin: { width: "50%" },
        },
        {
          name: "phone",
          type: "text",
          label: "Telefon Numarası",
          required: true,
          admin: { width: "50%" },
        },
      ],
    },
    {
      name: "message",
      type: "textarea",
      label: "Müşteri Notu / Özel İstekler",
    },
    {
      name: "status",
      type: "select",
      label: "Talep Durumu",
      defaultValue: "new",
      options: [
        { label: "🔴 Yeni Talep", value: "new" },
        { label: "🟡 İnceleniyor", value: "reviewing" },
        { label: "🟢 Fiyat Verildi", value: "quoted" },
        { label: "⚫ Kapandı / İptal", value: "closed" },
      ],
      admin: { position: "sidebar" },
    },
    {
      name: "items",
      type: "array",
      label: "Talep Edilen Ürünler",
      required: true,
      fields: [
        { name: "productTitle", type: "text", label: "Ürün Adı" },
        { name: "variantInfo", type: "text", label: "Seçilen Model / Varyant" },
        { name: "sku", type: "text", label: "Ürün Kodu (SKU)" },
        { name: "quantity", type: "number", label: "Adet", defaultValue: 1 },
      ],
    },
  ],
  hooks: {
    afterChange: [
      async ({ doc, operation, req }) => {
        if (operation === "create") {
          try {
            const emailSettings = await req.payload.findGlobal({
              slug: "emailSettings",
            });
            const receivers = (emailSettings.quoteReceivers ?? [])
              .map((receiver) => receiver.email)
              .filter((email): email is string => Boolean(email));

            if (receivers.length > 0) {
              const itemRows = (doc.items ?? [])
                .map((item) => {
                  const variant = item.variantInfo
                    ? ` — ${escapeHtml(item.variantInfo)}`
                    : "";

                  return `<li>${escapeHtml(item.quantity ?? 1)}x ${escapeHtml(item.productTitle)}${variant} (SKU: ${escapeHtml(item.sku || "-")})</li>`;
                })
                .join("");
              const safeMessage = escapeHtml(doc.message || "-").replace(
                /\r?\n/g,
                "<br/>",
              );

              const htmlContent = `
                <div style="font-family: sans-serif; max-width: 700px; padding: 20px;">
                  <h2>Yeni Bir B2B Teklif Talebi Geldi!</h2>
                  <p><strong>Müşteri:</strong> ${escapeHtml(doc.customerName)}</p>
                  <p><strong>Firma:</strong> ${escapeHtml(doc.company || "Belirtilmedi")}</p>
                  <p><strong>E-Posta:</strong> ${escapeHtml(doc.email)}</p>
                  <p><strong>Telefon:</strong> ${escapeHtml(doc.phone)}</p>
                  <hr/>
                  <h3>Talep Edilen Ürünler:</h3>
                  <ul>${itemRows}</ul>
                  <p><strong>Not:</strong> ${safeMessage}</p>
                </div>
              `;

              await req.payload.sendEmail({
                to: receivers.join(","),
                subject: `YENİ TEKLİF: ${sanitizeEmailSubject(doc.customerName)} - Ertip Medikal`,
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
