import type { CollectionConfig } from 'payload'

export const Media: CollectionConfig = {
    slug: 'media',
    labels: { singular: 'Medya', plural: 'Medyalar' },
    upload: {
        staticDir: 'media',
        imageSizes: [
            { name: 'thumbnail', width: 400, height: 300, position: 'centre' },
            { name: 'card', width: 768, height: 1024, position: 'centre' },
            { name: 'hero', width: 1920, height: 1080, position: 'centre' },
        ],
        adminThumbnail: 'thumbnail',
        // Hem resimlere hem de PDF belgelerine izin veriyoruz
        mimeTypes: ['image/*', 'application/pdf'],
    },
    fields: [
        {
            name: 'alt',
            type: 'text',
            required: true,
            label: 'Alternatif Metin / Belge Adı',
            admin: { description: 'Görseller için SEO metni, PDF\'ler için dosya başlığı olarak kullanılır.' }
        },
        {
            name: 'caption',
            type: 'text',
            label: 'Altyazı (Opsiyonel)'
        }
    ],
}