import React from 'react'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowRight } from 'lucide-react'

export async function FeaturedProductsBlock({ title, selectionType, selectedProducts }: any) {
    let productsToDisplay = []

    // Eğer "En Son Eklenenler" seçildiyse veritabanından kendisi çeker
    if (selectionType === 'latest') {
        const payload = await getPayload({ config: configPromise })
        const { docs } = await payload.find({
            collection: 'products',
            where: { _status: { equals: 'published' } },
            sort: '-createdAt',
            limit: 4,
            depth: 1,
        })
        productsToDisplay = docs
    } else {
        // Manuel seçim yapıldıysa gelenleri (eğer publish edilmişlerse) kullan
        productsToDisplay = selectedProducts?.filter((p: any) => typeof p === 'object' && p._status === 'published') || []
    }

    if (productsToDisplay.length === 0) return null

    return (
        <section className="py-20 bg-white">
            <div className="container mx-auto px-4 max-w-7xl">

                {/* Üst Kısım: Başlık ve Tümünü Gör Butonu */}
                <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-12">
                    <div className="max-w-2xl">
                        <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 mb-4">
                            {title || 'Öne Çıkan Ürünler'}
                        </h2>
                        <div className="w-20 h-1.5 bg-primary rounded-full"></div>
                    </div>
                    <Button variant="outline" className="rounded-full font-semibold" asChild>
                        <Link href="/urunler">
                            Tüm Kataloğu İncele <ArrowRight className="ml-2 w-4 h-4" />
                        </Link>
                    </Button>
                </div>

                {/* Ürün Kartları (Anasayfadakiyle aynı mantık ama daha şık) */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {productsToDisplay.map((product: any) => {
                        const imageUrl = typeof product.mainImage === 'object' && product.mainImage?.url ? product.mainImage.url : '/placeholder.jpg'

                        return (
                            <Card key={product.id} className="group overflow-hidden rounded-[2rem] border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col">
                                <div className="relative aspect-square overflow-hidden bg-slate-50 p-6 flex items-center justify-center">
                                    <Image
                                        src={imageUrl}
                                        alt={product.title}
                                        fill
                                        className="object-contain p-6 transition-transform duration-500 group-hover:scale-110"
                                        sizes="(max-width: 768px) 100vw, 25vw"
                                        unoptimized
                                    />
                                </div>
                                <CardHeader className="pt-6">
                                    <CardTitle className="text-lg line-clamp-2 leading-tight">
                                        <Link href={`/urunler/${product.slug}`} className="hover:text-primary transition-colors">
                                            {product.title}
                                        </Link>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="flex-1 pb-4">
                                    {product.shortDescription ? (
                                        <p className="text-sm text-slate-500 line-clamp-2">{product.shortDescription}</p>
                                    ) : (
                                        <div className="h-10" />
                                    )}
                                </CardContent>
                                <CardFooter className="pt-0">
                                    <Button variant="secondary" className="w-full bg-slate-100 hover:bg-slate-200 text-slate-900 font-semibold" asChild>
                                        <Link href={`/urunler/${product.slug}`}>İncele</Link>
                                    </Button>
                                </CardFooter>
                            </Card>
                        )
                    })}
                </div>
            </div>
        </section>
    )
}