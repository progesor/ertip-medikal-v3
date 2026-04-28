"use client"

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ShoppingCart, Search } from 'lucide-react'
import { useCart } from '@/providers/CartProvider'
import { Button } from '@/components/ui/button'

export function HeaderActions() {
    const { cartItems } = useCart()
    const [searchQuery, setSearchQuery] = useState('')
    const router = useRouter()

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        if (searchQuery.trim()) {
            router.push(`/urunler?q=${encodeURIComponent(searchQuery)}`)
        }
    }

    return (
        <div className="flex items-center gap-4 lg:gap-6 ml-auto">

            {/* ARAMA KUTUSU */}
            <form onSubmit={handleSearch} className="relative hidden lg:block w-48 xl:w-64">
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Ürün veya SKU Ara..."
                    className="w-full bg-slate-50 border border-slate-200 text-sm rounded-full pl-4 pr-10 py-2 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                />
                <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary">
                    <Search className="w-4 h-4" />
                </button>
            </form>

            {/* SEPET İKONU (Bildirimli) */}
            <Link href="/teklif-sepeti" className="relative p-2 text-slate-600 hover:text-primary transition-colors">
                <ShoppingCart className="w-6 h-6" />
                {cartItems.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white shadow-sm">
            {cartItems.length}
          </span>
                )}
            </Link>

            {/* ORJİNAL TEKLİF AL BUTONU */}
            <Link href="/iletisim" className="hidden sm:block">
                <Button variant="default" size="sm" className="rounded-full px-6">Bize Ulaşın</Button>
            </Link>
        </div>
    )
}