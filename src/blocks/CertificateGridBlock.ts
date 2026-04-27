import { Block } from 'payload'

export const CertificateGridBlock: Block = {
    slug: 'certificateGrid',
    labels: { singular: 'Sertifika Galerisi', plural: 'Sertifika Galerileri' },
    fields: [
        { name: 'title', type: 'text', label: 'Blok Başlığı', defaultValue: 'Kalite ve Başarı Sertifikalarımız' },
        {
            name: 'certificates',
            type: 'array',
            label: 'Sertifikalar',
            fields: [
                { name: 'image', type: 'upload', relationTo: 'media', required: true, label: 'Sertifika Görseli' },
                { name: 'name', type: 'text', label: 'Sertifika Adı', required: true },
                { name: 'issuer', type: 'text', label: 'Düzenleyen Kurum' },
            ],
        },
    ],
}