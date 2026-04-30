"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Send, CheckCircle2 } from "lucide-react";

export function ContactForm({ departments }: { departments?: any[] }) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        const formData = new FormData(e.currentTarget);
        const selectedDepartment = formData.get("department");
        const rawMessage = formData.get("message");

        // Inquiries koleksiyonunda 'department' alanı olmadığı için mesajın başına ekliyoruz
        const finalMessage = selectedDepartment
            ? `[İlgili Departman: ${selectedDepartment}]\n\n${rawMessage}`
            : rawMessage;

        // Payload CMS API'sine gönderilecek veri objesi
        const payloadData = {
            name: formData.get("name"),
            email: formData.get("email"),
            phone: formData.get("phone"),
            message: finalMessage,
        };

        try {
            // Doğrudan senin mevcut Inquiries koleksiyonuna POST atıyoruz
            const res = await fetch("/api/inquiries", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payloadData),
            });

            if (res.ok) {
                setIsSuccess(true);
                (e.target as HTMLFormElement).reset();
            } else {
                const errorData = await res.json();
                setError(errorData.errors?.[0]?.message || "Bir hata oluştu. Lütfen tekrar deneyin.");
            }
        } catch (err) {
            console.error("Form submission error:", err);
            setError("Bağlantı hatası yaşandı. Lütfen internetinizi kontrol edin.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Başarılı gönderim ekranı
    if (isSuccess) {
        return (
            <div className="flex flex-col items-center justify-center text-center p-8 bg-green-50 rounded-2xl border border-green-100">
                <CheckCircle2 className="w-16 h-16 text-green-600 mb-4" />
                <h3 className="text-2xl font-bold text-text-main mb-2">Mesajınız Alındı!</h3>
                <p className="text-text-muted mb-6">
                    Talebiniz ilgili departmanımıza başarıyla iletildi. En kısa sürede sizinle iletişime geçeceğiz.
                </p>
                <Button
                    variant="outline"
                    onClick={() => setIsSuccess(false)}
                    className="font-bold border-border text-text-main"
                >
                    Yeni Mesaj Gönder
                </Button>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
                <div className="p-4 bg-red-50 text-red-600 text-sm font-semibold rounded-xl border border-red-100">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-sm font-bold text-text-main">Ad Soyad *</label>
                    <input
                        required
                        name="name"
                        type="text"
                        className="w-full px-4 py-3 rounded-xl border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                        placeholder="Örn: Dr. Ahmet Yılmaz"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-bold text-text-main">E-Posta *</label>
                    <input
                        required
                        name="email"
                        type="email"
                        className="w-full px-4 py-3 rounded-xl border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                        placeholder="ornek@klinik.com"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-sm font-bold text-text-main">Telefon</label>
                    <input
                        name="phone"
                        type="tel"
                        className="w-full px-4 py-3 rounded-xl border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                        placeholder="+90 5XX XXX XX XX"
                    />
                </div>

                {/* CMS'ten gelen dinamik departmanlar */}
                {departments && departments.length > 0 && (
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-text-main">İlgili Departman</label>
                        <select
                            name="department"
                            className="w-full px-4 py-3 rounded-xl border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all bg-white"
                        >
                            <option value="">Genel / Diğer</option>
                            {departments.map((dep: any, index: number) => (
                                <option key={index} value={dep.label}>
                                    {dep.label}
                                </option>
                            ))}
                        </select>
                    </div>
                )}
            </div>

            <div className="space-y-2">
                <label className="text-sm font-bold text-text-main">Mesajınız *</label>
                <textarea
                    required
                    name="message"
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all resize-none"
                    placeholder="Talebinizi detaylıca buraya yazabilirsiniz..."
                />
            </div>

            <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-14 rounded-xl text-lg font-bold group"
            >
                {isSubmitting ? (
                    "Gönderiliyor..."
                ) : (
                    <>
                        Mesajı Gönder
                        <Send className="w-5 h-5 ml-2 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    </>
                )}
            </Button>
        </form>
    );
}