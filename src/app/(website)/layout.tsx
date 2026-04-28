import '@/styles/globals.css'
import { Inter } from 'next/font/google'
import React from 'react'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import {Metadata} from "next";
import {CartProvider} from "@/providers/CartProvider";

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
    // Sitenin ana URL'ini tanımlıyoruz (Arama motorları için zorunlu)
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://www.ertipmedikal.com.tr'),

    title: {
        default: 'Ertip Medikal | Yenilikçi Medikal Çözümler', // Hiçbir title girilmezse bu görünür
        template: '%s | Ertip Medikal', // Alt sayfalara girilen başlıkların sonuna otomatik ekler
    },
    description: 'Sağlık sektörüne yön veren yenilikçi medikal cihazlar. Çeyrek asırlık tecrübemizle güvenilir çözüm ortağınız.',

    // Sosyal Medya (WhatsApp, LinkedIn, Twitter) paylaşım ayarları
    openGraph: {
        type: 'website',
        locale: 'tr_TR',
        siteName: 'Ertip Medikal',
        images: [
            {
                url: '/og-image.jpg', // public klasörüne sitenin şık bir kapak fotoğrafını koyabilirsin
                width: 1200,
                height: 630,
                alt: 'Ertip Medikal Kurumsal',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
    },
}

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode
}) {
    return (
        <html lang="tr" suppressHydrationWarning>
        <body className={`${inter.className} min-h-screen bg-background text-foreground antialiased flex flex-col`}>
        <CartProvider>
        <Header />
        {/* main elementi sayfanın ortasını dolduracak şekilde flex-1 alır */}
        <main className="flex-1 flex flex-col">
            {children}
        </main>
        <Footer />
        </CartProvider>
        </body>
        </html>
    )
}