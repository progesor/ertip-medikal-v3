import { Block } from 'payload'

export const NewsletterBlock: Block = {
    slug: 'newsletter',
    labels: { singular: 'Bülten Kayıt Bloğu', plural: 'Bülten Kayıt Blokları' },
    fields: [
        { name: 'title', type: 'text', label: 'Başlık', defaultValue: 'Yeniliklerden Haberdar Olun' },
        { name: 'description', type: 'textarea', label: 'Açıklama Metni', defaultValue: 'Yeni ürünler, medikal teknolojiler ve sektörel haberler için e-bültenimize katılın.' },
        { name: 'buttonText', type: 'text', label: 'Buton Metni', defaultValue: 'Kayıt Ol' },
    ],
}