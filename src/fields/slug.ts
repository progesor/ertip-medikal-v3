import { Field } from 'payload'

// Türkçe karakterleri temizleyen ve URL'ye uygun hale getiren yardımcı fonksiyon
const formatSlug = (val: string): string => {
    let str = val.replace(/^\s+|\s+$/g, '').toLowerCase()

    const trMap: { [key: string]: string } = {
        'ç': 'c', 'ğ': 'g', 'ş': 's', 'ü': 'u', 'ı': 'i', 'ö': 'o'
    }

    for (let key in trMap) {
        str = str.replace(new RegExp(key, 'g'), trMap[key])
    }

    str = str
        .replace(/[^a-z0-9 -]/g, '') // Harf, sayı, boşluk ve tire dışındakileri sil
        .replace(/\s+/g, '-') // Boşlukları tireye çevir
        .replace(/-+/g, '-') // Birden fazla tireyi tek tire yap

    return str
}

// fieldToUse parametresi: Slug'ın hangi alandan türetileceğini belirler (Genelde 'title' olur)
export const slugField = (fieldToUse: string = 'title'): Field => ({
    name: 'slug',
    label: 'URL Yolu (Slug)',
    type: 'text',
    index: true,
    unique: true,
    admin: {
        position: 'sidebar',
        description: 'Otomatik oluşturulur. Gerekirse manuel olarak düzenleyebilirsiniz.',
    },
    hooks: {
        beforeValidate: [
            ({ value, originalDoc, data }) => {
                // Eğer kullanıcı manuel bir slug girdiyse onu formatla
                if (typeof value === 'string' && value !== '') {
                    return formatSlug(value)
                }
                // Eğer boşsa ve referans alınan alan (örn: title) doluysa oradan türet
                const fallbackData = (data && data[fieldToUse]) || (originalDoc && originalDoc[fieldToUse])
                if (fallbackData && typeof fallbackData === 'string') {
                    return formatSlug(fallbackData)
                }
                return value
            },
        ],
    },
})