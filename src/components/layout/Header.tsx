import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

// Artık asenkron bir Server Component
export async function Header() {
    const payload = await getPayload({ config: configPromise })

    // Veritabanından Ana Menü verisini çekiyoruz
    // depth: 1 parametresi, 'reference' olarak seçilen sayfaların slug gibi detaylarını da getirmesini sağlar
    const mainMenu = await payload.findGlobal({
        slug: 'main-menu',
        depth: 1,
    })

    // Eğer CMS'te henüz öğe eklenmediyse boş dizi döndür
    const navItems = mainMenu?.items || []

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto px-4 flex h-16 items-center justify-between">
                {/* Logo Alanı */}
                <div className="flex items-center gap-2">
                    <Link href="/" className="flex items-center space-x-2">
                        <span className="text-2xl font-bold text-primary">Ertip Medikal</span>
                    </Link>
                </div>

                {/* Masaüstü Navigasyon (Dinamik Döngü) */}
                <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
                    {navItems.map((item: any, idx: number) => {
                        // Hedef URL'yi türüne göre belirliyoruz
                        let href = '#'

                        if (item.type === 'custom' && item.url) {
                            href = item.url
                        } else if (item.type === 'reference' && typeof item.reference === 'object' && item.reference !== null) {
                            // DÜZELTME: item.reference.value yerine doğrudan item.reference kullanıyoruz
                            href = `/${item.reference.slug}`
                        }

                        return (
                            <Link key={idx} href={href} className="transition-colors hover:text-primary">
                                {item.label}
                            </Link>
                        )
                    })}
                </nav>

                {/* İletişim Butonu (Sağ Kısım) */}
                <div className="flex items-center gap-4">
                    <Link href="/iletisim">
                        <Button variant="default" size="sm">Teklif Al</Button>
                    </Link>
                </div>
            </div>
        </header>
    )
}