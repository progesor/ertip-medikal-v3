import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { MapPin, Phone, Mail } from 'lucide-react'

export async function Footer() {
    const payload = await getPayload({ config: configPromise })
    const settings = await payload.findGlobal({ slug: 'site-settings', depth: 2 }) as any

    const { footer, contact, general } = settings
    const columnCount = footer?.columns?.length || 0

    // Sütun sayısına göre dinamik grid sınıfı belirliyoruz
    const gridClasses: Record<number, string> = {
        1: 'lg:grid-cols-1 max-w-2xl',
        2: 'lg:grid-cols-2',
        3: 'lg:grid-cols-3',
        4: 'lg:grid-cols-4',
    }
    const gridClass = gridClasses[columnCount as number] || 'lg:grid-cols-4'

    return (
        <footer className="bg-slate-950 text-slate-300 pt-20 pb-10 border-t border-slate-900">
            <div className="container mx-auto px-4">
                {/* Sütun sayısına göre kendini ayarlayan akıllı grid */}
                <div className={`grid grid-cols-1 md:grid-cols-2 ${gridClass} gap-12 mb-16`}>
                    {footer?.columns?.map((column: any, index: number) => {
                        switch (column.blockType) {
                            case 'textColumn':
                                // CMS'ten gelen beyaz logoyu, yoksa ana logoyu kullan
                                const footerLogo = general?.whiteLogo?.url || general?.siteLogo?.url
                                return (
                                    <div key={index} className="space-y-6">
                                        {column.showLogo && footerLogo && (
                                            <Link href="/">
                                                <Image
                                                    src={footerLogo}
                                                    alt="Ertip Medikal"
                                                    width={180}
                                                    height={50}
                                                    className="h-12 w-auto object-contain"
                                                    unoptimized
                                                />
                                            </Link>
                                        )}
                                        <p className="text-sm leading-relaxed text-slate-400 max-w-sm">
                                            {column.text}
                                        </p>
                                    </div>
                                )

                            case 'menuColumn':
                                return (
                                    <div key={index} className="space-y-6">
                                        <h4 className="text-white font-bold uppercase tracking-widest text-sm">{column.title}</h4>
                                        <ul className="space-y-3">
                                            {column.links?.map((item: any, i: number) => (
                                                <li key={i}>
                                                    <Link href={item.url || '#'} className="hover:text-primary transition-colors text-sm">
                                                        {item.label}
                                                    </Link>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )

                            case 'contactColumn':
                                return (
                                    <div key={index} className="space-y-6">
                                        <h4 className="text-white font-bold uppercase tracking-widest text-sm">{column.title}</h4>
                                        <ul className="space-y-4">
                                            {column.showAddress && contact?.address && (
                                                <li className="flex items-start gap-3 text-sm">
                                                    <MapPin className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                                                    <span>{contact.address}</span>
                                                </li>
                                            )}
                                            {column.showPhone && contact?.phone && (
                                                <li className="flex items-center gap-3 text-sm">
                                                    <Phone className="w-5 h-5 text-primary shrink-0" />
                                                    <span>{contact.phone}</span>
                                                </li>
                                            )}
                                            {column.showEmail && contact?.email && (
                                                <li className="flex items-center gap-3 text-sm">
                                                    <Mail className="w-5 h-5 text-primary shrink-0" />
                                                    <span>{contact.email}</span>
                                                </li>
                                            )}
                                        </ul>
                                    </div>
                                )
                            default:
                                return null
                        }
                    })}
                </div>

                {/* Alt Bar: Copyright, Yasal Linkler ve Sosyal Medya */}
                <div className="mt-16 pt-8 border-t border-slate-900">
                    <div className="flex flex-col lg:flex-row items-center justify-between gap-8 text-sm text-slate-500">

                        {/* Sol: Copyright ve Yasal Linkler */}
                        <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8 text-center md:text-left">
                            <p>{footer?.copyright}</p>

                            {footer?.bottomLinks && footer.bottomLinks.length > 0 && (
                                <div className="flex gap-4 md:gap-6">
                                    {footer.bottomLinks.map((link: any, i: number) => (
                                        <Link
                                            key={i}
                                            href={link.url}
                                            className="hover:text-primary transition-colors hover:underline underline-offset-4 decoration-primary/30"
                                        >
                                            {link.label}
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Sağ: Sosyal Medya Linkleri */}
                        {settings.socialMedia && settings.socialMedia.length > 0 && (
                            <div className="flex items-center gap-6">
                                {settings.socialMedia.map((social: any, idx: number) => (
                                    <a
                                        key={idx}
                                        href={social.url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-slate-400 hover:text-white transition-all duration-300 font-medium flex items-center gap-2 group"
                                    >
                                        {/* Platform isminin yanında küçük bir nokta veya çizgi dekoru */}
                                        <span className="w-1 h-1 bg-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                                        {social.platform}
                                    </a>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </footer>
    )
}
