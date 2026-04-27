import { ContactForm } from '@/components/contact/ContactForm'
import {Metadata} from "next";

export const metadata: Metadata = {
    title: 'İletişim ve Teklif Al',
    description: 'Ertip Medikal ile iletişime geçin. Medikal cihazlar hakkında detaylı bilgi, teknik destek ve fiyat teklifi alın.',
    openGraph: {
        title: 'İletişim ve Teklif Al',
        description: 'Ertip Medikal ile iletişime geçin. Teknik destek ve fiyat teklifi talepleriniz için bize ulaşın.',
        type: 'website',
    }
}

export default function ContactPage() {
    return (
        <div className="container mx-auto px-4 py-16 md:py-24 max-w-6xl">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">

                {/* Sol Taraf: İletişim Bilgileri */}
                <div className="space-y-10">
                    <div>
                        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 mb-6">Bize Ulaşın</h1>
                        <p className="text-lg text-slate-600 leading-relaxed">
                            Medikal cihaz ihtiyaçlarınız, teknik destek veya fiyat teklifi talepleriniz için aşağıdaki formu doldurarak veya doğrudan iletişim bilgilerimiz üzerinden uzman ekibimize ulaşabilirsiniz.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                        <div className="flex flex-col space-y-2">
                            <h3 className="text-xl font-bold text-slate-900">Merkez Ofis</h3>
                            <p className="text-slate-600 leading-relaxed">
                                Ertip Medikal A.Ş.<br />
                                İstanbul, Türkiye
                            </p>
                        </div>

                        <div className="flex flex-col space-y-2">
                            <h3 className="text-xl font-bold text-slate-900">İletişim</h3>
                            <p className="text-slate-600">Email: info@ertipmedikal.com.tr</p>
                            <p className="text-slate-600">Tel: +90 (212) 000 00 00</p>
                        </div>
                    </div>
                </div>

                {/* Sağ Taraf: İletişim Formu */}
                <div className="bg-white p-8 md:p-10 rounded-3xl shadow-xl border border-slate-100">
                    <ContactForm />
                </div>
            </div>
        </div>
    )
}