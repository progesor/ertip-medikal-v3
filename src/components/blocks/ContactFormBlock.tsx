import React from "react";
import { ContactForm } from "@/components/contact/ContactForm";
import { PhoneCall, Mail, ShieldCheck } from "lucide-react";

export function ContactFormBlock({ title, formTitle, description, departments, quickContact }: any) {
    return (
        <section className="py-24 bg-surface-subtle">
            <div className="container mx-auto px-4 max-w-7xl">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-center">

                    {/* SOL BÖLÜM: Kurumsal Bilgiler */}
                    <div className="lg:col-span-5 space-y-10">
                        <div>
                            <h2 className="text-4xl md:text-5xl font-black text-content-strong mb-6 tracking-tight leading-tight">
                                {title || "Bize Ulaşın"}
                            </h2>
                            <p className="text-lg text-content-muted leading-relaxed">
                                {description || "Ertıp Medikal ürünleri, bayilik talepleri veya teknik destek için ekibimizle iletişime geçebilirsiniz."}
                            </p>
                        </div>

                        <div className="space-y-6">
                            {quickContact?.phone && (
                                <div className="flex items-center gap-6 p-6 bg-white rounded-3xl shadow-sm border border-surface-muted">
                                    <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                                        <PhoneCall className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-content-subtle uppercase tracking-widest">Destek Hattı</p>
                                        <p className="text-xl font-black text-content-strong">{quickContact.phone}</p>
                                    </div>
                                </div>
                            )}

                            {quickContact?.email && (
                                <div className="flex items-center gap-6 p-6 bg-white rounded-3xl shadow-sm border border-surface-muted">
                                    <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                                        <Mail className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-content-subtle uppercase tracking-widest">Kurumsal E-Posta</p>
                                        <p className="text-xl font-black text-content-strong">{quickContact.email}</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="p-8 bg-brand-dark rounded-5xl text-white">
                            <div className="flex items-center gap-3 mb-3">
                                <ShieldCheck className="w-6 h-6 text-primary" />
                                <span className="font-bold text-primary">MDR & ISO Kalitesi</span>
                            </div>
                            <p className="text-sm text-content-soft leading-relaxed italic">
                                {quickContact?.descriptionText || "Tüm talepleriniz uluslararası kalite standartları çerçevesinde kayıt altına alınarak en kısa sürede yanıtlanmaktadır."}
                            </p>
                        </div>
                    </div>

                    {/* SAĞ BÖLÜM: Dinamik Form */}
                    <div className="lg:col-span-7">
                        <div className="bg-white p-8 md:p-14 rounded-6xl shadow-2xl shadow-slate-200/50 border border-surface-muted">
                            <div className="mb-10">
                                <h3 className="text-3xl font-black text-content-strong mb-3">{formTitle || "Talep Formu"}</h3>
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