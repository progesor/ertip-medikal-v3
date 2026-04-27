import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'

export function CTABlock({ title, description, buttonText, buttonLink, theme }: any) {
    const isDark = theme === 'dark'

    return (
        <section className="py-12 container mx-auto px-4">
            <div className={`rounded-[3rem] p-12 md:p-20 text-center space-y-8 shadow-2xl relative overflow-hidden ${isDark ? 'bg-slate-950 text-white' : 'bg-primary text-white'}`}>
                <div className="relative z-10 space-y-6">
                    <h2 className="text-3xl md:text-5xl font-black tracking-tight max-w-4xl mx-auto">{title}</h2>
                    {description && <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto">{description}</p>}
                    <div className="pt-4">
                        <Button size="lg" variant="secondary" className="rounded-full px-10 h-14 text-lg font-bold bg-white text-primary hover:bg-slate-100" asChild>
                            <Link href={buttonLink}>{buttonText} <ArrowRight className="ml-2 w-5 h-5" /></Link>
                        </Button>
                    </div>
                </div>
                {/* Dekoratif Işık */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 blur-[100px] rounded-full -mr-20 -mt-20" />
            </div>
        </section>
    )
}