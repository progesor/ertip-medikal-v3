import type { CollectionConfig } from 'payload'

export const News: CollectionConfig = {
    slug: 'news',
    labels: {
        singular: 'Haber / Duyuru',
        plural: 'Haberler ve Duyurular',
    },
    admin: {
        useAsTitle: 'title',
    },
    versions: { drafts: true },
    fields: [
        { name: 'title', type: 'text', required: true, label: 'Başlık' },
        { name: 'publishedDate', type: 'date', required: true, label: 'Yayın Tarihi', admin: { position: 'sidebar' } },
        { name: 'image', type: 'upload', relationTo: 'media', required: true, label: 'Kapak Görseli' },
        { name: 'excerpt', type: 'textarea', label: 'Kısa Özet' },
        { name: 'content', type: 'richText', required: true, label: 'İçerik' },
    ],
}