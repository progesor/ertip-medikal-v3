import Link from 'next/link'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

export async function Footer() {
    // 1. Payload API'ye bağlan ve Site Ayarları global verisini çek
    const payload = await getPayload({ config: configPromise })
    const siteSettings = await payload.findGlobal({
        slug: 'site-settings',
    })

    // Veritabanından gelen bilgileri al, boşsa varsayılan metinleri kullan
    const contact = siteSettings?.contact || {}
    const socialMedia = siteSettings?.socialMedia || []

    return (
        <footer className="border-t bg-slate-50">
            <div className="container mx-auto px-4 py-12 md:py-16">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">

                    {/* 1. Sütun: Hakkımızda / Logo */}
                    <div className="space-y-4 md:col-span-1">
                        <h3 className="text-2xl font-bold text-primary">Ertip Medikal</h3>
                        <p className="text-sm text-slate-600 pr-4 leading-relaxed">
                            Yenilikçi medikal cihaz tedarikinde güvenilir çözüm ortağınız. Sektördeki çeyrek asırlık tecrübemizle en iyi teknolojileri sunuyoruz.
                        </p>
                    </div>

                    {/* 2. Sütun: Hızlı Bağlantılar */}
                    <div className="space-y-4">
                        <h4 className="text-sm font-bold uppercase tracking-wider text-slate-900">Kurumsal</h4>
                        <nav className="flex flex-col space-y-3 text-sm text-slate-600">
                            <Link href="/hakkimizda" className="hover:text-primary transition-colors">Hakkımızda</Link>
                            <Link href="/kalite-politikamiz" className="hover:text-primary transition-colors">Kalite Politikamız</Link>
                            <Link href="/haberler" className="hover:text-primary transition-colors">Haberler ve Duyurular</Link>
                            <Link href="/iletisim" className="hover:text-primary transition-colors">İletişim</Link>
                        </nav>
                    </div>

                    {/* 3. Sütun: Ürünlerimiz */}
                    <div className="space-y-4">
                        <h4 className="text-sm font-bold uppercase tracking-wider text-slate-900">Katalog</h4>
                        <nav className="flex flex-col space-y-3 text-sm text-slate-600">
                            <Link href="/urunler" className="hover:text-primary transition-colors">Tüm Ürünler</Link>
                            <Link href="/iletisim" className="hover:text-primary transition-colors">Teklif İste</Link>
                            <Link href="/teknik-destek" className="hover:text-primary transition-colors">Teknik Destek</Link>
                        </nav>
                    </div>

                    {/* 4. Sütun: İletişim Bilgileri (DİNAMİK) */}
                    <div className="space-y-4">
                        <h4 className="text-sm font-bold uppercase tracking-wider text-slate-900">İletişim</h4>
                        <div className="flex flex-col space-y-3 text-sm text-slate-600">
                            <p>
                                <strong className="font-semibold text-slate-900">Email:</strong><br />
                                {contact.email || 'info@ertipmedikal.com.tr'}
                            </p>
                            <p>
                                <strong className="font-semibold text-slate-900">Telefon:</strong><br />
                                {contact.phone || '+90 (212) 000 00 00'}
                            </p>
                            <p>
                                <strong className="font-semibold text-slate-900">Adres:</strong><br />
                                {contact.address || 'İstanbul, Türkiye'}
                            </p>
                        </div>

                        {/* Sosyal Medya İkonları/Linkleri (Eğer CMS'te girildiyse) */}
                        {socialMedia.length > 0 && (
                            <div className="pt-4">
                                <div className="flex gap-4">
                                    {socialMedia.map((social: any, idx: number) => (
                                        <a
                                            key={idx}
                                            href={social.url}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="text-slate-500 hover:text-primary transition-colors text-sm font-medium underline underline-offset-4"
                                        >
                                            {social.platform}
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                </div>

                <div className="mt-12 border-t pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-slate-500">
                    <p>&copy; {new Date().getFullYear()} Ertip Medikal A.Ş. Tüm Hakları Saklıdır.</p>
                    <div className="flex gap-4">
                        <Link href="/gizlilik" className="hover:text-primary transition-colors">Gizlilik Politikası</Link>
                        <Link href="/kvkk" className="hover:text-primary transition-colors">KVKK Aydınlatma Metni</Link>
                    </div>
                </div>
            </div>
        </footer>
    )
}