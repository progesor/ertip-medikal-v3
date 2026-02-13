import '@/styles/globals.css'
import { Inter } from 'next/font/google'
import React from 'react'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
    title: 'Ertip Medikal | Yenilikçi Medikal Çözümler',
    description: 'Türkiye\'nin öncü medikal cihaz tedarikçisi.',
}

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode
}) {
    return (
        <html lang="tr" suppressHydrationWarning>
        <body className={`${inter.className} min-h-screen bg-background text-foreground antialiased flex flex-col`}>
        <Header />
        {/* main elementi sayfanın ortasını dolduracak şekilde flex-1 alır */}
        <main className="flex-1 flex flex-col">
            {children}
        </main>
        <Footer />
        </body>
        </html>
    )
}