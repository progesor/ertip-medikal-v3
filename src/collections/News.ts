import type { CollectionConfig } from 'payload'
import { metaFields } from '@/fields/meta'
import { slugField } from '@/fields/slug'

export const News: CollectionConfig = {
    slug: 'news',
    labels: { singular: 'Haber / Duyuru', plural: 'Haberler ve Duyurular' },
    admin: {
        useAsTitle: 'title',
        defaultColumns: ['title', 'category', 'publishedDate', '_status'],
    },
    versions: { drafts: true },
    fields: [
        {
            type: 'tabs',
            tabs: [
                {
                    label: 'Haber İçeriği',
                    fields: [
                        { name: 'title', type: 'text', required: true, label: 'Başlık' },
                        { name: 'excerpt', type: 'textarea', label: 'Kısa Özet' },
                        { name: 'content', type: 'richText', required: true, label: 'Detaylı İçerik' },
                    ],
                },
                {
                    label: 'Medya ve Galeri',
                    fields: [
                        { name: 'image', type: 'upload', relationTo: 'media', required: true, label: 'Kapak Görseli' },
                        {
                            name: 'gallery',
                            type: 'array',
                            label: 'Etkinlik / Fuar Galerisi (Opsiyonel)',
                            fields: [
                                { name: 'image', type: 'upload', relationTo: 'media', required: true, label: 'Görsel Seç' }
                            ]
                        },
                    ],
                },
                {
                    label: 'SEO Ayarları',
                    fields: [
                        metaFields,
                    ],
                },
            ],
        },
        // Yan Bar (Sidebar)
        {
            name: 'category',
            type: 'relationship',
            relationTo: 'news-categories' as any,
            label: 'Kategori',
            admin: { position: 'sidebar' }
        },
        {
            name: 'publishedDate',
            type: 'date',
            required: true,
            label: 'Yayın Tarihi',
            admin: { position: 'sidebar' }
        },
        slugField('title'),
    ],
}