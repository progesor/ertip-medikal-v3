import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { notFound } from 'next/navigation'
import { HeroBlock } from '@/components/blocks/HeroBlock'
import { ContentBlock } from '@/components/blocks/ContentBlock'

type Args = {
    params: Promise<{
        slug: string
    }>
}

export default async function DynamicPage({ params }: Args) {
    const { slug } = await params

    const payload = await getPayload({ config: configPromise })

    // Slug'a göre sayfayı bul
    const { docs } = await payload.find({
        collection: 'pages',
        where: {
            slug: { equals: slug },
            _status: { equals: 'published' }
        },
        limit: 1,
        depth: 2, // Resim URL'lerini çekebilmek için depth gerekli
    })

    const page = docs[0]

    // Sayfa yoksa 404'e düş
    if (!page) {
        return notFound()
    }

    return (
        <div className="flex flex-col min-h-screen">
            {/* Sayfanın bloklarını (layout) döngüye sok ve render et */}
            {page.layout?.map((block: any, index: number) => {
                switch (block.blockType) {
                    case 'hero':
                        return <HeroBlock key={index} {...block} />
                    case 'content':
                        return <ContentBlock key={index} {...block} />
                    default:
                        return (
                            <div key={index} className="p-4 text-center text-red-500">
                                Tanımsız Blok: {block.blockType}
                            </div>
                        )
                }
            })}
        </div>
    )
}