import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { RichText } from '@payloadcms/richtext-lexical/react'
import { ProductGallery } from '@/components/product/ProductGallery'
import {Metadata} from "next";
import {ProductView} from "@/components/product/ProductView";

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
        <main className="bg-white min-h-screen pb-24">
            <ProductView product={product} />
        </main>
    )
}