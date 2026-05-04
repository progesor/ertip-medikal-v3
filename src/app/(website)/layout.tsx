import "@/styles/globals.css";
import { Inter } from "next/font/google";
import React from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Metadata } from "next";
import { CartProvider } from "@/providers/CartProvider";

// Payload ve Tema Importları
import { getPayload } from "payload";
import configPromise from "@payload-config";
import { themePalettes, radiusConfig } from "@/lib/themeConfig";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(
      process.env.NEXT_PUBLIC_SITE_URL || "https://www.ertipmedikal.com.tr",
  ),
  title: {
    default: "Ertip Medikal | Yenilikçi Medikal Çözümler",
    template: "%s | Ertip Medikal",
  },
  description:
      "Sağlık sektörüne yön veren yenilikçi medikal cihazlar. Çeyrek asırlık tecrübemizle güvenilir çözüm ortağınız.",
  openGraph: {
    type: "website",
    locale: "tr_TR",
    siteName: "Ertip Medikal",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Ertip Medikal Kurumsal",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default async function RootLayout({
                                           children,
                                         }: {
  children: React.ReactNode;
}) {
  const payload = await getPayload({ config: configPromise });

    let themeSettings;
    try {
        themeSettings = await payload.findGlobal({ slug: "themeSettings" });
    } catch {
        themeSettings = { colorPalette: "dark-luxury", borderRadius: "modern" };
    }

    // Seçilen paleti ve yuvarlaklığı config'den al
    const currentPalette = themePalettes[themeSettings.colorPalette as keyof typeof themePalettes] || themePalettes["dark-luxury"];
    const currentRadius = radiusConfig[themeSettings.borderRadius as keyof typeof radiusConfig] || radiusConfig["modern"];

    // Seçilen iki objeyi birleştirip :root altına dinamik olarak basıyoruz
    const themeVariables = { ...currentPalette, ...currentRadius };

    const themeStyleString = `
    :root {
      ${Object.entries(themeVariables)
        .map(([key, value]) => `${key}: ${value};`)
        .join("\n      ")}
    }
  `;

    return (
        <html lang="tr" suppressHydrationWarning>
        <body className={`${inter.className} min-h-screen bg-background text-foreground antialiased flex flex-col`}>
        {/* Tüm CSS değişkenleri burada çalışma anında ezilir */}
        <style dangerouslySetInnerHTML={{ __html: themeStyleString }} />

      <CartProvider>
        <Header />
        <main className="flex-1 flex flex-col">{children}</main>
        <Footer />
      </CartProvider>
      </body>
      </html>
  );
}
