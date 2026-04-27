import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { RichText } from '@payloadcms/richtext-lexical/react'
import { ProductGallery } from '@/components/product/ProductGallery'
import { CalendarDays, ArrowLeft } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import {Metadata} from "next";

type Args = {
    params: Promise<{
        slug: string
    }>
}

export async function generateMetadata({ params }: Args): Promise<Metadata> {
    const { slug } = await params
    const payload = await getPayload({ config: configPromise })

    const { docs } = await payload.find({
        collection: 'news',
        where: { or: [{ slug: { equals: slug } }, { id: { equals: slug } }], _status: { equals: 'published' } },
        limit: 1,
    })

    const newsItem = docs[0]
    if (!newsItem) return { title: 'Haber Bulunamadı' }

    // 1. Manuel girilen SEO verilerini al (Admin panelindeki SEO sekmesi)
    const manualMeta = newsItem.meta || {}

    // 2. Akıllı Fallback: Önce manuel SEO başlığı, yoksa haberin kendi başlığı
    const finalTitle = manualMeta.title || newsItem.title

    // 3. Akıllı Fallback: Önce manuel açıklama, yoksa haberin kısa özeti, yoksa varsayılan metin
    const finalDesc = manualMeta.description || newsItem.excerpt || `${newsItem.title} - Ertip Medikal'den en güncel gelişmeler ve duyurular.`

    // 4. Görsel Önceliği: Manuel SEO Görseli > Haber Ana Görseli > Varsayılan OG
    const ogImage = (typeof manualMeta.image === 'object' && manualMeta.image?.url)
        ? manualMeta.image.url
        : (typeof newsItem.image === 'object' && newsItem.image?.url)
            ? newsItem.image.url
            : '/og-image.jpg'

    return {
        title: finalTitle,
        description: finalDesc,
        keywords: manualMeta.keywords || '',
        openGraph: {
            title: finalTitle,
            description: finalDesc,
            images: [ogImage],
            type: 'article',
            publishedTime: newsItem.publishedDate, // Google'a haberin ne zaman yayınlandığını söyler
        },
    }
}

export default async function NewsDetailPage({ params }: Args) {
    const { slug } = await params
    const payload = await getPayload({ config: configPromise })

    const { docs } = await payload.find({
        collection: 'news',
        where: {
            or: [
                { slug: { equals: slug } },
                { id: { equals: slug } }
            ],
            _status: { equals: 'published' }
        },
        limit: 1,
        depth: 2, // Kategori verisi için depth: 2
    })

    const newsItem = docs[0]

    if (!newsItem) {
        return notFound()
    }

    const imageUrl = typeof newsItem.image === 'object' && newsItem.image?.url ? newsItem.image.url : null
    const formattedDate = new Date(newsItem.publishedDate).toLocaleDateString('tr-TR', {
        year: 'numeric', month: 'long', day: 'numeric'
    })
    const categoryTitle = typeof newsItem.category === 'object' ? newsItem.category?.title : null

    // Galeri görselleri
    const galleryImages: { url: string; alt?: string }[] | { url: any; alt: any }[] = []
    if (newsItem.gallery && Array.isArray(newsItem.gallery)) {
        newsItem.gallery.forEach((item: any) => {
            if (item.image && typeof item.image === 'object' && item.image.url) {
                galleryImages.push({ url: item.image.url, alt: item.image.alt })
            }
        })
    }

    return (
        <article className="pb-24">

            {/* Üst Menü / Geri Dönüş */}
            <div className="container mx-auto px-4 py-8">
                <Link href="/haberler" className="inline-flex items-center text-sm font-semibold text-slate-500 hover:text-primary transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Tüm Haberlere Dön
                </Link>
            </div>

            {/* Sinematik Başlık (Hero) Alanı */}
            <div className="container mx-auto px-4 mb-16">
                <div className="relative w-full max-w-5xl mx-auto rounded-[2.5rem] overflow-hidden shadow-2xl bg-slate-900">
                    <div className="aspect-[16/9] md:aspect-[21/9] relative">
                        {imageUrl && (
                            <>
                                <Image
                                    src={imageUrl}
                                    alt={newsItem.title}
                                    fill
                                    className="object-cover opacity-60"
                                    priority
                                    sizes="(max-width: 1024px) 100vw, 1024px"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
                            </>
                        )}

                        {/* Resmin Üzerindeki Metinler */}
                        <div className="absolute bottom-0 left-0 w-full p-8 md:p-16 text-white z-10">
                            <div className="flex flex-wrap items-center gap-4 mb-6">
                                {categoryTitle && (
                                    <Badge className="bg-primary hover:bg-primary/90 text-white px-4 py-1.5 text-sm">
                                        {categoryTitle}
                                    </Badge>
                                )}
                                <div className="flex items-center text-slate-200 font-medium">
                                    <CalendarDays className="w-5 h-5 mr-2 text-primary" />
                                    {formattedDate}
                                </div>
                            </div>
                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight text-balance">
                                {newsItem.title}
                            </h1>
                        </div>
                    </div>
                </div>
            </div>

            {/* İçerik Metni */}
            <div className="container mx-auto px-4">
                <div className="max-w-3xl mx-auto bg-white">
                    <div className="
            prose prose-lg md:prose-xl prose-slate max-w-none mb-16
            [&>h2]:text-3xl [&>h2]:font-bold [&>h2]:text-slate-900 [&>h2]:mt-12 [&>h2]:mb-6
            [&>h3]:text-2xl [&>h3]:font-semibold [&>h3]:text-slate-900 [&>h3]:mt-8 [&>h3]:mb-4
            [&>p]:text-lg [&>p]:leading-relaxed [&>p]:mb-6 [&>p]:text-slate-700
            [&>ul]:list-disc [&>ul]:pl-6 [&>ul>li]:mb-2 [&>ul>li]:text-slate-700
            [&>ol]:list-decimal [&>ol]:pl-6 [&>ol>li]:mb-2 [&>ol>li]:text-slate-700
            [&_a]:text-primary [&_a]:underline [&_a:hover]:text-primary/80
            [&_img]:rounded-3xl [&_img]:shadow-xl [&_img]:mx-auto [&_img]:my-12
            [&_blockquote]:border-l-primary [&_blockquote]:bg-slate-50 [&_blockquote]:p-6 [&_blockquote]:rounded-r-2xl [&_blockquote]:italic
          ">
                        <RichText data={newsItem.content} />
                    </div>

                    {/* Fuar / Etkinlik Galerisi */}
                    {galleryImages.length > 0 && (
                        <div className="mt-20 pt-16 border-t">
                            <div className="text-center mb-10">
                                <h3 className="text-3xl font-bold text-slate-900 mb-4">Etkinlikten Kareler</h3>
                                <p className="text-slate-500">Etkinliğimize ait tüm görselleri detaylıca inceleyebilirsiniz.</p>
                            </div>
                            <div className="bg-slate-50 p-6 md:p-10 rounded-[2.5rem] shadow-inner">
                                <ProductGallery images={galleryImages} />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </article>
    )
}