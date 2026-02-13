import type { CollectionConfig } from 'payload'
import { HeroBlock } from '../blocks/HeroBlock'
import { ContentBlock } from '../blocks/ContentBlock'

export const Pages: CollectionConfig = {
    slug: 'pages',
    labels: { singular: 'Sayfa', plural: 'Sayfalar' },
    admin: { useAsTitle: 'title' },
    versions: { drafts: true },
    fields: [
        { name: 'title', type: 'text', required: true, label: 'Sayfa Başlığı' },
        {
            name: 'slug',
            type: 'text',
            required: true,
            unique: true,
            admin: { position: 'sidebar' },
        },
        {
            name: 'layout',
            type: 'blocks',
            required: true,
            minRows: 1,
            blocks: [HeroBlock, ContentBlock], // İleride buraya ImageGalleryBlock, ContactFormBlock vb. eklenecek
            label: 'Sayfa Yerleşimi (Page Builder)',
        },
    ],
}