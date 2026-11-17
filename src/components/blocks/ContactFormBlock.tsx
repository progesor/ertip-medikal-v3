import { getRequestLocale } from "@/lib/i18n/requestLocale";
import { localizeInternalHref } from "@/lib/i18n/routing";
import React from "react";
import { getPublicFooterSettings } from "@/lib/i18n/publicFooter";
import { ContactForm } from "@/components/contact/ContactForm";
import { Mail, PhoneCall, ShieldCheck } from "lucide-react";

function readText(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function findPrivacyLink(settings: any) {
  const links = Array.isArray(settings?.footer?.bottomLinks)
    ? settings.footer.bottomLinks
    : [];

  const privacyLink = links.find((link: any) => {
    const label = readText(link?.label)?.toLocaleLowerCase("tr-TR") || "";
    return label.includes("kvkk") || label.includes("aydınlatma") || label.includes("data protection") || label.includes("privacy") || label.includes("gizlilik");
  });

  return privacyLink;
}

export async function ContactFormBlock({
  title,
  formTitle,
  description,
  departments,
  quickContact,
}: any) {
  const locale = await getRequestLocale();
  const en = locale === "en";
  const settings = await getPublicFooterSettings(locale);

  const phone = readText(quickContact?.phone) || readText(settings?.contact?.phone);
  const email = readText(quickContact?.email) || readText(settings?.contact?.email);
  const privacyLink = findPrivacyLink(settings);
  const privacyHref = readText(privacyLink?.url);
  const phoneHref = phone ? `tel:${phone.replace(/[^\d+]/g, "")}` : undefined;

  return (
    <section className="bg-surface-muted/50 py-24">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-20">
          <div className="space-y-10 lg:col-span-5">
            <div>
              <h2 className="mb-6 text-4xl font-black leading-tight tracking-tight text-text-main md:text-5xl">
                {title || (en ? "Contact Us" : "Bize Ulaşın")}
              </h2>
              <p className="text-lg leading-relaxed text-text-muted">
                {description ||
                  (en ? "Contact our team about products, dealership inquiries or technical support." : "Ertip Medikal ürünleri, bayilik talepleri veya teknik destek için ekibimizle iletişime geçebilirsiniz.")}
              </p>
            </div>

            {(phone || email) && (
              <div className="space-y-6">
                {phone && phoneHref && (
                  <a
                    href={phoneHref}
                    className="group flex items-center gap-6 rounded-3xl border border-border bg-surface p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lg hover:shadow-surface-inverse/5"
                  >
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                      <PhoneCall className="h-6 w-6" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold uppercase tracking-widest text-text-muted">
                        {en ? "Support Line" : "Destek Hattı"}
                      </p>
                      <p className="break-words text-xl font-black text-text-main">
                        {phone}
                      </p>
                    </div>
                  </a>
                )}

                {email && (
                  <a
                    href={`mailto:${email}`}
                    className="group flex items-center gap-6 rounded-3xl border border-border bg-surface p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lg hover:shadow-surface-inverse/5"
                  >
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                      <Mail className="h-6 w-6" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold uppercase tracking-widest text-text-muted">
                        {en ? "Corporate Email" : "Kurumsal E-Posta"}
                      </p>
                      <p className="break-all text-xl font-black text-text-main">
                        {email}
                      </p>
                    </div>
                  </a>
                )}
              </div>
            )}

            <div className="rounded-3xl bg-primary p-8 text-primary-foreground">
              <div className="mb-3 flex items-center gap-3">
                <ShieldCheck className="h-6 w-6 text-primary-foreground" />
                <span className="font-bold text-primary-foreground">
                  {en ? "MDR and ISO Quality Standards" : "MDR & ISO Kalitesi"}
                </span>
              </div>
              <p className="text-sm italic leading-relaxed text-primary-foreground/80">
                {quickContact?.descriptionText ||
                  (en ? "We record all inquiries in line with international quality standards and respond as soon as possible." : "Tüm talepleriniz uluslararası kalite standartları çerçevesinde kayıt altına alınarak en kısa sürede yanıtlanmaktadır.")}
              </p>
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="rounded-3xl border border-border bg-surface p-8 shadow-2xl shadow-surface-inverse/5 md:p-14">
              <div className="mb-10">
                <h3 className="mb-3 text-3xl font-black text-text-main">
                  {formTitle || (en ? "Inquiry Form" : "Talep Formu")}
                </h3>
                <div className="h-1.5 w-12 rounded-full bg-primary" />
              </div>

              <ContactForm
                departments={departments}
                privacyLabel={readText(privacyLink?.label)}
                privacyHref={privacyHref ? localizeInternalHref(privacyHref, locale) : undefined}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
