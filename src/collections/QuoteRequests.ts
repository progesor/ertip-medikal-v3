import type { CollectionConfig } from "payload";

export const QuoteRequests: CollectionConfig = {
  slug: "quote-requests",
  labels: { singular: "Teklif Talebi", plural: "Teklif Talepleri" },
  admin: {
    useAsTitle: "customerName",
    group: "Müşteri İletişimi",
    defaultColumns: ["customerName", "company", "createdAt", "status"],
  },
  // Dışarıdan form gönderilebilmesi için yetkileri açıyoruz
  access: {
    create: () => true,
    read: ({ req: { user } }) => Boolean(user), // Sadece admin okuyabilir
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
        // Sadece YENİ bir teklif oluşturulduğunda çalıştır (güncellemelerde mail atma)
        if (operation === "create") {
          try {
            // 1. Admin panelinden ayarladığımız "Alıcılar" listesini çek
            const emailSettings = await req.payload.findGlobal({
              slug: "emailSettings",
            });

            // Eğer alıcı girilmemişse boş bir dizi döndür
            const receivers =
              emailSettings.quoteReceivers?.map((r: any) => r.email) || [];

            if (receivers.length > 0) {
              // 2. Mail içeriğini oluştur (Şık bir HTML formatı)
              const htmlContent = `
                <h2>Yeni Bir B2B Teklif Talebi Geldi!</h2>
                <p><strong>Müşteri:</strong> ${doc.customerName}</p>
                <p><strong>Firma:</strong> ${doc.company || "Belirtilmedi"}</p>
                <p><strong>E-Posta:</strong> ${doc.email}</p>
                <p><strong>Telefon:</strong> ${doc.phone}</p>
                <hr/>
                <h3>Talep Edilen Ürünler:</h3>
                <ul>
                  ${doc.items.map((item: any) => `<li>${item.quantity}x ${item.productTitle} (SKU: ${item.sku})</li>`).join("")}
                </ul>
                <p><strong>Not:</strong> ${doc.message || "-"}</p>
              `;

              // 3. Payload'un dahili sistemiyle maili gönder
              await req.payload.sendEmail({
                to: receivers.join(","), // [satis@..., info@...] listesini stringe çevirir
                subject: `YENİ TEKLİF: ${doc.customerName} - Ertıp Medikal`,
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
