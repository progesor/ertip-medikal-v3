import { Block } from "payload";

export const NewsFeedBlock: Block = {
    slug: "newsFeed",
    labels: { singular: "Haber ve Etkinlik Akışı", plural: "Haber Akış Blokları" },
    fields: [
        {
            name: "title",
            type: "text",
            label: "Blok Başlığı",
            defaultValue: "Haberler ve Etkinlikler",
        },
        {
            name: "description",
            type: "textarea",
            label: "Açıklama",
            defaultValue: "Ertip Medikal'in katıldığı uluslararası fuarlar, eğitimler ve en güncel duyurular.",
        },
        {
            name: "limit",
            type: "number",
            label: "Gösterilecek Maksimum Haber Sayısı (Örn: Tüm sayfa için 50, Anasayfa vitrini için 3)",
            defaultValue: 20,
        },
        {
            name: "showFilters",
            type: "checkbox",
            label: "Kategori Filtrelerini Göster",
            defaultValue: true,
            admin: {
                description: "Anasayfa gibi vitrin kullanımlarında filtreleri gizlemek için tiki kaldırın.",
            }
        }
    ],
};