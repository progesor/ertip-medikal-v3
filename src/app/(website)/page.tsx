import { getPayload } from 'payload'
import configPromise from '@payload-config'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {Metadata} from "next";

export const metadata: Metadata = {
    // absolute: layout.tsx'teki template kuralını ezer ve sadece buradaki metni kullanır
    title: {
        absolute: 'Ertip Medikal | Yenilikçi Medikal Cihazlar ve Çözümler'
    },
    description: 'Ertip Medikal ürün kataloğu, iğnesiz anestezi cihazları, mikro motorlar ve yenilikçi saç ekim teknolojileri.',
    openGraph: {
        title: 'Ertip Medikal | Yenilikçi Medikal Çözümler',
        description: 'Ertip Medikal ürün kataloğu, iğnesiz anestezi cihazları, mikro motorlar ve yenilikçi saç ekim teknolojileri.',
        type: 'website',
    }
}

export default async function HomePage() {
    // 1. Payload Local API'yi başlat
    const payload = await getPayload({ config: configPromise })

    // 2. Ürünleri veritabanından çek (Sadece taslak olmayan, yayınlanmış olanları ve son 4 tanesini)
    const { docs: products } = await payload.find({
        collection: 'products',
        depth: 1, // İlişkili verilerin (Örn: mainImage ve category) ilk seviyesini de getir
        limit: 4,
        where: {
            _status: {
                equals: 'published',
            },
        },
        sort: '-createdAt', // En yeniler en üstte
    })

    return (
        <div className="flex flex-col min-h-screen">
            {/* Hero Alanı */}
            <section className="bg-slate-50 py-20">
                <div className="container mx-auto px-4 text-center space-y-6">
                    <h1 className="text-5xl font-extrabold tracking-tight text-slate-900">
                        Geleceğin Medikal Teknolojileri
                    </h1>
                    <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                        Ertip Medikal olarak, en son teknolojiye sahip cihazlarla sağlık sektörüne değer katıyoruz. Güvenilir ve yenilikçi çözümlerimizi keşfedin.
                    </p>
                    <div className="flex justify-center gap-4 pt-4">
                        <Button size="lg" asChild>
                            <Link href="/urunler">Kataloğu İncele</Link>
                        </Button>
                        <Button size="lg" variant="outline" asChild>
                            <Link href="/iletisim">Bize Ulaşın</Link>
                        </Button>
                    </div>
                </div>
            </section>

            {/* Öne Çıkan Ürünler Alanı */}
            <section className="py-20 container mx-auto px-4">
                <div className="flex justify-between items-end mb-10">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">Yeni Ürünler</h2>
                        <p className="text-muted-foreground mt-2">Kataloğumuza eklenen en son teknolojiler.</p>
                    </div>
                    <Button variant="link" asChild className="hidden md:flex">
                        <Link href="/urunler">Tümünü Gör &rarr;</Link>
                    </Button>
                </div>

                {/* Ürünler Grid */}
                {products.length === 0 ? (
                    <div className="text-center py-12 bg-muted/50 rounded-lg border border-dashed">
                        <p className="text-muted-foreground">Henüz ürün eklenmemiş.</p>
                        <p className="text-sm mt-2">Admin panelinden yeni ürünler ekleyebilirsiniz.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {products.map((product) => {
                            // mainImage bir obje (Media) olarak dönerse URL'sini alıyoruz
                            const imageUrl = typeof product.mainImage === 'object' && product.mainImage?.url
                                ? product.mainImage.url
                                : '/placeholder.jpg' // Görsel yoksa varsayılan (public klasörüne placeholder.jpg ekleyebilirsin)

                            return (
                                <Card key={product.id} className="flex flex-col overflow-hidden hover:shadow-lg transition-shadow">
                                    <div className="aspect-square relative bg-muted flex items-center justify-center overflow-hidden">
                                        {/* Next.js Image komponenti ile optimize edilmiş görsel yükleme */}
                                        {typeof product.mainImage === 'object' && product.mainImage?.url ? (
                                            <Image
                                                src={product.mainImage.url}
                                                alt={product.mainImage.alt || product.title}
                                                fill
                                                className="object-cover"
                                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                                unoptimized // Next.js'in API üzerinden gelen görselleri tekrar işlemesini engeller
                                            />
                                        ) : (
                                            <span className="text-muted-foreground">Görsel Yok</span>
                                        )}
                                    </div>
                                    <CardHeader>
                                        <div className="flex justify-between items-start gap-2">
                                            <CardTitle className="text-lg line-clamp-2">{product.title}</CardTitle>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="flex-1">
                                        {product.shortDescription && (
                                            <p className="text-sm text-muted-foreground line-clamp-3">
                                                {product.shortDescription}
                                            </p>
                                        )}
                                    </CardContent>
                                    <CardFooter>
                                        <Button variant="secondary" className="w-full" asChild>
                                            <Link href={`/urunler/${product.slug}`}>Detayları İncele</Link>
                                        </Button>
                                    </CardFooter>
                                </Card>
                            )
                        })}
                    </div>
                )}
            </section>
        </div>
    )
}