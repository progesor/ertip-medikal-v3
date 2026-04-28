import React from "react";
import { MapPin, Phone, Mail, Clock } from "lucide-react";

export function LocationBlock({
  title,
  address,
  phone,
  email,
  workingHours,
  mapUrl,
}: any) {
  return (
    <section className="py-24 bg-slate-50">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 bg-white rounded-[2.5rem] shadow-xl overflow-hidden border border-slate-100">
          {/* Sol Taraf: İletişim Bilgileri */}
          <div className="p-10 md:p-16 flex flex-col justify-center">
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-8">
              {title}
            </h2>
            <div className="space-y-6">
              {address && (
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-slate-900 mb-1">
                      Adres
                    </h4>
                    <p className="text-slate-600 leading-relaxed">{address}</p>
                  </div>
                </div>
              )}
              {phone && (
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                    <Phone className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-slate-900 mb-1">
                      Telefon
                    </h4>
                    <p className="text-slate-600 font-medium">{phone}</p>
                  </div>
                </div>
              )}
              {email && (
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                    <Mail className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-slate-900 mb-1">
                      E-Posta
                    </h4>
                    <p className="text-slate-600 font-medium">{email}</p>
                  </div>
                </div>
              )}
              {workingHours && (
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                    <Clock className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-slate-900 mb-1">
                      Çalışma Saatleri
                    </h4>
                    <p className="text-slate-600 font-medium">{workingHours}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sağ Taraf: Google Haritalar İframe */}
          <div className="h-[400px] lg:h-auto w-full bg-slate-200 relative">
            {mapUrl ? (
              <iframe
                src={mapUrl}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="absolute inset-0"
              ></iframe>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-slate-400 font-medium">
                Harita URL'si girilmedi
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
