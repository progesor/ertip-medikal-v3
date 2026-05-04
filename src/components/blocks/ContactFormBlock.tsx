import React from "react";
import { ContactForm } from "@/components/contact/ContactForm";
import { PhoneCall, Mail, ShieldCheck } from "lucide-react";

export function ContactFormBlock({ title, formTitle, description, departments, quickContact }: any) {
    return (
        <section className="py-24 bg-surface-muted/50">
            <div className="container mx-auto px-4 max-w-7xl">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-center">

                    {/* SOL BÖLÜM: Kurumsal Bilgiler */}
                    <div className="lg:col-span-5 space-y-10">
                        <div>
                            <h2 className="text-4xl md:text-5xl font-black text-text-main mb-6 tracking-tight leading-tight">
                                {title || "Bize Ulaşın"}
                            </h2>
                            <p className="text-lg text-text-muted leading-relaxed">
                                {description || "Ertıp Medikal ürünleri, bayilik talepleri veya teknik destek için ekibimizle iletişime geçebilirsiniz."}
                            </p>
                        </div>

                        <div className="space-y-6">
                            {quickContact?.phone && (
                                // Kart yüzeyi tema kontrollü surface token'ını kullanır.
                                <div className="flex items-center gap-6 p-6 bg-surface rounded-3xl shadow-sm border border-border">
                                    <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                                        <PhoneCall className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-text-muted uppercase tracking-widest">Destek Hattı</p>
                                        <p className="text-xl font-black text-text-main">{quickContact.phone}</p>
                                    </div>
                                </div>
                            )}

                            {quickContact?.email && (
                                <div className="flex items-center gap-6 p-6 bg-surface rounded-3xl shadow-sm border border-border">
                                    <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                                        <Mail className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-text-muted uppercase tracking-widest">Kurumsal E-Posta</p>
                                        <p className="text-xl font-black text-text-main">{quickContact.email}</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* bg-text-main yerine temanın en derin rengi olan bg-foreground kullanıldı */}
                        <div className="p-8 bg-foreground rounded-3xl text-background">
                            <div className="flex items-center gap-3 mb-3">
                                <ShieldCheck className="w-6 h-6 text-primary" />
                                <span className="font-bold text-primary">MDR & ISO Kalitesi</span>
                            </div>
                            <p className="text-sm text-background/80 leading-relaxed italic">
                                {quickContact?.descriptionText || "Tüm talepleriniz uluslararası kalite standartları çerçevesinde kayıt altına alınarak en kısa sürede yanıtlanmaktadır."}
                            </p>
                        </div>
                    </div>

                    {/* SAĞ BÖLÜM: Dinamik Form */}
                    <div className="lg:col-span-7">
                        {/* Form kartı tema kontrollü yüzey ve gölge token'larını kullanır. */}
                        <div className="bg-surface p-8 md:p-14 rounded-3xl shadow-2xl shadow-surface-inverse/5 border border-border">
                            <div className="mb-10">
                                <h3 className="text-3xl font-black text-text-main mb-3">{formTitle || "Talep Formu"}</h3>
                                <div className="w-12 h-1.5 bg-primary rounded-full" />
                            </div>

                            {/* Güncellediğimiz formu çağırıyoruz ve departmanları prop olarak veriyoruz */}
                            <ContactForm departments={departments} />
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}
