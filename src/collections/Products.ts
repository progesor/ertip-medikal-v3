import type { CollectionConfig } from 'payload'

export const Products: CollectionConfig = {
    slug: 'products',
    labels: { singular: 'Ürün', plural: 'Ürünler' },
    admin: {
        useAsTitle: 'title',
        defaultColumns: ['title', 'sku', 'status'],
    },
    versions: { drafts: true },
    fields: [
        {
            type: 'tabs',
            tabs: [
                {
                    label: 'Genel Bilgiler',
                    fields: [
                        {
                            type: 'row',
                            fields: [
                                { name: 'title', type: 'text', required: true, label: 'Ürün Adı (Örn: Dijital Trikoskop)' },
                                { name: 'sku', type: 'text', label: 'Ürün Kodu (SKU)' },
                            ]
                        },
                        { name: 'slug', type: 'text', required: true, unique: true, label: 'URL Yolu' },
                        { name: 'shortDescription', type: 'textarea', label: 'Kısa Özet', maxLength: 300 },
                        { name: 'description', type: 'richText', label: 'Detaylı Açıklama' },
                    ]
                },
                {
                    label: 'Görseller ve Medya',
                    fields: [
                        { name: 'mainImage', type: 'upload', relationTo: 'media', required: true, label: 'Ana Görsel' },
                        {
                            name: 'gallery',
                            type: 'array',
                            label: 'Ürün Galerisi',
                            fields: [{ name: 'image', type: 'upload', relationTo: 'media', required: true }]
                        },
                        { name: 'videoUrl', type: 'text', label: 'Tanıtım Videosu (YouTube Linki)' },
                        {
                            name: 'documents',
                            type: 'array',
                            label: 'Broşür ve Kullanım Kılavuzları (PDF)',
                            fields: [
                                { name: 'title', type: 'text', required: true, label: 'Belge Adı' },
                                { name: 'file', type: 'upload', relationTo: 'media', required: true, label: 'Dosya Seç' }
                            ]
                        }
                    ]
                },
                {
                    label: 'Kategorizasyon ve Özellikler',
                    fields: [
                        { name: 'category', type: 'relationship', relationTo: 'categories', hasMany: true, required: true, label: 'Kategoriler' },
                        { name: 'relatedProducts', type: 'relationship', relationTo: 'products', hasMany: true, label: 'İlişkili / Benzer Ürünler' },
                        {
                            name: 'specs',
                            type: 'array',
                            label: 'Teknik Özellikler',
                            fields: [
                                { name: 'key', type: 'text', required: true, label: 'Özellik Adı (Örn: Çözünürlük, Büyütme Oranı)' },
                                { name: 'value', type: 'text', required: true, label: 'Değer (Örn: 1080p, 200x)' }
                            ]
                        },
                    ]
                }
            ]
        },
        // Sidebar Alanları
        {
            name: 'isFeatured',
            type: 'checkbox',
            label: 'Anasayfada Öne Çıkar',
            defaultValue: false,
            admin: { position: 'sidebar' }
        }
    ],
}