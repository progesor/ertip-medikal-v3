import "@/styles/globals.css";
import { Inter } from "next/font/google";
import Script from "next/script";
import React from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import type { Metadata } from "next";
import { CartProvider } from "@/providers/CartProvider";
import { FloatingActionButton } from "@/components/layout/FloatingActionButton";

import { getPayload } from "payload";
import configPromise from "@payload-config";
import { themePalettes, radiusConfig } from "@/lib/themeConfig";
import { serverEnv } from "@/lib/config/env";
import { getRequestLocale } from "@/lib/i18n/requestLocale";

const inter = Inter({ subsets: ["latin"] });

const shellMetadata = {
  en: {
    title: "Ertip Medical | Innovative Medical Solutions",
    description:
      "Innovative medical devices and professional solutions backed by Ertip Medical's long-standing industry experience.",
    openGraphLocale: "en_US",
  },
  tr: {
    title: "Ertip Medikal | Yenilikçi Medikal Çözümler",
    description:
      "Sağlık sektörüne yön veren yenilikçi medikal cihazlar. Çeyrek asırlık tecrübemizle güvenilir çözüm ortağınız.",
    openGraphLocale: "tr_TR",
  },
} as const;

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const localized = shellMetadata[locale];

  return {
    metadataBase: new URL(serverEnv.publicSiteUrl),
    title: {
      default: localized.title,
      template: "%s | Ertip Medikal",
    },
    description: localized.description,
    icons: {
      icon: "/api/site-icon",
      shortcut: "/api/site-icon",
      apple: "/api/site-icon",
    },
    openGraph: {
      type: "website",
      locale: localized.openGraphLocale,
      siteName: "Ertip Medikal",
      images: [
        {
          url: "/og-image.jpg",
          width: 1200,
          height: 630,
          alt: "Ertip Medikal",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
    },
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [payload, locale] = await Promise.all([
    getPayload({ config: configPromise }),
    getRequestLocale(),
  ]);

  let themeSettings;
  try {
    themeSettings = await payload.findGlobal({ slug: "themeSettings" });
  } catch {
    themeSettings = { colorPalette: "dark-luxury", borderRadius: "modern" };
  }

  const currentPalette =
    themePalettes[
      themeSettings.colorPalette as keyof typeof themePalettes
    ] || themePalettes["dark-luxury"];
  const currentRadius =
    radiusConfig[themeSettings.borderRadius as keyof typeof radiusConfig] ||
    radiusConfig["modern"];
  const themeVariables = { ...currentPalette, ...currentRadius };
  const themeStyleString = `
    :root {
      ${Object.entries(themeVariables)
        .map(([key, value]) => `${key}: ${value};`)
        .join("\n      ")}
    }
  `;

  return (
    <html lang={locale} suppressHydrationWarning>
      <body
        className={`${inter.className} min-h-screen bg-background text-foreground antialiased flex flex-col`}
      >
        <style dangerouslySetInnerHTML={{ __html: themeStyleString }} />

        <CartProvider>
          <Header />
          <main className="flex-1 flex flex-col">{children}</main>
          <FloatingActionButton />
          <Footer />
        </CartProvider>

        {serverEnv.cloudflareWebAnalyticsToken && (
          <Script
            id="cloudflare-web-analytics"
            type="module"
            src="https://static.cloudflareinsights.com/beacon.min.js"
            strategy="afterInteractive"
            data-cf-beacon={JSON.stringify({
              token: serverEnv.cloudflareWebAnalyticsToken,
            })}
          />
        )}
      </body>
    </html>
  );
}
