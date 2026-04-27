import { Field } from 'payload'

export const metaFields: Field = {
    name: 'meta',
    type: 'group',
    label: 'Arama Motoru (SEO) ve Sosyal Medya',
    admin: {
        description: 'Bu içeriğin Google, WhatsApp, LinkedIn gibi platformlarda nasıl görüneceğini belirleyin.',
    },
    fields: [
        {
            name: 'title',
            type: 'text',
            label: 'SEO Başlığı (Meta Title)',
            admin: {
                description: 'Boş bırakılırsa içeriğin ana başlığı kullanılır. (Önerilen: 50-60 karakter)',
                placeholder: 'Örn: İğnesiz Anestezi Cihazı | Ertip Medikal'
            },
        },
        {
            name: 'description',
            type: 'textarea',
            label: 'SEO Açıklaması (Meta Description)',
            admin: {
                description: 'Arama sonuçlarında başlığın altında görünecek özet metin. (Önerilen: 150-160 karakter)',
            },
        },
        {
            name: 'image',
            type: 'upload',
            relationTo: 'media',
            label: 'Sosyal Medya Görseli (OpenGraph Image)',
            admin: {
                description: 'Link paylaşıldığında görünecek özel kapak fotoğrafı. 1200x630 piksel önerilir. Boş bırakılırsa ana görsel kullanılır.',
            },
        },
        {
            name: 'keywords',
            type: 'text',
            label: 'Anahtar Kelimeler',
            admin: {
                description: 'Kelimelerin arasına virgül koyarak yazın. (Örn: medikal cihaz, saç ekimi, fue)',
            }
        }
    ],
}