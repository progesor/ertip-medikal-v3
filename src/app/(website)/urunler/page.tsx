import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { Search, ChevronRight, LayoutGrid, CornerDownRight } from 'lucide-react'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {Metadata} from "next";

export const dynamic = 'force-dynamic'

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

type Props = {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function ProductsPage({ searchParams }: Props) {
    const payload = await getPayload({ config: configPromise })

    const params = await searchParams
    const q = typeof params.q === 'string' ? params.q : ''
    const categorySlug = typeof params.category === 'string' ? params.category : ''

    // 1. Tüm Kategorileri Çekiyoruz
    const { docs: categories } = await payload.find({
        collection: 'categories',
        limit: 100,
        depth: 1,
    })

    // 2. Kategori Hiyerarşisi Hazırlığı
    const parentCategories = categories.filter((c: any) => !c.parent)

    const getChildren = (parentId: string | number) => {
        return categories.filter((c: any) => {
            // DÜZELTME: Eğer parent null veya undefined ise, alt kategori değildir, atla.
            if (!c.parent) return false;

            // Artık c.parent'ın null olmadığından eminiz.
            const pId = typeof c.parent === 'object' ? c.parent.id : c.parent;

            // Güvenli Karşılaştırma
            return String(pId) === String(parentId);
        })
    }

    // 3. Akıllı Kategori Filtreleme (Üst seçilince altları da kapsar)
    // DÜZELTME 2: Array tipi string veya number kabul etmeli
    let categoryIds: (string | number)[] = []
    if (categorySlug) {
        const selectedCat = categories.find((c: any) => c.slug === categorySlug)
        if (selectedCat) {
            categoryIds.push(selectedCat.id)

            const children = getChildren(selectedCat.id)
            children.forEach((child: any) => categoryIds.push(child.id))
        }
    }

    // 4. Dinamik Sorgu (Where Clause)
    const whereClause: any = { _status: { equals: 'published' } }

    // Arama: Hem Başlıkta hem de SKU alanında arama yapar (OR sorgusu)
    if (q) {
        whereClause.or = [
            { title: { like: q } },
            { sku: { like: q } }
        ]
    }

    // Kategori: Seçilen kategori veya alt kategorilerinden herhangi birine sahipse getir
    if (categoryIds.length > 0) {
        whereClause.category = { in: categoryIds }
    }

    // 5. Ürünleri Çekiyoruz
    const { docs: products } = await payload.find({
        collection: 'products',
        where: whereClause,
        sort: '-createdAt',
        limit: 24,
        depth: 1,
    })

    return (
        <div className="bg-slate-50 min-h-screen pt-12 pb-24">
            {/* Üst Başlık */}
            <div className="bg-slate-900 py-16 mb-12">
                <div className="container mx-auto px-4 max-w-7xl text-center">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-6 tracking-tight">Ürün Kataloğu</h1>
                    <p className="text-lg text-slate-300 max-w-2xl mx-auto">
                        İhtiyacınız olan cihazı isim veya ürün kodu (SKU) ile kolayca bulun.
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-4 max-w-7xl">
                <div className="flex flex-col lg:flex-row gap-10">

                    {/* Sidebar */}
                    <aside className="w-full lg:w-1/4 space-y-8">
                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                                <Search className="w-5 h-5 text-primary" /> Ürün / SKU Ara
                            </h3>
                            <form action="/urunler" method="GET" className="relative">
                                {categorySlug && <input type="hidden" name="category" value={categorySlug} />}
                                <input
                                    type="text"
                                    name="q"
                                    defaultValue={q}
                                    placeholder="Örn: M-400 veya Trikoskop..."
                                    className="w-full pl-4 pr-12 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm"
                                />
                                <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            </form>
                        </div>

                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                                <LayoutGrid className="w-5 h-5 text-primary" /> Kategoriler
                            </h3>
                            <div className="space-y-2">
                                <Link
                                    href="/urunler"
                                    className={`block px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${!categorySlug ? 'bg-primary text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'}`}
                                >
                                    Tüm Ürünler
                                </Link>

                                {parentCategories.map((parent: any) => {
                                    const isParentActive = categorySlug === parent.slug
                                    const children = getChildren(parent.id)
                                    const isChildActive = children.some((c: any) => c.slug === categorySlug)

                                    return (
                                        <div key={parent.id} className="pt-1">
                                            <Link
                                                href={`/urunler?category=${parent.slug}${q ? `&q=${q}` : ''}`}
                                                className={`block px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${isParentActive ? 'bg-primary text-white shadow-md' : isChildActive ? 'text-primary font-bold bg-primary/5' : 'text-slate-600 hover:bg-slate-50'}`}
                                            >
                                                {parent.title}
                                            </Link>

                                            {children.length > 0 && (
                                                <div className="ml-5 mt-1 mb-2 space-y-1 border-l-2 border-slate-100 pl-3">
                                                    {children.map((child: any) => (
                                                        <Link
                                                            key={child.id}
                                                            href={`/urunler?category=${child.slug}${q ? `&q=${q}` : ''}`}
                                                            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${categorySlug === child.slug ? 'text-primary bg-primary/10' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'}`}
                                                        >
                                                            <CornerDownRight className="w-3.5 h-3.5 opacity-50" />
                                                            {child.title}
                                                        </Link>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </aside>

                    {/* Ürün Listesi */}
                    <main className="w-full lg:w-3/4">
                        <div className="mb-6 flex items-center justify-between text-sm text-slate-500 font-medium">
                            <p>
                                Toplam <strong className="text-slate-900">{products.length}</strong> ürün listeleniyor.
                            </p>
                            {(q || categorySlug) && (
                                <Link href="/urunler" className="text-red-500 hover:underline">Filtreleri Temizle</Link>
                            )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                            {products.map((product: any) => {
                                const imageUrl = typeof product.mainImage === 'object' && product.mainImage?.url ? product.mainImage.url : '/placeholder.jpg'
                                return (
                                    <Card key={product.id} className="group overflow-hidden rounded-[2rem] border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col">
                                        <div className="relative aspect-square bg-white p-6 flex items-center justify-center">
                                            <Image
                                                src={imageUrl}
                                                alt={product.title}
                                                fill
                                                className="object-contain p-6 transition-transform duration-500 group-hover:scale-110"
                                                unoptimized
                                            />
                                            {product.sku && (
                                                <div className="absolute top-4 right-4 bg-slate-100 text-slate-500 text-[10px] px-2 py-1 rounded-md font-mono">
                                                    {product.sku}
                                                </div>
                                            )}
                                        </div>
                                        <CardHeader className="pt-6 border-t border-slate-50">
                                            <CardTitle className="text-lg line-clamp-2 leading-tight">
                                                <Link href={`/urunler/${product.slug}`} className="hover:text-primary transition-colors">
                                                    {product.title}
                                                </Link>
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="flex-1">
                                            <p className="text-sm text-slate-500 line-clamp-2">{product.shortDescription}</p>
                                        </CardContent>
                                        <CardFooter className="pt-0">
                                            <Button className="w-full rounded-xl font-semibold" asChild>
                                                <Link href={`/urunler/${product.slug}`}>İncele</Link>
                                            </Button>
                                        </CardFooter>
                                    </Card>
                                )
                            })}
                        </div>
                    </main>
                </div>
            </div>
        </div>
    )
}