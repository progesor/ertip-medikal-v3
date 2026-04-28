"use client"

import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {Trash2, Send, ShoppingCart, ArrowRight, Plus, Minus} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCart } from '@/providers/CartProvider' // YENİ SİSTEM EKLENDİ

export default function QuoteCartPage() {
    // Eski useState ve useEffect'i sildik, her şeyi Merkezi Sağlayıcıdan (Context) çekiyoruz
    const { cartItems, removeFromCart, updateQuantity, clearCart } = useCart()

    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsSubmitting(true)

        const formData = new FormData(e.currentTarget)
        const payloadData = {
            customerName: formData.get('customerName'),
            company: formData.get('company'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            message: formData.get('message'),
            items: cartItems.map(item => ({
                productTitle: item.title,
                variantInfo: item.variant,
                sku: item.sku,
                quantity: item.quantity
            }))
        }

        try {
            const res = await fetch('/api/quote-requests', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payloadData),
            })

            if (res.ok) {
                setIsSuccess(true)
                clearCart() // Form başarıyla gönderilince sepeti merkezi olarak boşaltıyoruz
            } else {
                alert('Bir hata oluştu, lütfen daha sonra tekrar deneyin.')
            }
        } catch (error) {
            console.error(error)
            alert('Bağlantı hatası yaşandı.')
        } finally {
            setIsSubmitting(false)
        }
    }

    if (isSuccess) {
        return (
            <div className="min-h-screen bg-slate-50 py-24 flex items-center justify-center">
                <div className="bg-white p-12 rounded-[3rem] shadow-sm border border-slate-100 text-center max-w-lg">
                    <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Send className="w-10 h-10" />
                    </div>
                    <h2 className="text-3xl font-black text-slate-900 mb-4">Talebiniz Alındı!</h2>
                    <p className="text-slate-500 mb-8 leading-relaxed">
                        Teklif listeniz uzman ekibimize başarıyla ulaştı. En kısa sürede sizinle iletişime geçeceğiz.
                    </p>
                    <Button asChild size="lg" className="rounded-xl font-bold h-14 px-8">
                        <Link href="/urunler">Kataloğa Geri Dön</Link>
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className="bg-slate-50 min-h-screen pt-12 pb-24">
            <div className="bg-slate-900 py-16 mb-12">
                <div className="container mx-auto px-4 max-w-7xl">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 tracking-tight">Teklif Sepeti</h1>
                    <p className="text-lg text-slate-300">Seçtiğiniz medikal ürünler için hızlıca fiyat teklifi isteyin.</p>
                </div>
            </div>

            <div className="container mx-auto px-4 max-w-7xl">
                {cartItems.length === 0 ? (
                    <div className="bg-white p-16 rounded-[3rem] shadow-sm border border-slate-100 text-center flex flex-col items-center">
                        <ShoppingCart className="w-20 h-20 text-slate-200 mb-6" />
                        <h3 className="text-2xl font-bold text-slate-900 mb-2">Listeniz Şimdilik Boş</h3>
                        <p className="text-slate-500 mb-8">Teklif almak için ürün detay sayfalarından sepetinize ürün ekleyebilirsiniz.</p>
                        <Button asChild size="lg" className="rounded-2xl font-bold h-14 px-8">
                            <Link href="/urunler">Ürünleri İncele <ArrowRight className="ml-2 w-5 h-5" /></Link>
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">

                        {/* SOL BÖLÜM: Ürün Listesi */}
                        <div className="lg:col-span-3 space-y-6">
                            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                                <span className="bg-primary text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">{cartItems.length}</span>
                                Seçilen Ürünler
                            </h2>

                            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden divide-y divide-slate-100">
                                {cartItems.map((item, index) => (
                                    <div key={index} className="p-6 flex flex-col sm:flex-row items-center gap-6 group hover:bg-slate-50 transition-colors">

                                        {/* RESME TIKLAYINCA GİT */}
                                        <Link
                                            href={`/urunler/${item.slug}`}
                                            className="w-24 h-24 relative bg-slate-100 rounded-2xl p-2 shrink-0 hover:opacity-80 transition-opacity"
                                        >
                                            <Image
                                                src={item.image || '/placeholder.jpg'}
                                                alt={item.title}
                                                fill
                                                className="object-contain mix-blend-multiply"
                                                unoptimized
                                            />
                                        </Link>

                                        <div className="flex-1 text-center sm:text-left">
                                            {/* İSME TIKLAYINCA GİT */}
                                            <Link href={`/urunler/${item.slug}`} className="group/title">
                                                <h4 className="font-bold text-slate-900 text-lg group-hover/title:text-primary transition-colors">
                                                    {item.title}
                                                </h4>
                                            </Link>
                                            <p className="text-sm text-slate-500 mt-1">{item.variant}</p>
                                            <span className="inline-block mt-2 bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-mono font-bold">
        SKU: {item.sku}
      </span>
                                        </div>

                                        {/* ADET SEÇİCİ */}
                                        <div className="flex items-center gap-3 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
                                            <button
                                                type="button"
                                                // Değer yoksa 1 kabul et ve 1 çıkar
                                                onClick={() => updateQuantity(index, (item.quantity || 1) - 1)}
                                                className="w-8 h-8 flex items-center justify-center bg-white rounded-lg text-slate-600 hover:text-primary shadow-sm transition-all"
                                            >
                                                <Minus className="w-4 h-4" />
                                            </button>

                                            <span className="w-8 text-center font-bold text-slate-900">{item.quantity || 1}</span>

                                            <button
                                                type="button"
                                                // Değer yoksa 1 kabul et ve 1 ekle
                                                onClick={() => updateQuantity(index, (item.quantity || 1) + 1)}
                                                className="w-8 h-8 flex items-center justify-center bg-white rounded-lg text-slate-600 hover:text-primary shadow-sm transition-all"
                                            >
                                                <Plus className="w-4 h-4" />
                                            </button>
                                        </div>

                                        <button
                                            onClick={() => removeFromCart(index)}
                                            className="w-12 h-12 rounded-full flex items-center justify-center text-red-400 hover:text-white hover:bg-red-500 transition-all shrink-0"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* SAĞ BÖLÜM: İletişim Formu */}
                        <div className="lg:col-span-2">
                            <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50 sticky top-24">
                                <h3 className="text-2xl font-bold text-slate-900 mb-6">İletişim Bilgileriniz</h3>

                                <form onSubmit={handleSubmit} className="space-y-5">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Ad Soyad / Yetkili Adı *</label>
                                        <input required name="customerName" type="text" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" placeholder="Örn: Dr. Ahmet Yılmaz" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Klinik / Firma Adı</label>
                                        <input name="company" type="text" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" placeholder="Opsiyonel" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-2">E-Posta *</label>
                                            <input required name="email" type="email" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" placeholder="ornek@klinik.com" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-2">Telefon *</label>
                                            <input required name="phone" type="tel" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" placeholder="+90 5XX XXX XX XX" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Ek Notunuz (Opsiyonel)</label>
                                        <textarea name="message" rows={3} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all resize-none" placeholder="Belirtmek istediğiniz özel bir durum var mı?"></textarea>
                                    </div>

                                    <Button type="submit" disabled={isSubmitting} className="w-full h-14 rounded-xl text-lg font-bold mt-4">
                                        {isSubmitting ? 'Gönderiliyor...' : 'Teklif İsteğini Gönder'}
                                    </Button>
                                    <p className="text-xs text-center text-slate-400 mt-4">
                                        Bilgileriniz KVKK kapsamında korunmaktadır.
                                    </p>
                                </form>
                            </div>
                        </div>

                    </div>
                )}
            </div>
        </div>
    )
}