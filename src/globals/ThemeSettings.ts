import { GlobalConfig } from "payload";

export const ThemeSettings: GlobalConfig = {
    slug: "themeSettings",
    label: "Tema ve Görünüm",
    access: {
        read: () => true,
    },
    fields: [
        {
            name: "colorPalette",
            type: "select",
            label: "Kurumsal Renk Paleti",
            defaultValue: "dark-luxury",
            required: true,
            options: [
                { label: "Dark Luxury (Gece Mavisi & Premium)", value: "dark-luxury" },
                { label: "Medical Blue (Kurumsal Medikal Mavi)", value: "medical-blue" },
                { label: "Medical Aqua (Mavi & Yeşil Ana Medikal Tema)", value: "medical-aqua" },
                { label: "Ocean Trust (Derin Deniz & Turkuaz)", value: "ocean" },
                { label: "Medical Emerald (Saf Zümrüt & Beyaz)", value: "emerald" },
                { label: "Clinical Mint (Hijyenik Açık Mint)", value: "clinical-mint" },
                { label: "Premium Navy (Kurumsal Lacivert & Mavi)", value: "premium-navy" },
                { label: "Surgical Teal (Klinik Teal & Beyaz)", value: "surgical-teal" },
                { label: "Ruby Premium (Yakut Kırmızısı & Antrasit)", value: "ruby" },
                { label: "Pure Black (Siyah & Premium Kontrast)", value: "pure-black" },
                { label: "Graphite Gray (Antrasit & Modern Gri)", value: "graphite-gray" },
                { label: "Platinum Silver (Açık Gri & Premium Klinik)", value: "platinum-silver" },
                { label: "Obsidian Gold (Siyah & Altın Lüks)", value: "obsidian-gold" },
                { label: "Arctic White (Beyaz & Ultra Klinik)", value: "arctic-white" },
                { label: "Royal Indigo (İndigo & Teknolojik Kurumsal)", value: "royal-indigo" },
                { label: "Corporate Steel (Çelik Gri & B2B Teknik)", value: "corporate-steel" },
                { label: "Warm Sand (Sıcak Kum & Premium Katalog)", value: "warm-sand" },
                { label: "Violet Lab (Mor & Ar-Ge Laboratuvar)", value: "violet-lab" },
                { label: "Clean Rose (Kozmetik & Estetik Premium)", value: "clean-rose" },
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
                { label: "Minimal Yuvarlak (Subtle)", value: "subtle" },
                { label: "Hafif Yuvarlak (Modern)", value: "modern" },
                { label: "Premium Dengeli (Premium)", value: "premium" },
                { label: "Yumuşak Kartlar (Soft)", value: "soft" },
                { label: "Tam Yuvarlak (Bubbly)", value: "bubbly" },
                { label: "Pill / Kapsül Form (Tam Oval)", value: "pill" },
            ],
            admin: {
                description: "Kartların, butonların ve formların ne kadar yuvarlak hatlı olacağını belirler.",
            },
        },
        // İŞTE YENİ EKLENEN CANLI ÖNİZLEME ALANI
        {
            name: "themePreview",
            type: "ui",
            admin: {
                components: {
                    // Oluşturduğumuz React bileşeninin dosya yolu
                    Field: "@/components/admin/ThemePreview",
                },
            },
        },
    ],
};