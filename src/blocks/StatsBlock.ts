import { Block } from 'payload'

export const StatsBlock: Block = {
    slug: 'stats',
    labels: { singular: 'İstatistik Bloğu', plural: 'İstatistik Blokları' },
    fields: [
        {
            name: 'stats',
            type: 'array',
            label: 'Rakamlar',
            fields: [
                { name: 'label', type: 'text', label: 'Etiket (Örn: Yıllık Tecrübe)', required: true },
                { name: 'value', type: 'text', label: 'Değer (Örn: 25+)', required: true },
            ],
        },
    ],
}