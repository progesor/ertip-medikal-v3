import { ChevronRight, ChevronDown } from 'lucide-react'
import React from "react"

export function ProcessBlock({ title, steps, showArrows }: any) {
    return (
        <section className="py-24 bg-white overflow-hidden">
            <div className="container mx-auto px-4 max-w-7xl">
                <h2 className="text-3xl md:text-4xl font-extrabold text-center mb-20 text-slate-900">{title}</h2>

                <div className="flex flex-col lg:flex-row items-center lg:items-start justify-between gap-8 lg:gap-4 relative">
                    {steps?.map((step: any, i: number) => (
                        <React.Fragment key={i}>
                            <div className="flex-1 text-center group relative z-10 w-full max-w-xs">
                                <div className="w-20 h-20 rounded-3xl bg-primary text-white flex items-center justify-center text-2xl font-black mx-auto mb-6 shadow-xl shadow-primary/20 group-hover:scale-110 transition-transform duration-300 border-4 border-white">
                                    {step.stepNumber}
                                </div>
                                <h4 className="text-xl font-bold text-slate-900 mb-4">{step.title}</h4>
                                <p className="text-slate-500 text-sm leading-relaxed">{step.description}</p>
                            </div>

                            {/* Ok Mekanizması: Son adım değilse ve oklar açıksa göster */}
                            {showArrows && i < steps.length - 1 && (
                                <div className="flex items-center justify-center py-4 lg:py-0 lg:pt-6">
                                    {/* Masaüstü Ok (Sağa) */}
                                    <ChevronRight className="hidden lg:block w-8 h-8 text-slate-200 animate-pulse" />
                                    {/* Mobil Ok (Aşağı) */}
                                    <ChevronDown className="lg:hidden w-8 h-8 text-slate-200 animate-pulse" />
                                </div>
                            )}
                        </React.Fragment>
                    ))}
                </div>
            </div>
        </section>
    )
}