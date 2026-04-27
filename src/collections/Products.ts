import type { CollectionConfig } from 'payload'
import { metaFields } from '@/fields/meta'
import { slugField } from '@/fields/slug'

export const Products: CollectionConfig = {
    slug: 'products',
    labels: { singular: 'Ürün', plural: 'Ürünler' },
    admin: {
        useAsTitle: 'title',
        defaultColumns: ['title', 'sku', '_status'],
    },
    versions: { drafts: true },
    fields: [
        {
            type: 'tabs',
            tabs: [
                {
                    label: 'Genel Bilgiler',
                    fields: [
                        { name: 'title', type: 'text', required: true, label: 'Ürün Adı (Örn: Dijital Trikoskop)' },
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
                            fields: [{ name: 'image', type: 'upload', relationTo: 'media', required: true, label: 'Görsel Seç' }]
                        },
                        { name: 'videoUrl', type: 'text', label: 'Tanıtım Videosu (YouTube Linki)' },
                    ]
                },
                {
                    label: 'Teknik Detaylar ve Belgeler',
                    fields: [
                        {
                            name: 'specs',
                            type: 'array',
                            label: 'Teknik Özellikler',
                            fields: [
                                { name: 'key', type: 'text', required: true, label: 'Özellik Adı (Örn: Çözünürlük, Büyütme Oranı)' },
                                { name: 'value', type: 'text', required: true, label: 'Değer (Örn: 1080p, 200x)' }
                            ]
                        },
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
                    label: 'SEO Ayarları',
                    fields: [
                        metaFields, // Merkezi SEO alanımız
                    ]
                }
            ]
        },
        // --- YAN BAR (Sidebar) ALANLARI ---
        {
            name: 'sku',
            type: 'text',
            label: 'Ürün Kodu (SKU)',
            admin: { position: 'sidebar' }
        },
        {
            name: 'category',
            type: 'relationship',
            relationTo: 'categories',
            hasMany: true,
            required: true,
            label: 'Kategoriler',
            admin: { position: 'sidebar' }
        },
        {
            name: 'relatedProducts',
            type: 'relationship',
            relationTo: 'products',
            hasMany: true,
            label: 'İlişkili / Benzer Ürünler',
            admin: { position: 'sidebar' }
        },
        {
            name: 'isFeatured',
            type: 'checkbox',
            label: 'Anasayfada Öne Çıkar',
            defaultValue: false,
            admin: { position: 'sidebar' }
        },
        slugField('title'), // Akıllı URL üretici
    ],
}