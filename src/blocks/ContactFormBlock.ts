import { Block } from "payload";

export const ContactFormBlock: Block = {
    slug: "contactForm",
    labels: { singular: "İletişim ve Talep Bloğu", plural: "İletişim Blokları" },
    fields: [
        {
            type: "row",
            fields: [
                { name: "title", type: "text", label: "Blok Başlığı", defaultValue: "Bize Ulaşın", admin: { width: "50%" } },
                { name: "formTitle", type: "text", label: "Form Başlığı", defaultValue: "Talep Formu", admin: { width: "50%" } },
            ],
        },
        { name: "description", type: "textarea", label: "Kısa Açıklama" },
        {
            name: "departments",
            type: "array",
            label: "İletişim Konuları / Departmanlar",
            admin: {
                components: {
                    RowLabel: "/components/admin/AdminArrayRowLabel#AdminArrayRowLabel",
                },
                description: "Kullanıcının formda seçebileceği departmanları belirleyin.",
            },
            fields: [{ name: "label", type: "text", label: "Departman Adı (Örn: Teknik Servis, İhracat)" }],
        },
        {
            name: "quickContact",
            type: "group",
            label: "Hızlı İletişim Bilgileri (Sol Panel)",
            fields: [
                { name: "phone", type: "text", label: "Acil Destek Hattı" },
                { name: "email", type: "text", label: "Genel E-Posta" },
                { name: "descriptionText", type: "textarea", label: "Güven Metni", defaultValue: "Tüm teknik servis talepleri kalite standartlarında kayıt altına alınır." },
            ],
        },
    ],
};
