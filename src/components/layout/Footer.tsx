import Link from 'next/link'

export function Footer() {
    return (
        <footer className="border-t bg-muted/50">
            <div className="container mx-auto px-4 py-12 md:py-16">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Hakkımızda / Logo */}
                    <div className="space-y-4">
                        <h3 className="text-xl font-bold text-primary">Ertip Medikal</h3>
                        <p className="text-sm text-muted-foreground pr-4">
                            Yenilikçi medikal cihaz tedarikinde güvenilir çözüm ortağınız. Sektördeki tecrübemizle en iyi teknolojileri sunuyoruz.
                        </p>
                    </div>

                    {/* Hızlı Bağlantılar */}
                    <div className="space-y-4">
                        <h4 className="text-sm font-semibold uppercase tracking-wider">Hızlı Bağlantılar</h4>
                        <nav className="flex flex-col space-y-2 text-sm text-muted-foreground">
                            <Link href="/urunler" className="hover:text-primary transition-colors">Tüm Ürünler</Link>
                            <Link href="/kurumsal" className="hover:text-primary transition-colors">Hakkımızda</Link>
                            <Link href="/haberler" className="hover:text-primary transition-colors">Haberler ve Duyurular</Link>
                            <Link href="/iletisim" className="hover:text-primary transition-colors">İletişim</Link>
                        </nav>
                    </div>

                    {/* İletişim Bilgileri */}
                    <div className="space-y-4">
                        <h4 className="text-sm font-semibold uppercase tracking-wider">İletişim</h4>
                        <div className="flex flex-col space-y-2 text-sm text-muted-foreground">
                            <p>Email: info@ertipmedikal.com.tr</p>
                            <p>Telefon: +90 (212) 000 00 00</p>
                            <p>Adres: İstanbul, Türkiye</p>
                        </div>
                    </div>
                </div>

                <div className="mt-12 border-t pt-8 text-center text-sm text-muted-foreground">
                    <p>&copy; {new Date().getFullYear()} Ertip Medikal. Tüm Hakları Saklıdır.</p>
                </div>
            </div>
        </footer>
    )
}