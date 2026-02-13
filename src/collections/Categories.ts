import type { CollectionConfig } from 'payload'

export const Categories: CollectionConfig = {
    slug: 'categories',
    labels: { singular: 'Kategori', plural: 'Kategoriler' },
    admin: { useAsTitle: 'title' },
    fields: [
        { name: 'title', type: 'text', required: true, label: 'Kategori Adı' },
        { name: 'slug', type: 'text', unique: true, required: true, admin: { position: 'sidebar' } },
        {
            name: 'parent',
            type: 'relationship',
            relationTo: 'categories',
            label: 'Üst Kategori (Alt Kategori Yaratmak İçin)',
            admin: { position: 'sidebar' }
        },
        { name: 'description', type: 'textarea', label: 'Kategori Kısa Açıklaması' },
        { name: 'image', type: 'upload', relationTo: 'media', label: 'Kategori Görseli' },
    ],
}