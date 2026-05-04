import React from "react";
import { getPayload } from "payload";
import configPromise from "@payload-config";
import Link from "next/link";
import { CheckCircle2, AlertCircle, ArrowLeft, MailX } from "lucide-react";

// Next.js 15 kuralı: searchParams artık bir Promise
type Props = {
    searchParams: Promise<{ email?: string }>;
};

export default async function UnsubscribePage({ searchParams }: Props) {
    const { email } = await searchParams;
    const payload = await getPayload({ config: configPromise });

    // 1. EĞER URL'DE EMAIL YOKSA: MANUEL FORMU GÖSTER
    if (!email) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center bg-surface-muted/30 px-4 py-20">
                <div className="max-w-md w-full bg-white p-8 md:p-12 rounded-[2.5rem] shadow-2xl border border-border text-center">
                    <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <MailX className="w-10 h-10 text-slate-600" />
                    </div>
                    <h1 className="text-2xl md:text-3xl font-black text-text-main mb-4">
                        Abonelikten Ayrıl
                    </h1>
                    <p className="text-text-muted mb-8 leading-relaxed">
                        E-bülten aboneliğinizi iptal etmek için lütfen e-posta adresinizi girin.
                    </p>

                    {/* Harika numara: form action ile GET isteği atıldığında URL'ye ?email= ekler */}
                    <form action="/abonelikten-ayril" method="GET" className="space-y-4">
                        <input
                            type="email"
                            name="email"
                            required
                            placeholder="E-posta adresiniz..."
                            className="w-full px-4 py-3 rounded-xl border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-text-main"
                        />
                        <button
                            type="submit"
                            className="w-full h-14 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold transition-all shadow-lg shadow-red-600/20"
                        >
                            Aboneliğimi İptal Et
                        </button>
                    </form>

                    <Link
                        href="/"
                        className="inline-block mt-6 text-sm font-semibold text-text-muted hover:text-primary transition-colors"
                    >
                        Vazgeç ve Anasayfaya Dön
                    </Link>
                </div>
            </div>
        );
    }

    // 2. EĞER URL'DE EMAIL VARSA: VERİTABANINDA İŞLEM YAP
    let isSuccess = false;
    let message = "Geçersiz veya eksik bağlantı. Lütfen e-postanızdaki linki kontrol edin.";

    // E-posta adresini veritabanında ara
    const { docs } = await payload.find({
        collection: "subscribers",
        where: { email: { equals: email } },
        limit: 1,
    });

    if (docs.length > 0) {
        const subscriber = docs[0];

        // Eğer zaten çıkmışsa bilgi ver
        if (subscriber.status === "unsubscribed") {
            isSuccess = true;
            message = "Bu e-posta adresi zaten e-bülten listemizden çıkarılmış durumda.";
        } else {
            // Durumu "unsubscribed" olarak güncelle
            await payload.update({
                collection: "subscribers",
                id: subscriber.id,
                data: { status: "unsubscribed" },
            });
            isSuccess = true;
            message = "E-bülten aboneliğiniz başarıyla iptal edildi. Artık bizden tanıtım e-postası almayacaksınız.";
        }
    } else {
        message = "Bu e-posta adresi sistemimizde kayıtlı değil.";
    }

    return (
        <div className="min-h-[70vh] flex flex-col items-center justify-center bg-surface-muted/30 px-4 py-20">
            <div className="max-w-md w-full bg-white p-8 md:p-12 rounded-[2.5rem] shadow-2xl border border-border text-center">
                {isSuccess ? (
                    <>
                        <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle2 className="w-10 h-10 text-green-600" />
                        </div>
                        <h1 className="text-2xl md:text-3xl font-black text-text-main mb-4">
                            Abonelik İptal Edildi
                        </h1>
                        <p className="text-text-muted mb-8 leading-relaxed">
                            {message}
                        </p>
                    </>
                ) : (
                    <>
                        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <AlertCircle className="w-10 h-10 text-red-600" />
                        </div>
                        <h1 className="text-2xl md:text-3xl font-black text-text-main mb-4">
                            İşlem Başarısız
                        </h1>
                        <p className="text-text-muted mb-8 leading-relaxed">
                            {message}
                        </p>
                    </>
                )}

                <Link
                    href="/"
                    className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-primary text-white font-bold hover:bg-primary/90 transition-all w-full"
                >
                    <ArrowLeft className="w-5 h-5 mr-2" /> Anasayfaya Dön
                </Link>
            </div>
        </div>
    );
}