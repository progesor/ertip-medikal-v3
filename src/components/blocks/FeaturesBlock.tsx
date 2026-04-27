import React from 'react'
import { Star, Shield, Cpu, Globe, Heart, Settings } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const iconMap: Record<string, React.ElementType> = {
    star: Star,
    shield: Shield,
    cpu: Cpu,
    globe: Globe,
    heart: Heart,
    settings: Settings,
}

export function FeaturesBlock({ title, subtitle, features }: any) {
    if (!features || features.length === 0) return null

    return (
        <section className="py-20 bg-slate-50 border-y border-slate-100">
            <div className="container mx-auto px-4 max-w-6xl">

                {/* Başlık Alanı */}
                <div className="text-center mb-16 space-y-4">
                    {title && <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900">{title}</h2>}
                    {subtitle && <p className="text-lg text-slate-600 max-w-2xl mx-auto">{subtitle}</p>}
                </div>

                {/* Özellikler Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((feature: any, index: number) => {
                        const IconComponent = iconMap[feature.icon] || Star

                        return (
                            <Card key={index} className="border-0 shadow-sm hover:shadow-xl transition-all duration-300 group bg-white rounded-3xl">
                                <CardHeader>
                                    <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-white transition-colors duration-300 text-primary">
                                        <IconComponent className="w-7 h-7" />
                                    </div>
                                    <CardTitle className="text-xl font-bold text-slate-900">{feature.featureTitle}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {feature.featureDescription && (
                                        <p className="text-slate-600 leading-relaxed">
                                            {feature.featureDescription}
                                        </p>
                                    )}
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>
            </div>
        </section>
    )
}