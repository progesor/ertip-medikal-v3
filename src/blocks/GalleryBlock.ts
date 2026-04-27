import { Block } from 'payload'

export const GalleryBlock: Block = {
    slug: 'gallery',
    labels: { singular: 'Galeri Bloğu', plural: 'Galeri Blokları' },
    fields: [
        { name: 'title', type: 'text', label: 'Galeri Başlığı' },
        {
            name: 'images',
            type: 'array',
            label: 'Görseller',
            minRows: 2,
            fields: [{ name: 'image', type: 'upload', relationTo: 'media', required: true }],
        },
    ],
}