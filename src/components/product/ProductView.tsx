"use client"

import React, { useState, useMemo } from 'react'
import Image from 'next/image'
import { Check, Info, ShoppingCart, Award, PlayCircle, PackageOpen, Ruler } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import {useCart} from "@/providers/CartProvider";

// YOUTUBE ID YAKALAYICI
function getYouTubeId(url: string) {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
}

export function ProductView({ product }: any) {
    const [selectedAttrs, setSelectedAttrs] = useState<Record<string, string>>({})
    const { addToCart } = useCart()

    const currentVariant = useMemo(() => {
        if (!product.variants || product.variants.length === 0) return null
        return product.variants.find((v: any) => {
            return Object.values(selectedAttrs).every(val => v.title.includes(val))
        })
    }, [selectedAttrs, product.variants])

    const handleAddToCart = () => {
        const itemToAdd = {
            id: product.id,
            title: product.title,
            slug: product.slug,
            variant: currentVariant?.title || 'Standart',
            sku: currentVariant?.sku || product.sku,
            image: typeof product.mainImage === 'object' ? product.mainImage?.url : ''
        }
        // const currentCart = JSON.parse(localStorage.getItem('quote_cart') || '[]')
        // localStorage.setItem('quote_cart', JSON.stringify([...currentCart, itemToAdd]))
        // alert('Ürün teklif listesine eklendi!')
        addToCart(itemToAdd)
    }

    const videoId = getYouTubeId(product.videoUrl || '');

    // Lojistik bilgilerin nerede gösterileceği ayarı
    const pos = product.logisticDisplayPosition || 'below';

    // --- YARDIMCI BİLEŞEN: Net Ölçüler Kartı ---
    const NetDimensions = ({ mode }: { mode: 'sidebar' | 'wide' }) => {
        if (!product.width && !product.height && !product.depth && !product.weight) return null;

        if (mode === 'sidebar') {
            return (
                <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 space-y-4">
                    <h4 className="font-bold flex items-center gap-2 text-md text-slate-900">
                        <Ruler className="text-primary w-4 h-4" /> Net Ürün Boyutları
                    </h4>
                    <ul className="space-y-2 text-sm">
                        {(product.width || product.height || product.depth) && (
                            <li className="flex justify-between border-b border-slate-200 pb-2">
                                <span className="text-slate-500">Ölçüler (G-Y-D):</span>
                                <strong className="text-slate-900">{product.width || '-'}x{product.height || '-'}x{product.depth || '-'} mm</strong>
                            </li>
                        )}
                        {product.weight && (
                            <li className="flex justify-between pt-1">
                                <span className="text-slate-500">Net Ağırlık:</span>
                                <strong className="text-slate-900">{product.weight} gr</strong>
                            </li>
                        )}
                    </ul>
                </div>
            );
        }

        return (
            <div className="space-y-4">
                <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <div className="w-1.5 h-6 bg-primary rounded-full" /> Ürün Boyut ve Ağırlığı (Net)
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { label: 'Genişlik', value: product.width, unit: 'mm' },
                        { label: 'Yükseklik', value: product.height, unit: 'mm' },
                        { label: 'Derinlik', value: product.depth, unit: 'mm' },
                        { label: 'Net Ağırlık', value: product.weight, unit: 'gr' }
                    ].map((item, idx) => item.value && (
                        <div key={idx} className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm">
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">{item.label}</p>
                            <p className="text-lg font-black text-slate-900">{item.value} <span className="text-sm font-normal text-slate-500">{item.unit}</span></p>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    // --- YARDIMCI BİLEŞEN: Ambalaj Tablosu ---
    const PackagingTable = ({ mode }: { mode: 'sidebar' | 'wide' }) => {
        if (!product.packaging || product.packaging.length === 0) return null;

        if (mode === 'sidebar') {
            return (
                <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 space-y-4">
                    <h4 className="font-bold flex items-center gap-2 text-md text-slate-900">
                        <PackageOpen className="text-primary w-4 h-4" /> Lojistik Bilgisi
                    </h4>
                    <div className="space-y-3">
                        {product.packaging.map((p: any, i: number) => (
                            <div key={i} className="text-sm border-b border-slate-200 pb-3 last:border-0 last:pb-0">
                                <p className="font-bold text-slate-800 mb-1">{p.packageLabel} <span className="text-primary">({p.quantity} Adet)</span></p>
                                <p className="text-slate-500 text-xs">Boyut: {p.p_width}x{p.p_height}x{p.p_depth} cm</p>
                                <p className="text-slate-500 text-xs mt-0.5">Brüt Ağırlık: <strong className="text-slate-700">{p.grossWeight} kg</strong></p>
                            </div>
                        ))}
                    </div>
                </div>
            );
        }

        return (
            <div className="space-y-4 mt-10">
                <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <div className="w-1.5 h-6 bg-primary rounded-full" /> Lojistik ve Ambalaj Bilgileri
                </h3>
                <div className="overflow-hidden rounded-[2rem] border border-slate-100 shadow-sm">
                    <table className="w-full text-left border-collapse text-sm">
                        <thead className="bg-slate-50 border-b border-slate-100">
                        <tr>
                            <th className="px-6 py-4 font-bold text-slate-900">Paketleme Formu</th>
                            <th className="px-6 py-4 font-bold text-slate-900">İçerik Adedi</th>
                            <th className="px-6 py-4 font-bold text-slate-900">Ölçüler (cm)</th>
                            <th className="px-6 py-4 font-bold text-slate-900">Brüt Ağırlık</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                        {product.packaging.map((p: any, i: number) => (
                            <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                                <td className="px-6 py-4 font-bold text-slate-800">{p.packageLabel}</td>
                                <td className="px-6 py-4 text-slate-600">{p.quantity} Adet</td>
                                <td className="px-6 py-4 font-mono text-slate-500">{p.p_width}x{p.p_height}x{p.p_depth}</td>
                                <td className="px-6 py-4 text-slate-900 font-bold">{p.grossWeight} kg</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    return (
        <div className="container mx-auto px-4 max-w-7xl pt-12">
            {/* Üst Kısım: Görsel ve Seçim Alanı (Değişiklik Yok) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-20">

                {/* Sol: Görsel Galerisi */}
                <div className="space-y-4">
                    <div className="relative aspect-square rounded-[3rem] overflow-hidden bg-slate-50 border border-slate-100 p-12">
                        <Image
                            src={product.mainImage?.url || '/placeholder.jpg'}
                            alt={product.title}
                            fill
                            className="object-contain p-8"
                            unoptimized
                        />
                    </div>
                    {product.gallery && product.gallery.length > 0 && (
                        <div className="grid grid-cols-4 gap-4">
                            {product.gallery.map((item: any, i: number) => (
                                <div key={i} className="relative aspect-square rounded-2xl overflow-hidden bg-slate-50 border border-slate-100 cursor-pointer hover:border-primary transition-colors">
                                    <Image src={item.image?.url} alt={product.title} fill className="object-contain p-2" unoptimized />
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Sağ: Bilgi ve Varyantlar */}
                <div className="flex flex-col space-y-8">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-4">{product.title}</h1>
                        <div className="flex items-center gap-4">
                            <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-mono font-bold">
                                SKU: {currentVariant?.sku || product.sku || 'Belirtilmedi'}
                            </span>
                            <span className="text-primary text-sm font-bold flex items-center gap-1">
                                <Award className="w-4 h-4" /> Orijinal Ertip Ürünü
                            </span>
                        </div>
                    </div>

                    {product.shortDescription && (
                        <p className="text-slate-500 leading-relaxed">{product.shortDescription}</p>
                    )}

                    {/* Varyant Seçiciler */}
                    {product.attributes && product.attributes.length > 0 && (
                        <div className="space-y-6 pt-4">
                            {product.attributes.map((attr: any, i: number) => {
                                const values = attr.values.split('-').map((v: string) => v.trim())
                                return (
                                    <div key={i} className="space-y-3">
                                        <label className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                                            {attr.name} Seçimi
                                        </label>
                                        <div className="flex flex-wrap gap-2">
                                            {values.map((val: string) => (
                                                <button
                                                    key={val}
                                                    onClick={() => setSelectedAttrs(prev => ({ ...prev, [attr.name]: val }))}
                                                    className={`px-5 py-2.5 rounded-xl text-sm font-bold border transition-all ${
                                                        selectedAttrs[attr.name] === val
                                                            ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20'
                                                            : 'bg-white border-slate-200 text-slate-600 hover:border-primary hover:text-primary'
                                                    }`}
                                                >
                                                    {val}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}

                    {/* Aksiyon Butonları */}
                    <div className="pt-8 flex flex-col sm:flex-row gap-4">
                        <Button
                            size="lg"
                            className="h-16 px-10 rounded-2xl text-lg font-bold flex-1"
                            onClick={handleAddToCart}
                        >
                            <ShoppingCart className="mr-2 w-6 h-6" /> Teklif Sepetine Ekle
                        </Button>
                    </div>
                </div>
            </div>

            {/* Alt Kısım: Detaylı Tablolar */}
            <Tabs defaultValue="description" className="w-full">
                <TabsList className="w-full justify-start border-b rounded-none bg-transparent h-auto p-0 mb-12 flex-wrap gap-y-4">
                    <TabsTrigger value="description" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 md:px-8 py-4 font-bold text-base md:text-lg">Açıklama</TabsTrigger>

                    {product.variants && product.variants.length > 0 && (
                        <TabsTrigger value="variants" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 md:px-8 py-4 font-bold text-base md:text-lg">Tüm Modeller (SKU)</TabsTrigger>
                    )}

                    {videoId && (
                        <TabsTrigger value="video" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 md:px-8 py-4 font-bold text-base md:text-lg flex items-center gap-2">
                            <PlayCircle className="w-5 h-5" /> Tanıtım Videosu
                        </TabsTrigger>
                    )}
                </TabsList>

                {/* AÇIKLAMA SEKMESİ VE DİNAMİK YERLEŞİMLER */}
                <TabsContent value="description" className="max-w-none">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">

                        {/* SOL KOLON: Açıklama ve (Eğer seçildiyse) Alt Geniş Tablolar */}
                        <div className="lg:col-span-2 text-slate-700 leading-relaxed space-y-8">

                            {/* MARKDOWN / HTML GÖSTERİM ALANI */}
                            {product.description ? (
                                <div className="prose prose-slate prose-lg max-w-none
    prose-headings:text-slate-900
    prose-a:text-primary hover:prose-a:text-primary/80
    prose-img:rounded-[2rem] prose-img:border prose-img:border-slate-100
    prose-table:border-collapse prose-table:w-full
    prose-th:bg-slate-50 prose-th:p-4
    prose-td:p-4 prose-td:border-b prose-td:border-slate-100

    prose-code:bg-slate-100 prose-code:text-slate-700
    prose-code:px-2.5 prose-code:py-1 prose-code:rounded-lg
    prose-code:font-mono prose-code:text-sm prose-code:font-bold
    prose-code:before:hidden prose-code:after:hidden
">
                                    {/* GÜVENLİK KONTROLÜ: Veri string (metin) değilse (eski lexical JSON ise) hata vermesini engelliyoruz */}
                                    {typeof product.description === 'string' ? (
                                        <ReactMarkdown
                                            remarkPlugins={[remarkGfm]}
                                            rehypePlugins={[rehypeRaw]}
                                        >
                                            {product.description}
                                        </ReactMarkdown>
                                    ) : (
                                        <div className="p-4 bg-amber-50 text-amber-700 border border-amber-200 rounded-xl">
                                            ⚠️ Bu ürünün açıklaması eski formatta (Lexical) kayıtlı kalmış. Lütfen Admin panelinden bu ürünü düzenleyip açıklamasını HTML/Markdown olarak yeniden yapıştırıp kaydedin.
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <p className="italic text-slate-400">Bu ürün için detaylı bir açıklama girilmemiştir.</p>
                            )}

                            {/* EĞER YERLEŞİM 'below' veya 'both' İSE BURADA GÖSTER */}
                            {(pos === 'below' || pos === 'both') && (
                                <div className="mt-16 space-y-12 border-t border-slate-100 pt-10">
                                    <NetDimensions mode="wide" />
                                    <PackagingTable mode="wide" />
                                </div>
                            )}
                        </div>

                        {/* SAĞ KOLON (SİDEBAR): Özellikler Kartı ve (Eğer seçildiyse) Lojistik Kartları */}
                        <div className="space-y-6 sticky top-24">
                            {product.specs && product.specs.length > 0 && (
                                <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100 space-y-6">
                                    <h4 className="font-bold flex items-center gap-2 text-lg"><Info className="text-primary w-5 h-5" /> Temel Özellikler</h4>
                                    <ul className="space-y-4 text-sm">
                                        {product.specs.map((spec: any, i: number) => (
                                            <li key={i} className="flex justify-between items-center border-b border-slate-200 pb-3 last:border-0 last:pb-0">
                                                <span className="text-slate-500">{spec.key}:</span>
                                                <strong className="text-slate-900 text-right max-w-[60%]">{spec.value}</strong>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* EĞER YERLEŞİM 'sidebar' veya 'both' İSE BURADA KART OLARAK GÖSTER */}
                            {(pos === 'sidebar' || pos === 'both') && (
                                <>
                                    <NetDimensions mode="sidebar" />
                                    <PackagingTable mode="sidebar" />
                                </>
                            )}
                        </div>
                    </div>
                </TabsContent>

                {/* VARYANTLAR (SKU) SEKMESİ */}
                {product.variants && product.variants.length > 0 && (
                    <TabsContent value="variants">
                        <div className="overflow-x-auto rounded-[2rem] border border-slate-100 shadow-sm">
                            <table className="w-full text-left border-collapse min-w-[600px]">
                                <thead className="bg-slate-50 border-b border-slate-100">
                                <tr>
                                    <th className="px-6 py-4 font-bold text-slate-900">Varyant Modeli</th>
                                    <th className="px-6 py-4 font-bold text-slate-900">Ürün Kodu (SKU)</th>
                                    <th className="px-6 py-4 font-bold text-slate-900">Durum</th>
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                {product.variants.map((v: any, i: number) => (
                                    <tr key={i} className={`hover:bg-slate-50/50 transition-colors ${currentVariant?.sku === v.sku ? 'bg-primary/5' : ''}`}>
                                        <td className="px-6 py-4 text-sm font-medium text-slate-700">{v.title}</td>
                                        <td className="px-6 py-4 text-sm font-mono text-primary font-bold">{v.sku}</td>
                                        <td className="px-6 py-4 text-sm">
                                            <span className="flex items-center gap-1 text-green-600 font-bold">
                                              <Check className="w-4 h-4" /> Stokta Var
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </TabsContent>
                )}

                {/* VİDEO SEKMESİ */}
                {videoId && (
                    <TabsContent value="video" className="pt-4">
                        <div className="max-w-4xl mx-auto">
                            <div className="aspect-video w-full rounded-[2rem] overflow-hidden shadow-xl border border-slate-200 bg-black">
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
                    </TabsContent>
                )}
            </Tabs>
        </div>
    )
}