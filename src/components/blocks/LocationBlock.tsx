import React from "react";
import { MapPin, Phone, Mail, Clock } from "lucide-react";

export function LocationBlock({ title, locations }: any) {
    if (!locations || locations.length === 0) return null;

    return (
        <section className="py-24 bg-surface-muted/50">
            <div className="container mx-auto px-4 max-w-7xl">
                {title && (
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-black text-text-main tracking-tight">{title}</h2>
                        <div className="w-20 h-1.5 bg-primary mx-auto mt-6 rounded-full" />
                    </div>
                )}

                {/* Çoklu Lokasyon Izgarası (Grid) */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {locations.map((loc: any, i: number) => (
                        <div key={i} className="flex flex-col bg-white rounded-3xl shadow-sm hover:shadow-xl transition-shadow border border-border overflow-hidden">

                            {/* Harita Alanı (Üstte) */}
                            <div className="h-64 w-full bg-slate-200 relative border-b border-border">
                                {loc.mapUrl ? (
                                    <iframe src={loc.mapUrl} className="w-full h-full border-none" allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
                                ) : (
                                    <div className="absolute inset-0 flex items-center justify-center text-text-muted">Harita Yüklenmedi</div>
                                )}
                            </div>

                            {/* İletişim Detayları (Altta) */}
                            <div className="p-8 md:p-12 flex-1 flex flex-col justify-center">
                                <h3 className="text-2xl font-extrabold text-text-main mb-6">{loc.title}</h3>
                                <div className="space-y-5">
                                    {loc.address && (
                                        <div className="flex items-start gap-4">
                                            <MapPin className="w-6 h-6 text-primary shrink-0 mt-1" />
                                            <p className="text-text-muted leading-relaxed">{loc.address}</p>
                                        </div>
                                    )}
                                    {loc.phone && (
                                        <div className="flex items-center gap-4">
                                            <Phone className="w-6 h-6 text-primary shrink-0" />
                                            <p className="text-text-muted font-medium">{loc.phone}</p>
                                        </div>
                                    )}
                                    {loc.email && (
                                        <div className="flex items-center gap-4">
                                            <Mail className="w-6 h-6 text-primary shrink-0" />
                                            <p className="text-text-muted font-medium">{loc.email}</p>
                                        </div>
                                    )}
                                    {loc.workingHours && (
                                        <div className="flex items-center gap-4">
                                            <Clock className="w-6 h-6 text-primary shrink-0" />
                                            <p className="text-text-muted font-medium">{loc.workingHours}</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}