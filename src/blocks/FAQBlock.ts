import { Block } from 'payload'

export const FAQBlock: Block = {
    slug: 'faq',
    labels: { singular: 'S.S.S. Bölümü', plural: 'S.S.S. Bölümleri' },
    fields: [
        { name: 'title', type: 'text', label: 'Başlık', defaultValue: 'Sıkça Sorulan Sorular' },
        {
            name: 'questions',
            type: 'array',
            label: 'Sorular ve Cevaplar',
            fields: [
                { name: 'question', type: 'text', label: 'Soru', required: true },
                { name: 'answer', type: 'textarea', label: 'Cevap', required: true },
            ],
        },
    ],
}