import type { CollectionConfig } from 'payload';

export const Products: CollectionConfig = {
    slug: 'products',
    admin: {
        useAsTitle: 'title',
        defaultColumns: ['title', 'price', 'category', 'status'],
    },
    versions: {
        drafts: true,
    },
    fields: [
        {
            name: 'title',
            type: 'text',
            required: true,
        },
        {
            name: 'description',
            type: 'richText', // Lexical editor kullanılacak
        },
        {
            name: 'price',
            type: 'number',
        },
        {
            name: 'category',
            type: 'relationship',
            relationTo: 'categories',
            required: true,
        },
        {
            name: 'mainImage',
            type: 'upload',
            relationTo: 'media',
            required: true,
        },
        {
            name: 'specs', // Teknik Özellikler (Örn: Voltaj, Ağırlık)
            type: 'array',
            fields: [
                {
                    name: 'key',
                    type: 'text',
                    label: 'Özellik Adı'
                },
                {
                    name: 'value',
                    type: 'text',
                    label: 'Değer'
                }
            ]
        }
    ],
};