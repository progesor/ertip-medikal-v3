import { Block } from 'payload'

export const LocationBlock: Block = {
    slug: 'location',
    labels: { singular: 'Konum ve İletişim Bloğu', plural: 'Konum Blokları' },
    fields: [
        { name: 'title', type: 'text', label: 'Blok Başlığı', defaultValue: 'Merkez Ofisimiz' },
        { name: 'address', type: 'textarea', label: 'Açık Adres', required: true },
        { name: 'phone', type: 'text', label: 'Telefon Numarası' },
        { name: 'email', type: 'text', label: 'E-Posta Adresi' },
        { name: 'workingHours', type: 'text', label: 'Çalışma Saatleri (Örn: Pzt - Cum: 09:00 - 18:00)' },
        {
            name: 'mapUrl',
            type: 'text',
            label: 'Google Maps Embed Linki',
            admin: { description: 'Google Haritalar -> Paylaş -> Harita Yerleştirme (Embed) kısmındaki src="" içindeki linki buraya yapıştırın.' }
        },
    ],
}