import type { CollectionConfig } from 'payload'
import { HeroBlock } from '../blocks/HeroBlock'
import { ContentBlock } from '../blocks/ContentBlock'
import { metaFields } from '@/fields/meta'
import { slugField } from '@/fields/slug'

export const Pages: CollectionConfig = {
    slug: 'pages',
    labels: { singular: 'Sayfa', plural: 'Sayfalar' },
    admin: {
        useAsTitle: 'title',
        defaultColumns: ['title', 'slug', 'updatedAt'],
    },
    versions: { drafts: true },
    fields: [
        {
            type: 'tabs',
            tabs: [
                {
                    label: 'Sayfa İçeriği',
                    fields: [
                        {
                            name: 'title',
                            type: 'text',
                            required: true,
                            label: 'Sayfa Başlığı'
                        },
                        {
                            name: 'layout',
                            type: 'blocks',
                            label: 'Sayfa Tasarım Blokları (Page Builder)',
                            minRows: 1,
                            blocks: [HeroBlock, ContentBlock],
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
        slugField('title'),
    ],
}