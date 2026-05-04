import { GlobalConfig } from "payload";

export const ThemeSettings: GlobalConfig = {
    slug: "themeSettings",
    label: "Tema ve Görünüm",
    access: {
        read: () => true, // Ziyaretçilerin temayı görebilmesi için açık olmalı
    },
    fields: [
        {
            name: "colorPalette",
            type: "select",
            label: "Kurumsal Renk Paleti",
            defaultValue: "dark-luxury",
            required: true,
            options: [
                { label: "Dark Luxury (Gece Mavisi & Altın - Varsayılan)", value: "dark-luxury" },
                { label: "Ocean Trust (Derin Deniz & Turkuaz)", value: "ocean" },
                { label: "Medical Emerald (Saf Zümrüt & Beyaz)", value: "emerald" },
                { label: "Ruby Premium (Yakut Kırmızısı & Antrasit)", value: "ruby" },
            ],
            admin: {
                description: "Sitenin genel kurumsal kimliğini ve vurgu renklerini belirler.",
            },
        },
        {
            name: "borderRadius",
            type: "select",
            label: "Köşe ve Form Tarzı (Border Radius)",
            defaultValue: "bubbly",
            required: true,
            options: [
                { label: "Keskin ve Ciddi (Sharp - 0px)", value: "sharp" },
                { label: "Hafif Yuvarlak (Modern - 8px)", value: "modern" },
                { label: "Tam Yuvarlak (Soft / Bubbly - 2rem)", value: "bubbly" },
            ],
            admin: {
                description: "Kartların, butonların ve formların ne kadar yuvarlak hatlı olacağını belirler.",
            },
        },
    ],
};