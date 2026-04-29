"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { submitInquiry } from "@/app/actions/submitInquiry";

// CMS'ten gelecek departman prop'unu tanımlıyoruz
export function ContactForm({ departments }: { departments?: { label: string }[] }) {
    const [isPending, startTransition] = useTransition();
    const [status, setStatus] = useState<{
        success?: boolean;
        error?: string;
    } | null>(null);

    const handleSubmit = (formData: FormData) => {
        setStatus(null);
        startTransition(async () => {
            const result = await submitInquiry(formData);
            setStatus(result);
        });
    };

    if (status?.success) {
        return (
            <div className="p-8 bg-green-50 text-green-800 rounded-2xl border border-green-200 text-center space-y-4">
                <h3 className="text-2xl font-bold">Talebiniz Alındı!</h3>
                <p className="text-lg">
                    Mesajınız ilgili departmanımıza başarıyla ulaştı. En kısa sürede sizinle iletişime geçeceğiz.
                </p>
            </div>
        );
    }

    return (
        <form action={handleSubmit} className="space-y-6">
            {status?.error && (
                <div className="p-4 bg-red-50 text-red-800 rounded-lg border border-red-200">
                    {status.error}
                </div>
            )}

            {/* DİNAMİK DEPARTMAN SEÇİCİ */}
            {departments && departments.length > 0 && (
                <div className="space-y-2">
                    <Label htmlFor="subject">
                        İlgili Departman / Konu <span className="text-red-500">*</span>
                    </Label>
                    <select
                        id="subject"
                        name="subject"
                        required
                        className="flex h-12 w-full rounded-xl border border-surface-strong bg-surface px-4 py-2 text-sm text-content-strong focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all disabled:opacity-50"
                        disabled={isPending}
                    >
                        <option value="">Lütfen seçiniz...</option>
                        {departments.map((dep, i) => (
                            <option key={i} value={dep.label}>{dep.label}</option>
                        ))}
                    </select>
                </div>
            )}

            <div className="space-y-2">
                <Label htmlFor="name">
                    Ad Soyad veya Firma Ünvanı <span className="text-red-500">*</span>
                </Label>
                <Input
                    id="name"
                    name="name"
                    required
                    className="h-12 rounded-xl bg-surface focus:bg-white"
                    placeholder="Adınız veya Kurumunuz"
                    disabled={isPending}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label htmlFor="email">
                        E-Posta <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        id="email"
                        name="email"
                        type="email"
                        required
                        className="h-12 rounded-xl bg-surface focus:bg-white"
                        placeholder="ornek@sirket.com"
                        disabled={isPending}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="phone">Telefon Numaranız</Label>
                    <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        className="h-12 rounded-xl bg-surface focus:bg-white"
                        placeholder="+90 (555) 000 00 00"
                        disabled={isPending}
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="message">
                    Mesajınız / Talep Detayınız <span className="text-red-500">*</span>
                </Label>
                <Textarea
                    id="message"
                    name="message"
                    required
                    className="rounded-xl bg-surface focus:bg-white p-4"
                    placeholder="Size nasıl yardımcı olabiliriz?"
                    rows={5}
                    disabled={isPending}
                />
            </div>

            <Button
                type="submit"
                size="lg"
                className="w-full h-14 rounded-xl text-md font-bold hover:shadow-lg transition-all"
                disabled={isPending}
            >
                {isPending ? "Gönderiliyor..." : "Mesajı Gönder"}
            </Button>
        </form>
    );
}