import { Block } from 'payload'

export const FeaturedProductsBlock: Block = {
    slug: 'featuredProducts',
    labels: {
        singular: 'Öne Çıkan Ürünler',
        plural: 'Öne Çıkan Ürünler',
    },
    fields: [
        {
            name: 'title',
            type: 'text',
            label: 'Blok Başlığı',
            defaultValue: 'Öne Çıkan Ürünlerimiz',
        },
        {
            name: 'selectionType',
            type: 'select',
            label: 'Ürün Seçim Yöntemi',
            defaultValue: 'latest',
            options: [
                { label: 'En Son Eklenen 4 Ürün', value: 'latest' },
                { label: 'Manuel Seçim (El ile Seç)', value: 'manual' },
            ],
        },
        {
            name: 'selectedProducts',
            type: 'relationship',
            relationTo: 'products',
            hasMany: true,
            label: 'Ürünleri Seçin',
            admin: {
                condition: (data, siblingData) => siblingData.selectionType === 'manual',
            },
        },
    ],
}