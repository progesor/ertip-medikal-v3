import { Block } from 'payload'

export const CTABlock: Block = {
    slug: 'cta',
    labels: { singular: 'CTA (Aksiyon) Bloğu', plural: 'CTA Blokları' },
    fields: [
        { name: 'title', type: 'text', label: 'Ana Slogan', required: true },
        { name: 'description', type: 'textarea', label: 'Alt Metin' },
        {
            type: 'row',
            fields: [
                { name: 'buttonText', type: 'text', label: 'Buton Yazısı', defaultValue: 'Bizimle İletişime Geçin' },
                { name: 'buttonLink', type: 'text', label: 'Buton Linki', defaultValue: '/iletisim' },
            ],
        },
        {
            name: 'theme',
            type: 'select',
            label: 'Renk Teması',
            defaultValue: 'primary',
            options: [
                { label: 'Marka Rengi (Mavi/Lacivert)', value: 'primary' },
                { label: 'Koyu Tema (Siyah)', value: 'dark' },
            ],
        },
    ],
}