import { getPayload } from 'payload'
import configPromise from '@payload-config'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import {Metadata} from "next";

export const metadata: Metadata = {
    // Sadece sayfa adını yazıyoruz, layout.tsx sonuna "| Ertip Medikal" ekleyecek
    title: 'Ürünlerimiz',
    description: 'Ertip Medikal yenilikçi cihaz kataloğu. Saç ekim motorları, iğnesiz anestezi cihazları ve tüm medikal çözümlerimiz.',
    openGraph: {
        title: 'Tüm Ürünlerimiz',
        description: 'Ertip Medikal yenilikçi cihaz kataloğu ve tüm medikal çözümlerimizi inceleyin.',
        // url: '/urunler', // Opsiyonel: Canonical URL için
        type: 'website',
    }
}

export default async function ProductsPage() {
    // 1. Payload API'ye bağlan
    const payload = await getPayload({ config: configPromise })

    // 2. Yayında olan tüm ürünleri çek
    const { docs: products } = await payload.find({
        collection: 'products',
        where: {
            _status: {
                equals: 'published',
            },
        },
        depth: 1,
        sort: '-createdAt',
        limit: 100, // Şimdilik 100 ürüne kadar çekiyoruz, ileride sayfalama eklenebilir
    })

    return (
        <div className="container mx-auto px-4 py-12 flex flex-col gap-8 min-h-screen">

            {/* Sayfa Başlığı */}
            <div className="flex flex-col gap-4 border-b pb-8">
                <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">Ürünlerimiz</h1>
                <p className="text-lg text-muted-foreground max-w-2xl">
                    Sağlık sektörüne yön veren, yenilikçi ve güvenilir medikal cihaz kataloğumuzu inceleyin.
                </p>
            </div>

            {/* Ürünler Grid */}
            {products.length === 0 ? (
                <div className="text-center py-20 bg-muted/30 rounded-2xl border border-dashed">
                    <p className="text-lg text-muted-foreground">Şu an için listelenecek ürün bulunmuyor.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {products.map((product) => {
                        const imageUrl = typeof product.mainImage === 'object' && product.mainImage?.url
                            ? product.mainImage.url
                            : '/placeholder.jpg'

                        return (
                            <Card key={product.id} className="flex flex-col overflow-hidden hover:shadow-xl transition-all duration-300 border-slate-200">
                                <Link href={`/urunler/${product.slug}`} className="relative aspect-square bg-white flex items-center justify-center overflow-hidden p-4 group">
                                    {typeof product.mainImage === 'object' && product.mainImage?.url ? (
                                        <Image
                                            src={product.mainImage.url}
                                            alt={product.mainImage.alt || product.title}
                                            fill
                                            className="object-contain p-4 group-hover:scale-105 transition-transform duration-500"
                                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                                            unoptimized
                                        />
                                    ) : (
                                        <span className="text-muted-foreground">Görsel Yok</span>
                                    )}
                                </Link>
                                <CardHeader className="pt-4 pb-2">
                                    <CardTitle className="text-lg line-clamp-2 leading-tight">
                                        <Link href={`/urunler/${product.slug}`} className="hover:text-primary transition-colors">
                                            {product.title}
                                        </Link>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="flex-1 pb-4">
                                    {product.shortDescription ? (
                                        <p className="text-sm text-muted-foreground line-clamp-2">
                                            {product.shortDescription}
                                        </p>
                                    ) : (
                                        <div className="h-10" /> // Boşluk tutucu
                                    )}
                                </CardContent>
                                <CardFooter className="pt-0">
                                    <Button variant="secondary" className="w-full bg-slate-100 hover:bg-slate-200 text-slate-900" asChild>
                                        <Link href={`/urunler/${product.slug}`}>İncele</Link>
                                    </Button>
                                </CardFooter>
                            </Card>
                        )
                    })}
                </div>
            )}
        </div>
    )
}