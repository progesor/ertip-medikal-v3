import type { GlobalConfig } from 'payload'

export const SiteSettings: GlobalConfig = {
    slug: 'site-settings',
    label: 'Site Ayarları',
    access: {
        read: () => true, // Frontend'den okunabilmesi için herkese açık
    },
    fields: [
        {
            name: 'contact',
            label: 'İletişim Bilgileri',
            type: 'group',
            fields: [
                { name: 'email', type: 'email', label: 'E-Posta Adresi' },
                { name: 'phone', type: 'text', label: 'Telefon Numarası' },
                { name: 'address', type: 'textarea', label: 'Açık Adres' },
            ],
        },
        {
            name: 'socialMedia',
            label: 'Sosyal Medya Linkleri',
            type: 'array',
            fields: [
                { name: 'platform', type: 'text', label: 'Platform Adı (Örn: LinkedIn)' },
                { name: 'url', type: 'text', label: 'Profil URL' },
            ],
        },
    ],
}