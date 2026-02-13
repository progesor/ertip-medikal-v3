import type { Block } from 'payload'

export const ContentBlock: Block = {
    slug: 'content',
    labels: { singular: 'Metin İçeriği', plural: 'Metin İçerikleri' },
    fields: [
        { name: 'content', type: 'richText', required: true, label: 'İçerik Editörü' },
    ],
}