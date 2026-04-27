import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { RichText } from '@payloadcms/richtext-lexical/react'
import { ProductGallery } from '@/components/product/ProductGallery'
import {Metadata} from "next";

type Args = {
    params: Promise<{
        slug: string
    }>
}

// YouTube linkinden video ID'sini çıkaran yardımcı fonksiyon
function getYouTubeId(url: string) {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
}

// --- SEO FONKSİYONU ---
export async function generateMetadata({ params }: Args): Promise<Metadata> {
    const { slug } = await params
    const payload = await getPayload({ config: configPromise })

    const { docs } = await payload.find({
        collection: 'products',
        where: { slug: { equals: slug }, _status: { equals: 'published' } },
        limit: 1,
    })

    const product = docs[0]
    if (!product) return { title: 'Ürün Bulunamadı' }

    // 1. Manuel girilen SEO verilerini al (Admin panelindeki SEO sekmesi)
    const manualMeta = product.meta || {}

    // 2. Akıllı Fallback: Önce manuel SEO başlığı, yoksa ürünün adı
    const finalTitle = manualMeta.title || product.title

    // 3. Akıllı Fallback: Önce manuel açıklama, yoksa ürün özeti, o da yoksa varsayılan metin
    const finalDesc = manualMeta.description || product.shortDescription || `${product.title} hakkında detaylı teknik özellikler ve ürün görselleri.`

    // 4. Görsel Önceliği: Manuel SEO Görseli > Ürün Ana Görseli > Sitenin Varsayılan OG Görseli
    const ogImage = (typeof manualMeta.image === 'object' && manualMeta.image?.url)
        ? manualMeta.image.url
        : (typeof product.mainImage === 'object' && product.mainImage?.url)
            ? product.mainImage.url
            : '/og-image.jpg'

    return {
        title: finalTitle,
        description: finalDesc,
        keywords: manualMeta.keywords || '', // Anahtar kelimeleri ekledik
        openGraph: {
            title: finalTitle,
            description: finalDesc,
            images: [ogImage],
            type: 'article',
        },
    }
}
// -----------------------------------

export default async function ProductDetailPage({ params }: Args) {
    const { slug } = await params
    const payload = await getPayload({ config: configPromise })

    const { docs } = await payload.find({
        collection: 'products',
        where: {
            slug: { equals: slug },
            _status: { equals: 'published' }
        },
        limit: 1,
        depth: 2,
    })

    const product = docs[0]

    if (!product) {
        return notFound()
    }

    // Galeri Görsellerini Toplama
    const allImages = []
    if (product.mainImage && typeof product.mainImage === 'object' && product.mainImage.url) {
        allImages.push({ url: product.mainImage.url, alt: product.mainImage.alt })
    }
    if (product.gallery && Array.isArray(product.gallery)) {
        product.gallery.forEach((item: any) => {
            if (item.image && typeof item.image === 'object' && item.image.url) {
                allImages.push({ url: item.image.url, alt: item.image.alt })
            }
        })
    }

    const videoId = getYouTubeId(product.videoUrl || '');

    return (
        <div className="container mx-auto px-4 py-12 flex flex-col gap-16">

            {/* Üst Bölüm: Galeri ve Kısa Bilgiler */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                <div className="sticky top-24">
                    <ProductGallery images={allImages} />
                </div>

                <div className="flex flex-col space-y-8">
                    <div>
                        <div className="flex flex-wrap gap-2 mb-4">
                            {product.category && Array.isArray(product.category) && product.category.map((cat: any) => (
                                <Badge key={cat.id} variant="secondary" className="text-sm">{cat.title}</Badge>
                            ))}
                        </div>
                        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">{product.title}</h1>
                        {product.sku && (
                            <p className="text-sm font-mono text-muted-foreground mt-2">SKU: {product.sku}</p>
                        )}
                    </div>

                    {product.shortDescription && (
                        <p className="text-lg text-slate-600 leading-relaxed">
                            {product.shortDescription}
                        </p>
                    )}

                    {/* Teknik Özellikler Tablosu */}
                    {product.specs && product.specs.length > 0 && (
                        <div className="space-y-4">
                            <h3 className="text-xl font-bold">Teknik Özellikler</h3>
                            <div className="border rounded-lg overflow-hidden bg-white">
                                <table className="w-full text-sm text-left">
                                    <tbody className="divide-y">
                                    {product.specs.map((spec, index) => (
                                        <tr key={index} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-4 py-3 font-semibold text-slate-900 w-1/3 border-r bg-muted/30">{spec.key}</td>
                                            <td className="px-4 py-3 text-slate-700">{spec.value}</td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Aksiyon Butonları */}
                    <div className="pt-4 flex flex-col sm:flex-row gap-4">
                        <Button size="lg" className="flex-1 text-md" asChild>
                            <Link href="/iletisim">Bu Ürün İçin Teklif Al</Link>
                        </Button>
                        {product.documents && product.documents.length > 0 && (
                            <Button size="lg" variant="outline" className="flex-1 text-md" asChild>
                                {/*<a href={typeof product.documents[0].file === 'object' ? product.documents[0].file.url : '#'} target="_blank" rel="noreferrer">*/}
                                {/*    Kataloğu İndir (PDF)*/}
                                {/*</a>*/}
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            {/* Orta Bölüm: Tanıtım Videosu (Eğer varsa) */}
            {videoId && (
                <div className="border-t pt-16">
                    <div className="max-w-4xl mx-auto">
                        <h2 className="text-3xl font-bold mb-8">Tanıtım Videosu</h2>
                        <div className="aspect-video w-full rounded-2xl overflow-hidden shadow-xl border border-slate-200 bg-black">
                            <iframe
                                width="100%"
                                height="100%"
                                src={`https://www.youtube.com/embed/${videoId}?rel=0`}
                                title={`${product.title} Tanıtım Videosu`}
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                className="w-full h-full"
                            ></iframe>
                        </div>
                    </div>
                </div>
            )}

            {/* Alt Bölüm: Detaylı Açıklama (Lexical Rich Text) */}
            {product.description && (
                <div className="border-t pt-16">
                    <div className="max-w-4xl mx-auto">
                        <h2 className="text-3xl font-bold mb-8">Ürün Detayları</h2>
                        <div className="
              text-slate-700 leading-relaxed space-y-6
              [&>h2]:text-2xl [&>h2]:font-bold [&>h2]:text-slate-900 [&>h2]:mt-8
              [&>h3]:text-xl [&>h3]:font-semibold [&>h3]:text-slate-900 [&>h3]:mt-6
              [&>p]:text-lg
              [&>ul]:list-disc [&>ul]:pl-6 [&>ul>li]:mb-2
              [&>ol]:list-decimal [&>ol]:pl-6 [&>ol>li]:mb-2
              [&_a]:text-primary [&_a]:underline [&_a:hover]:text-primary/80
              [&_img]:rounded-xl [&_img]:shadow-md [&_img]:mx-auto [&_img]:my-8
            ">
                            <RichText data={product.description} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}